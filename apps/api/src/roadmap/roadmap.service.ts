import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@skillforge/db';
import { Goal } from '@prisma/client';
import { Neo4jService } from '../common/neo4j.service';

interface RoadmapStep {
  topic_id: string;
  title: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  estimated_days: number;
  mastery_required: number;
}

@Injectable()
export class RoadmapService {
  private readonly logger = new Logger(RoadmapService.name);

  constructor(
    private readonly neo4jService: Neo4jService,
  ) {}

  /**
   * Get user's active roadmap.
   */
  async getRoadmap(userId: string) {
    const roadmap = await prisma.roadmap.findUnique({
      where: { userId },
    });

    if (!roadmap) {
      // If none exists, find user's primary goal and generate one
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { primaryGoal: true },
      });

      const goal = user?.primaryGoal ?? Goal.dsa;
      return this.regenerateRoadmap(userId, goal);
    }

    return roadmap;
  }

  /**
   * Update the user's primary learning goal and trigger a roadmap recomputation
   */
  async updateGoal(userId: string, goal: Goal) {
    // Goal changes are unlimited for all tiers — no swap restrictions.
    // 1. Update user primary goal
    await prisma.user.update({
      where: { id: userId },
      data: { primaryGoal: goal },
    });

    // 2. Recompute roadmap
    return this.regenerateRoadmap(userId, goal);
  }

  /**
   * Traverse Neo4j topic graph, sort topologically, filter by goal, and generate roadmap steps
   */
  async regenerateRoadmap(userId: string, goal: Goal) {
    // 1. Fetch all topics & prerequisites from Neo4j
    const cypher = `
      MATCH (t:Topic)
      OPTIONAL MATCH (t)-[:REQUIRES]->(p:Topic)
      RETURN t.id AS id, t.name AS name, collect(p.id) AS prereqs
    `;
    const result = await this.neo4jService.run(cypher);

    const topics = result.records.map((r) => ({
      id: r.get('id') as string,
      name: r.get('name') as string,
      prereqs: r.get('prereqs') as string[],
    }));

    // Define goal-specific topics (merging core topics with goal topics)
    const coreTopics = ['variables', 'conditions', 'loops', 'functions'];
    let goalSpecific: string[] = [];

    if (goal === Goal.dsa) {
      goalSpecific = ['arrays', 'linked_lists', 'stacks_queues', 'trees'];
    } else if (goal === Goal.competitive) {
      goalSpecific = ['arrays', 'basic_math', 'greedy'];
    } else if (goal === Goal.placements || goal === Goal.interviews) {
      goalSpecific = ['arrays', 'strings', 'searching_sorting', 'dynamic_programming'];
    }

    const targetTopicIds = new Set([...coreTopics, ...goalSpecific]);
    const filteredTopics = topics.filter((t) => targetTopicIds.has(t.id));

    // Simple Topological Sort helper
    const sortedTopicIds: string[] = [];
    const visited = new Set<string>();
    const tempVisited = new Set<string>();

    const visit = (topicId: string) => {
      if (visited.has(topicId)) return;
      if (tempVisited.has(topicId)) {
        this.logger.error('Cycle detected in Neo4j prerequisite graph');
        return;
      }

      tempVisited.add(topicId);
      const topic = filteredTopics.find((t) => t.id === topicId);
      if (topic) {
        for (const prereqId of topic.prereqs) {
          if (targetTopicIds.has(prereqId)) {
            visit(prereqId);
          }
        }
      }
      tempVisited.delete(topicId);
      visited.add(topicId);
      sortedTopicIds.push(topicId);
    };

    for (const t of filteredTopics) {
      visit(t.id);
    }

    // Fetch user's current mastery scores
    const masteryScores = await prisma.masteryScore.findMany({
      where: { userId },
    });
    const masteryMap = new Map(masteryScores.map((m) => [m.topicId, m.score]));

    // Construct roadmap steps
    const steps: RoadmapStep[] = [];
    const completedTopics = new Set<string>();

    for (const topicId of sortedTopicIds) {
      const topicInfo = filteredTopics.find((t) => t.id === topicId);
      const title = topicInfo?.name ?? topicId;
      const currentScore = masteryMap.get(topicId) ?? 0.0;
      const masteryRequired = 0.7; // Standard target threshold

      let status: 'locked' | 'unlocked' | 'in_progress' | 'completed' = 'locked';

      if (currentScore >= masteryRequired) {
        status = 'completed';
        completedTopics.add(topicId);
      } else {
        // Check if all prerequisites are completed
        const originalTopic = topics.find((t) => t.id === topicId);
        const prereqs = originalTopic?.prereqs ?? [];
        
        // Filter prerequisites to only include target topics for this goal
        const targetPrereqs = prereqs.filter((p) => targetTopicIds.has(p));
        const allPrereqsMet = targetPrereqs.every((p) => completedTopics.has(p));

        if (allPrereqsMet) {
          // If no active steps have been set to 'in_progress', make this one 'in_progress', otherwise 'unlocked'
          const hasInProgress = steps.some((s) => s.status === 'in_progress');
          status = hasInProgress ? 'unlocked' : 'in_progress';
        } else {
          status = 'locked';
        }
      }

      steps.push({
        topic_id: topicId,
        title,
        status,
        estimated_days: 5,
        mastery_required: masteryRequired,
      });
    }

    // If no steps are 'in_progress' but some are 'unlocked', promote the first 'unlocked' to 'in_progress'
    const hasInProgress = steps.some((s) => s.status === 'in_progress');
    if (!hasInProgress) {
      const firstUnlocked = steps.find((s) => s.status === 'unlocked');
      if (firstUnlocked) {
        firstUnlocked.status = 'in_progress';
      }
    }

    // Save to database
    const saved = await prisma.roadmap.upsert({
      where: { userId },
      update: {
        goal,
        steps: steps as any,
        currentStepIndex: steps.findIndex((s) => s.status === 'in_progress'),
        generatedAt: new Date(),
      },
      create: {
        userId,
        goal,
        steps: steps as any,
        currentStepIndex: steps.findIndex((s) => s.status === 'in_progress'),
      },
    });

    return saved;
  }
}
