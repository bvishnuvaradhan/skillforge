"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowRight,
  CheckCircle,
  XCircle,
  Zap,
  RotateCcw,
} from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface GameConfig {
  id: string;
  name: string;
  game_type: string;
  config: Record<string, unknown>;
  topic_tags: string[];
  xp_reward: number;
  mastery_contribution: number;
}

interface SubmitResult {
  score: number;
  passed: boolean;
  xp_earned: number;
  attempt_number: number;
  feedback: string;
}

// ──────────────────────────────────────────────
// Logic Builder Game (drag-and-drop blocks UI)
// ──────────────────────────────────────────────
function LogicBuilderGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const availableBlocks = (config.available_blocks as string[]) ?? [
    "declare_variable",
    "assign_value",
    "print_output",
    "if_condition",
    "end_if",
  ];

  const [placed, setPlaced] = useState<string[]>([]);

  const addBlock = (block: string) => setPlaced((prev) => [...prev, block]);
  const removeBlock = (idx: number) => setPlaced((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    const payload = {
      blocks: placed,
      connections: [] as Array<{ from: number; to: number }>,
      output_node: placed[placed.length - 1] ?? null,
      time_seconds: 60,
      hints_used: 0,
    };
    onSubmit(payload);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Available Blocks */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Available Blocks</h3>
          <div className="space-y-2">
            {availableBlocks.map((block) => (
              <button
                key={block}
                onClick={() => addBlock(block)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-white hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all text-left"
              >
                <Plus className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                {block.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Program Canvas */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Your Program</h3>
          <div className="min-h-48 bg-bg-elevated border border-dashed border-border rounded-lg p-3 space-y-2">
            <AnimatePresence>
              {placed.map((block, idx) => (
                <motion.div
                  key={`${block}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-brand-cyan/20 rounded-lg text-sm"
                >
                  <span className="text-xs text-text-muted font-mono w-4">{idx + 1}</span>
                  <span className="flex-1 text-white">{block.replace(/_/g, " ")}</span>
                  {idx > 0 && (
                    <ArrowRight className="w-3 h-3 text-brand-cyan mx-1 shrink-0" />
                  )}
                  <button
                    onClick={() => removeBlock(idx)}
                    className="text-text-muted hover:text-accent-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {placed.length === 0 && (
              <p className="text-text-muted text-sm text-center py-8">
                Click blocks on the left to add them here
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={placed.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Solution
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// If-Else Constructor
// ──────────────────────────────────────────────
function IfElseGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [condition, setCondition] = useState("");
  const [trueBranch, setTrueBranch] = useState("");
  const [falseBranch, setFalseBranch] = useState("");

  const handleSubmit = () => {
    onSubmit({
      condition_blocks: condition ? [condition] : [],
      true_branch: trueBranch ? [trueBranch] : [],
      false_branch: falseBranch ? [falseBranch] : [],
      time_seconds: 60,
      hints_used: 0,
    });
  };

  const placeholder = config.description as string | undefined;

  return (
    <div className="space-y-4">
      {placeholder && (
        <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg text-sm text-text-secondary">
          {placeholder}
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "IF condition", value: condition, set: setCondition, placeholder: "e.g. x > 0" },
          { label: "THEN (true branch)", value: trueBranch, set: setTrueBranch, placeholder: "e.g. print('positive')" },
          { label: "ELSE (false branch)", value: falseBranch, set: setFalseBranch, placeholder: "e.g. print('negative')" },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-xs text-text-muted mb-1.5 block">{field.label}</label>
            <textarea
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-cyan/50 h-24 font-mono"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!condition}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Solution
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Loop Builder
// ──────────────────────────────────────────────
function LoopBuilderGame({
  onSubmit,
}: {
  config?: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [loopType, setLoopType] = useState("for");
  const [iterations, setIterations] = useState(5);
  const [bodyBlocks, setBodyBlocks] = useState<string[]>([]);

  const addBodyBlock = () => setBodyBlocks((prev) => [...prev, "print(i)"]);
  const removeBodyBlock = (idx: number) => setBodyBlocks((prev) => prev.filter((_, i) => i !== idx));
  const updateBodyBlock = (idx: number, val: string) =>
    setBodyBlocks((prev) => prev.map((b, i) => (i === idx ? val : b)));

  const handleSubmit = () => {
    onSubmit({
      loop_type: loopType,
      iteration_count: iterations,
      body_blocks: bodyBlocks,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Loop Type</label>
          <select
            value={loopType}
            onChange={(e) => setLoopType(e.target.value)}
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
          >
            <option value="for">for loop</option>
            <option value="while">while loop</option>
            <option value="do_while">do-while loop</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Iterations / Count</label>
          <input
            type="number"
            value={iterations}
            onChange={(e) => setIterations(parseInt(e.target.value, 10))}
            min={1}
            max={100}
            className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-text-muted">Loop Body</label>
          <button
            onClick={addBodyBlock}
            className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add statement
          </button>
        </div>
        <div className="space-y-2 min-h-16">
          {bodyBlocks.map((block, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={block}
                onChange={(e) => updateBodyBlock(idx, e.target.value)}
                className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan/50"
              />
              <button onClick={() => removeBodyBlock(idx)} className="text-text-muted hover:text-accent-red transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {bodyBlocks.length === 0 && (
            <p className="text-text-muted text-xs text-center py-3">No statements yet. Click &ldquo;Add statement&rdquo; above.</p>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={bodyBlocks.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Solution
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// BFS Explorer Game
// ──────────────────────────────────────────────
function BfsExplorerGame({
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [visited, setVisited] = useState<string[]>([]);
  const [queueStates, setQueueStates] = useState<string[][]>([]);
  const [errorNode, setErrorNode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string[] | null>(null);

  const startNode = "A";
  const graph: Record<string, string[]> = {
    A: ["B", "C"],
    B: ["D", "E"],
    C: ["F"],
    D: [],
    E: [],
    F: [],
  };

  const nodePositions: Record<string, { x: number; y: number }> = {
    A: { x: 200, y: 40 },
    B: { x: 100, y: 130 },
    C: { x: 300, y: 130 },
    D: { x: 50, y: 220 },
    E: { x: 150, y: 220 },
    F: { x: 300, y: 220 },
  };

  const edges = [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "D" },
    { from: "B", to: "E" },
    { from: "C", to: "F" },
  ];

  const path1 = ["A", "B", "C", "D", "E", "F"];
  const path2 = ["A", "C", "B", "F", "D", "E"];

  const handleNodeClick = (node: string) => {
    if (visited.includes(node)) return;

    setErrorNode(null);
    setErrorMessage(null);

    if (visited.length === 0) {
      if (node === "A") {
        setVisited(["A"]);
        setQueueStates([["A"], ["B", "C"]]);
      } else {
        triggerError(node, "BFS traversal must start at the root node 'A'.");
      }
      return;
    }

    let targetPath = activePath;
    if (visited.length === 1 && visited[0] === "A") {
      if (node === "B") {
        targetPath = path1;
        setActivePath(path1);
      } else if (node === "C") {
        targetPath = path2;
        setActivePath(path2);
      } else {
        triggerError(node, "Invalid step! From node 'A', the next node to visit must be 'B' or 'C' (front of the queue).");
        return;
      }
    }

    if (!targetPath) return;

    const expectedNode = targetPath[visited.length];
    if (node === expectedNode) {
      const newVisited = [...visited, node];
      setVisited(newVisited);
      const currentQueue = computeQueue(newVisited, targetPath);
      setQueueStates((prev) => [...prev, currentQueue]);
    } else {
      const nextExpected = expectedNode;
      const reason = `Invalid step! In BFS, we explore level by level. Node '${nextExpected}' is at the front of the queue and must be visited next.`;
      triggerError(node, reason);
    }
  };

  const triggerError = (node: string, msg: string) => {
    setErrorNode(node);
    setErrorMessage(msg);
    toast.error(msg);
    setTimeout(() => {
      setErrorNode(null);
    }, 1000);
  };

  const computeQueue = (visitedList: string[], targetPath: string[]): string[] => {
    const order = targetPath;
    const queue: string[] = ["A"];
    const visitedSet = new Set<string>();
    const queuedSet = new Set<string>(["A"]);

    for (const v of visitedList) {
      visitedSet.add(v);
      if (queue[0] === v) {
        queue.shift();
        const children = graph[v] ?? [];
        const sortedChildren = [...children].sort((x, y) => order.indexOf(x) - order.indexOf(y));
        for (const child of sortedChildren) {
          if (!visitedSet.has(child) && !queuedSet.has(child)) {
            queue.push(child);
            queuedSet.add(child);
          }
        }
      }
    }
    return queue;
  };

  const resetGame = () => {
    setVisited([]);
    setQueueStates([]);
    setErrorNode(null);
    setErrorMessage(null);
    setActivePath(null);
  };

  const handleSubmit = () => {
    onSubmit({
      start_node: startNode,
      visited_order: visited,
      queue_states: queueStates,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg text-sm text-text-secondary">
        <strong>Goal:</strong> Perform a Breadth-First Search (BFS) starting from node <strong>A</strong>.
        Click the nodes in the correct BFS traversal order (level-by-level).
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-80 relative select-none">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: "280px" }}>
            {edges.map((edge, idx) => {
              const fromPos = nodePositions[edge.from];
              const toPos = nodePositions[edge.to];
              if (!fromPos || !toPos) return null;

              const isFromVisited = visited.includes(edge.from);
              const isToVisited = visited.includes(edge.to);
              const isBothVisited = isFromVisited && isToVisited;

              return (
                <line
                  key={idx}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isBothVisited ? "#00B4D8" : isFromVisited ? "#7B2FBE" : "#1E2B45"}
                  strokeWidth={isBothVisited ? 3 : 2}
                  strokeDasharray={isFromVisited && !isToVisited ? "5,5" : undefined}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          <div className="relative w-full h-64">
            {Object.entries(nodePositions).map(([nodeName, pos]) => {
              const isVisited = visited.includes(nodeName);
              const isCurrent = visited[visited.length - 1] === nodeName;
              const isError = errorNode === nodeName;

              let nodeClass = "bg-bg-secondary text-white border-border hover:border-brand-cyan/50";
              if (isVisited) {
                nodeClass = "bg-brand-cyan text-bg-primary border-brand-cyan shadow-[0_0_15px_rgba(0,180,216,0.5)]";
              }
              if (isCurrent) {
                nodeClass = "bg-brand-cyan text-bg-primary border-brand-cyan ring-4 ring-brand-cyan/30 animate-pulse";
              }
              if (isError) {
                nodeClass = "bg-accent-red text-white border-accent-red shadow-[0_0_15px_rgba(239,68,68,0.8)]";
              }

              return (
                <motion.button
                  key={nodeName}
                  onClick={() => handleNodeClick(nodeName)}
                  style={{ left: pos.x - 24, top: pos.y - 24 }}
                  className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border transition-all z-10 ${nodeClass}`}
                  animate={isError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {nodeName}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={resetGame}
            className="absolute top-4 right-4 text-xs text-text-muted hover:text-white flex items-center gap-1 bg-bg-secondary px-2.5 py-1 rounded-md border border-border"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border rounded-xl p-4">
            <h4 className="text-xs text-text-secondary mb-2 font-medium">Visited Order</h4>
            <div className="flex flex-wrap gap-2 min-h-10 items-center">
              {visited.map((v, i) => (
                <span key={i} className="px-2.5 py-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-sm font-mono rounded">
                  {v}
                </span>
              ))}
              {visited.length === 0 && <span className="text-xs text-text-muted">Click graph nodes to visit</span>}
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4">
            <h4 className="text-xs text-text-secondary mb-2 font-medium">Queue Progression</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {queueStates.map((state, idx) => (
                <div key={idx} className="flex items-center gap-2 text-text-secondary">
                  <span className="text-text-muted font-mono w-12">Step {idx}:</span>
                  <span className="text-white bg-bg-primary px-2 py-0.5 rounded border border-border">
                    [{state.join(", ")}]
                  </span>
                </div>
              ))}
              {queueStates.length === 0 && <span className="text-xs text-text-muted">No queue logs yet</span>}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-accent-red/10 border border-accent-red/20 rounded-xl text-xs text-accent-red flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={visited.length < 6}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 animate-fade-in"
      >
        Submit Traversal
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// DFS Adventure Game
// ──────────────────────────────────────────────
function DfsAdventureGame({
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [visited, setVisited] = useState<string[]>([]);
  const [stackStates, setStackStates] = useState<string[][]>([]);
  const [errorNode, setErrorNode] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string[] | null>(null);

  const startNode = "A";
  const graph: Record<string, string[]> = {
    A: ["B", "C"],
    B: ["D", "E"],
    C: ["F"],
    D: [],
    E: [],
    F: [],
  };

  const nodePositions: Record<string, { x: number; y: number }> = {
    A: { x: 200, y: 40 },
    B: { x: 100, y: 130 },
    C: { x: 300, y: 130 },
    D: { x: 50, y: 220 },
    E: { x: 150, y: 220 },
    F: { x: 300, y: 220 },
  };

  const edges = [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "B", to: "D" },
    { from: "B", to: "E" },
    { from: "C", to: "F" },
  ];

  const allowedPaths = [
    ["A", "B", "D", "E", "C", "F"],
    ["A", "B", "E", "D", "C", "F"],
    ["A", "C", "F", "B", "D", "E"],
    ["A", "C", "F", "B", "E", "D"],
  ];

  const handleNodeClick = (node: string) => {
    if (visited.includes(node)) return;

    setErrorNode(null);

    const newVisited = [...visited, node];

    const matchingPath = allowedPaths.find((path) => {
      return path.slice(0, newVisited.length).join(",") === newVisited.join(",");
    });

    if (matchingPath) {
      setVisited(newVisited);
      setActivePath(matchingPath);
      const currentStack = computeStack(newVisited, matchingPath);
      setStackStates((prev) => [...prev, currentStack]);
    } else {
      let nextExpected = "";
      if (activePath && activePath[visited.length]) {
        nextExpected = activePath[visited.length] || "";
      } else {
        const candidates = allowedPaths
          .filter((path) => path.slice(0, visited.length).join(",") === visited.join(","))
          .map((path) => path[visited.length] || "");
        const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));
        nextExpected = uniqueCandidates.join(" or ");
      }

      const msg = `Invalid step! In DFS, we explore deep before back-tracking. Expected node: ${nextExpected}.`;
      triggerError(node, msg);
    }
  };

  const triggerError = (node: string, msg: string) => {
    setErrorNode(node);
    toast.error(msg);
    setTimeout(() => {
      setErrorNode(null);
    }, 1000);
  };

  const computeStack = (visitedList: string[], targetPath: string[]): string[] => {
    const stack: string[] = ["A"];
    const visitedSet = new Set<string>();

    for (const v of visitedList) {
      if (stack[stack.length - 1] === v) {
        stack.pop();
        visitedSet.add(v);
        const children = graph[v] ?? [];
        const sortedChildren = [...children].sort((x, y) => {
          return targetPath.indexOf(y) - targetPath.indexOf(x);
        });
        for (const child of sortedChildren) {
          if (!visitedSet.has(child) && !stack.includes(child)) {
            stack.push(child);
          }
        }
      }
    }
    return stack;
  };

  const resetGame = () => {
    setVisited([]);
    setStackStates([]);
    setErrorNode(null);
    setActivePath(null);
  };

  const handleSubmit = () => {
    onSubmit({
      start_node: startNode,
      visited_order: visited,
      stack_states: stackStates,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-accent-purple/5 border border-accent-purple/20 rounded-lg text-sm text-text-secondary">
        <strong>Goal:</strong> Perform a Depth-First Search (DFS) starting from node <strong>A</strong>.
        Click the nodes in the correct DFS traversal order (depth-first).
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-elevated border border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-80 relative select-none">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: "280px" }}>
            {edges.map((edge, idx) => {
              const fromPos = nodePositions[edge.from];
              const toPos = nodePositions[edge.to];
              if (!fromPos || !toPos) return null;

              const isFromVisited = visited.includes(edge.from);
              const isToVisited = visited.includes(edge.to);
              const isBothVisited = isFromVisited && isToVisited;

              return (
                <line
                  key={idx}
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke={isBothVisited ? "#7B2FBE" : isFromVisited ? "#00B4D8" : "#1E2B45"}
                  strokeWidth={isBothVisited ? 3 : 2}
                  strokeDasharray={isFromVisited && !isToVisited ? "5,5" : undefined}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          <div className="relative w-full h-64">
            {Object.entries(nodePositions).map(([nodeName, pos]) => {
              const isVisited = visited.includes(nodeName);
              const isCurrent = visited[visited.length - 1] === nodeName;
              const isError = errorNode === nodeName;

              let nodeClass = "bg-bg-secondary text-white border-border hover:border-accent-purple/50";
              if (isVisited) {
                nodeClass = "bg-accent-purple text-white border-accent-purple shadow-[0_0_15px_rgba(123,47,190,0.5)]";
              }
              if (isCurrent) {
                nodeClass = "bg-accent-purple text-white border-accent-purple ring-4 ring-accent-purple/30 animate-pulse";
              }
              if (isError) {
                nodeClass = "bg-accent-red text-white border-accent-red shadow-[0_0_15px_rgba(239,68,68,0.8)]";
              }

              return (
                <motion.button
                  key={nodeName}
                  onClick={() => handleNodeClick(nodeName)}
                  style={{ left: pos.x - 24, top: pos.y - 24 }}
                  className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border transition-all z-10 ${nodeClass}`}
                  animate={isError ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {nodeName}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={resetGame}
            className="absolute top-4 right-4 text-xs text-text-muted hover:text-white flex items-center gap-1 bg-bg-secondary px-2.5 py-1 rounded-md border border-border"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border rounded-xl p-4">
            <h4 className="text-xs text-text-secondary mb-2 font-medium">Visited Order</h4>
            <div className="flex flex-wrap gap-2 min-h-10 items-center">
              {visited.map((v, i) => (
                <span key={i} className="px-2.5 py-1 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-mono rounded">
                  {v}
                </span>
              ))}
              {visited.length === 0 && <span className="text-xs text-text-muted">Click graph nodes to visit</span>}
            </div>
          </div>

          <div className="bg-bg-secondary border border-border rounded-xl p-4">
            <h4 className="text-xs text-text-secondary mb-2 font-medium">Stack Progression</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {stackStates.map((state, idx) => (
                <div key={idx} className="flex items-center gap-2 text-text-secondary">
                  <span className="text-text-muted font-mono w-12">Step {idx}:</span>
                  <span className="text-white bg-bg-primary px-2 py-0.5 rounded border border-border">
                    [{state.join(", ")}]
                  </span>
                </div>
              ))}
              {stackStates.length === 0 && <span className="text-xs text-text-muted">No stack logs yet</span>}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={visited.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Traversal
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Recursion Maze Game
// ──────────────────────────────────────────────
function RecursionMazeGame({
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [baseCase, setBaseCase] = useState("");
  const [recursiveCase, setRecursiveCase] = useState("");
  const [callStack, setCallStack] = useState<string[]>([]);
  const [newFrame, setNewFrame] = useState("");
  const [isCrashed, setIsCrashed] = useState(false);
  const [crashReason, setCrashReason] = useState<string | null>(null);

  const normalizedExpected = ["factorial(3)", "factorial(2)", "factorial(1)", "factorial(0)"];

  const mazePath = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 3, y: 1 },
    { x: 3, y: 2 },
  ];

  const getStackValidation = () => {
    let validCount = 0;
    let hasError = false;
    let firstErrorIdx = -1;

    for (let i = 0; i < callStack.length; i++) {
      const frameVal = callStack[i];
      if (!frameVal) continue;
      const frameNorm = frameVal.replace(/\s+/g, "").toLowerCase();
      const isExpected =
        frameNorm === normalizedExpected[i] ||
        (i === 3 && frameNorm === "factorial(0)") ||
        (i === 3 && frameNorm === "factorial(1)") ||
        (i === 2 && frameNorm === "factorial(1)") ||
        (i === 2 && frameNorm === "factorial(0)");

      if (isExpected && !hasError) {
        validCount++;
      } else {
        hasError = true;
        if (firstErrorIdx === -1) firstErrorIdx = i;
      }
    }

    return { validCount, hasError, firstErrorIdx };
  };

  const { validCount, hasError, firstErrorIdx } = getStackValidation();
  const currentCharPos = (hasError ? mazePath[firstErrorIdx] : null) || mazePath[Math.min(validCount, mazePath.length - 1)] || { x: 0, y: 0 };

  const addFrame = () => {
    if (!newFrame.trim()) return;

    setIsCrashed(false);
    setCrashReason(null);

    const frameNorm = newFrame.trim().replace(/\s+/g, "").toLowerCase();
    const expectedFrame = normalizedExpected[callStack.length];

    if (callStack.length >= normalizedExpected.length) {
      triggerCrash("Stack Overflow! Recursion exceeded n=3 limit.");
      return;
    }

    const isCorrect =
      frameNorm === expectedFrame ||
      (callStack.length === 3 && (frameNorm === "factorial(0)" || frameNorm === "factorial(1)"));

    if (isCorrect) {
      setCallStack((prev) => [...prev, newFrame.trim()]);
      setNewFrame("");
    } else {
      triggerCrash(`Call Stack Frame Error! Expected: '${expectedFrame}' for next call.`);
    }
  };

  const triggerCrash = (reason: string) => {
    setIsCrashed(true);
    setCrashReason(reason);
    toast.error(reason);
    setTimeout(() => {
      setIsCrashed(false);
    }, 1000);
  };

  const removeFrame = (idx: number) => {
    setCallStack((prev) => prev.filter((_, i) => i !== idx));
    setIsCrashed(false);
    setCrashReason(null);
  };

  const resetGame = () => {
    setBaseCase("");
    setRecursiveCase("");
    setCallStack([]);
    setNewFrame("");
    setIsCrashed(false);
    setCrashReason(null);
  };

  const handleSubmit = () => {
    onSubmit({
      base_case: baseCase,
      recursive_case: recursiveCase,
      call_stack: callStack,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  const getCellType = (x: number, y: number) => {
    if (x === 3 && y === 2) return "exit";
    if (x === 0 && y === 0) return "start";
    const isPath = mazePath.some((p) => p.x === x && p.y === y);
    return isPath ? "path" : "wall";
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg text-sm text-text-secondary">
        <strong>Goal:</strong> Complete the recursive function description and construct the call stack trace representing the execution for input <strong>n = 3</strong> to escape the recursion maze.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-bg-elevated border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] relative select-none overflow-hidden">
          <h4 className="text-xs text-text-secondary mb-3 font-medium self-start">Recursion Maze Map</h4>
          <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
            {Array.from({ length: 3 }).map((_, y) => (
              <div key={y} className="contents">
                {Array.from({ length: 4 }).map((_, x) => {
                  const cellType = getCellType(x, y);
                  const isCharHere = currentCharPos.x === x && currentCharPos.y === y;

                  let cellClass = "bg-bg-primary/50 border-border/20";
                  if (cellType === "wall") {
                    cellClass = "bg-[#1A1F35]/30 border-transparent text-text-muted";
                  } else if (cellType === "start") {
                    cellClass = "bg-accent-purple/10 border-accent-purple/40 shadow-[inset_0_0_8px_rgba(123,47,190,0.2)]";
                  } else if (cellType === "path") {
                    cellClass = "bg-bg-secondary border-border/60";
                  } else if (cellType === "exit") {
                    cellClass = "bg-accent-green/10 border-accent-green/40 shadow-[0_0_10px_rgba(6,214,160,0.2)]";
                  }

                  return (
                    <div
                      key={x}
                      className={`h-16 border rounded-lg flex items-center justify-center relative transition-all duration-300 ${cellClass}`}
                    >
                      {cellType === "start" && <span className="absolute top-1 left-1 text-[8px] text-accent-purple font-mono">IN</span>}
                      {cellType === "exit" && <span className="absolute bottom-1 right-1 text-[8px] text-accent-green font-mono">OUT</span>}

                      {isCharHere && (
                        <motion.div
                          layoutId="char"
                          animate={isCrashed ? { x: [0, -8, 8, -8, 8, 0], y: [0, 5, -15, 5, 0], rotate: [0, 15, -15, 0] } : {}}
                          transition={{ duration: 0.5 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg z-20 ${
                            isCrashed ? "bg-accent-red text-white" : "bg-brand-cyan text-bg-primary"
                          }`}
                        >
                          🤖
                        </motion.div>
                      )}
                      {!isCharHere && cellType === "path" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-text-muted/40" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {crashReason && (
            <div className="absolute inset-x-4 bottom-4 p-2 bg-accent-red/20 border border-accent-red/30 rounded-lg text-center text-xs text-accent-red animate-pulse">
              💥 {crashReason}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-secondary">Function Builder</h3>
            <div className="bg-bg-elevated border border-border rounded-xl p-4 space-y-4 font-mono text-sm">
              <div>
                <span className="text-accent-purple">function</span> <span className="text-brand-cyan">factorial</span>(n) &#123;
              </div>

              <div className="pl-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-xs">{"// Base Case"}</span>
                </div>
                <input
                  value={baseCase}
                  onChange={(e) => setBaseCase(e.target.value)}
                  placeholder="if (n === 0) return 1;"
                  className="w-full bg-bg-secondary border border-border rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-brand-cyan/50"
                />

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-text-muted text-xs">{"// Recursive Case"}</span>
                </div>
                <input
                  value={recursiveCase}
                  onChange={(e) => setRecursiveCase(e.target.value)}
                  placeholder="return n * factorial(n - 1);"
                  className="w-full bg-bg-secondary border border-border rounded px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-brand-cyan/50"
                />
              </div>

              <div>&#125;</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium text-text-secondary">Call Stack Builder (n=3)</h3>
              <button onClick={resetGame} className="text-xs text-text-muted hover:text-white transition-colors">Reset</button>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-4 space-y-4">
              <div className="flex gap-2">
                <input
                  value={newFrame}
                  onChange={(e) => setNewFrame(e.target.value)}
                  placeholder="e.g. factorial(3)"
                  className="flex-1 bg-bg-elevated border border-border rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-cyan/50 font-mono"
                  onKeyDown={(e) => e.key === "Enter" && addFrame()}
                />
                <button
                  onClick={addFrame}
                  className="px-3 py-1.5 bg-brand-cyan text-bg-primary text-xs font-semibold rounded hover:bg-brand-cyan/90 transition-colors"
                >
                  Push
                </button>
              </div>

              <div className="border border-dashed border-border rounded-lg p-3 min-h-[144px] flex flex-col-reverse gap-2">
                {callStack.map((frame, idx) => {
                  const isErrFrame = hasError && idx >= firstErrorIdx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`flex items-center justify-between px-3 py-2 border rounded font-mono text-xs text-white ${
                        isErrFrame
                          ? "bg-accent-red/10 border-accent-red/40"
                          : "bg-bg-elevated border-brand-cyan/30"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="text-[10px] text-text-muted">👻</span>
                        {frame}
                      </span>
                      <button onClick={() => removeFrame(idx)} className="text-text-muted hover:text-accent-red">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
                {callStack.length === 0 && (
                  <p className="text-text-muted text-xs text-center py-8">
                    Stack is empty. Push frames (from bottom to top).
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!baseCase || !recursiveCase || callStack.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Solution
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Result Screen
// ──────────────────────────────────────────────
function ResultScreen({ result, onRetry, worldSlug }: { result: SubmitResult; onRetry: () => void; worldSlug: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="mb-4">
        {result.passed ? (
          <CheckCircle className="w-16 h-16 text-accent-green mx-auto" />
        ) : (
          <XCircle className="w-16 h-16 text-accent-red mx-auto" />
        )}
      </div>
      <h2 className="text-2xl font-heading font-bold text-white mb-2">
        {result.passed ? "Challenge Cleared! 🎉" : "Not Quite..."}
      </h2>
      <p className="text-text-secondary mb-2">{result.feedback}</p>
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-white">{Math.round(result.score * 100)}%</p>
          <p className="text-xs text-text-muted">Score</p>
        </div>
        {result.passed && (
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-accent-orange">+{result.xp_earned}</p>
            <p className="text-xs text-text-muted">XP earned</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-2xl font-mono font-bold text-text-secondary">#{result.attempt_number}</p>
          <p className="text-xs text-text-muted">Attempt</p>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        {!result.passed && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-text-secondary hover:text-white hover:border-white/20 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        )}
        <Link
          href={`/worlds/${worldSlug}`}
          className="px-5 py-2.5 rounded-xl bg-brand-cyan text-bg-primary font-medium hover:bg-brand-cyan/90 transition-colors"
        >
          {result.passed ? "Continue World" : "Back to World"}
        </Link>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main Game Arena Page
// ──────────────────────────────────────────────
export default function GameArenaPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const [game, setGame] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetch<GameConfig>(`/games/${id}`)
      .then((res: { data: GameConfig }) => setGame(res.data))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("This game is locked. Unlock the world first.");
          router.push(`/worlds`);
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await apiFetch<SubmitResult>(`/games/${id}/submit`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult(res.data);
      if (res.data.passed) {
        toast.success(`Game completed! +${res.data.xp_earned} XP 🎉`);
      }
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-bg-elevated rounded w-40 mb-6" />
        <div className="h-96 bg-bg-secondary rounded-2xl border border-border" />
      </div>
    );
  }

  if (!game) return null;

  const renderGame = () => {
    if (submitting) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Evaluating your solution...</p>
        </div>
      );
    }

    if (result) {
      return <ResultScreen result={result} onRetry={() => setResult(null)} worldSlug={slug} />;
    }

    switch (game.game_type) {
      case "ifelse_constructor":
        return <IfElseGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "loop_builder":
        return <LoopBuilderGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "bfs_explorer":
        return <BfsExplorerGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "dfs_adventure":
        return <DfsAdventureGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "recursion_maze":
        return <RecursionMazeGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      default:
        // logic_builder and all others
        return <LogicBuilderGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href={`/worlds/${slug}`}
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to World
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border border-border rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-accent-purple/10 to-brand-cyan/5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-accent-purple" />
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  {game.game_type.replace(/_/g, " ")}
                </span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-white">{game.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {game.topic_tags.map((tag) => (
                  <span key={tag} className="text-xs bg-bg-elevated text-text-muted px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                <span className="text-xs text-accent-orange font-mono">+{game.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={result ? "result" : "game"}>
              {renderGame()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
