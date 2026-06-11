import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver!: Driver;
  private readonly logger = new Logger(Neo4jService.name);

  onModuleInit() {
    const uri = process.env.NEO4J_URI ?? 'bolt://localhost:7687';
    const username = process.env.NEO4J_USERNAME ?? 'neo4j';
    const password = process.env.NEO4J_PASSWORD ?? 'password';

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
      this.logger.log(`Neo4j driver initialized for: ${uri}`);
      void this.initGraph();
    } catch (error) {
      this.logger.error('Failed to initialize Neo4j driver:', error);
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
      this.logger.log('Neo4j driver closed.');
    }
  }

  getSession(): Session {
    return this.driver.session();
  }

  async run(cypher: string, params: Record<string, unknown> = {}): Promise<QueryResult> {
    const session = this.getSession();
    try {
      return await session.run(cypher, params);
    } finally {
      await session.close();
    }
  }

  /**
   * Initialize the knowledge graph with topic nodes and prerequisite relationships.
   * Idempotent — uses MERGE so safe to call multiple times.
   */
  private async initGraph(): Promise<void> {
    try {
      // Create topic nodes
      const topics = [
        { id: 'variables', name: 'Variables & Data Types', world: 'variables-kingdom' },
        { id: 'conditions', name: 'Conditionals & Control Flow', world: 'conditions-valley' },
        { id: 'loops', name: 'Loops & Iteration', world: 'loop-forest' },
        { id: 'arrays', name: 'Arrays & Lists', world: 'loop-forest' },
        { id: 'functions', name: 'Functions', world: 'loop-forest' },
      ];

      for (const topic of topics) {
        await this.run(
          `MERGE (t:Topic {id: $id})
           SET t.name = $name, t.world = $world`,
          topic,
        );
      }

      // Create prerequisite edges
      const prereqs = [
        { from: 'conditions', to: 'variables' },
        { from: 'loops', to: 'conditions' },
        { from: 'arrays', to: 'loops' },
        { from: 'functions', to: 'variables' },
      ];

      for (const edge of prereqs) {
        await this.run(
          `MATCH (a:Topic {id: $from}), (b:Topic {id: $to})
           MERGE (a)-[:REQUIRES]->(b)`,
          edge,
        );
      }

      this.logger.log('Neo4j knowledge graph initialized.');
    } catch (error) {
      // Neo4j might not be available in all environments — log warning, don't crash
      this.logger.warn('Neo4j graph init skipped (Neo4j may not be running):', (error as Error).message);
    }
  }

  /**
   * Get all prerequisite topic IDs for a given topic
   */
  async getPrerequisites(topicId: string): Promise<string[]> {
    try {
      const result = await this.run(
        `MATCH (t:Topic {id: $topicId})-[:REQUIRES]->(prereq:Topic)
         RETURN prereq.id AS prereqId`,
        { topicId },
      );
      return result.records.map((r) => r.get('prereqId') as string);
    } catch {
      return [];
    }
  }
}
