/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/jsx-no-comment-textnodes */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Zap,
  RotateCcw,
  Play,
  Info,
  Check,
  Cpu,
  Terminal,
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
// Language Mappings & Adaptations
// ──────────────────────────────────────────────
const LOGIC_BLOCK_LABELS: Record<string, Record<string, string>> = {
  declare_variable: {
    JAVASCRIPT: "let score;",
    PYTHON: "# (No explicit declaration needed in Python)",
    JAVA: "int score;",
    C: "int score;",
    CPP: "int score;"
  },
  assign_value: {
    JAVASCRIPT: "score = 100;",
    PYTHON: "score = 100",
    JAVA: "score = 100;",
    C: "score = 100;",
    CPP: "score = 100;"
  },
  print_output: {
    JAVASCRIPT: "console.log(score);",
    PYTHON: "print(score)",
    JAVA: "System.out.println(score);",
    C: 'printf("%d\\n", score);',
    CPP: "std::cout << score << std::endl;"
  },
  if_condition: {
    JAVASCRIPT: "if (score === 100) {",
    PYTHON: "if score == 100:",
    JAVA: "if (score == 100) {",
    C: "if (score == 100) {",
    CPP: "if (score == 100) {"
  },
  end_if: {
    JAVASCRIPT: "}",
    PYTHON: "# (End of block indentation)",
    JAVA: "}",
    C: "}",
    CPP: "}"
  }
};

const IFELSE_PLACEHOLDERS: Record<string, { cond: string; trueB: string; falseB: string }> = {
  JAVASCRIPT: { cond: "x > 0", trueB: "console.log('positive');", falseB: "console.log('negative');" },
  PYTHON: { cond: "x > 0", trueB: "print('positive')", falseB: "print('negative')" },
  JAVA: { cond: "x > 0", trueB: "System.out.println(\"positive\");", falseB: "System.out.println(\"negative\");" },
  C: { cond: "x > 0", trueB: 'printf("positive\\n");', falseB: 'printf("negative\\n");' },
  CPP: { cond: "x > 0", trueB: 'std::cout << "positive" << std::endl;', falseB: 'std::cout << "negative" << std::endl;' }
};

const RECURSION_PLACEHOLDERS: Record<string, { base: string; recurse: string }> = {
  JAVASCRIPT: { base: "if (n <= 1) return 1;", recurse: "return n * factorial(n - 1);" },
  PYTHON: { base: "if n <= 1: return 1", recurse: "return n * factorial(n - 1)" },
  JAVA: { base: "if (n <= 1) return 1;", recurse: "return n * Solution.factorial(n - 1);" },
  C: { base: "if (n <= 1) return 1;", recurse: "return n * factorial(n - 1);" },
  CPP: { base: "if (n <= 1) return 1;", recurse: "return n * factorial(n - 1);" }
};

// ──────────────────────────────────────────────
// Logic Builder Game (Module 1)
// ──────────────────────────────────────────────
function LogicBuilderGame({
  config,
  onSubmit,
  userTrack
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
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
          <h3 className="text-sm font-medium text-text-secondary mb-3">Available Code Blocks</h3>
          <div className="space-y-2">
            {availableBlocks.map((block) => (
              <button
                key={block}
                onClick={() => addBlock(block)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-bg-elevated border border-border rounded-lg text-sm text-white hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all text-left font-mono"
              >
                <Plus className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                {LOGIC_BLOCK_LABELS[block]?.[(userTrack || "JAVASCRIPT").toUpperCase()] ?? block.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Program Canvas */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">Your Program Layout</h3>
          <div className="min-h-48 bg-bg-elevated border border-dashed border-border rounded-lg p-3 space-y-2">
            <AnimatePresence>
              {placed.map((block, idx) => (
                <motion.div
                  key={`${block}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between px-3 py-2 bg-bg-secondary border border-border rounded-lg font-mono text-sm text-white"
                >
                  <span>{LOGIC_BLOCK_LABELS[block]?.[(userTrack || "JAVASCRIPT").toUpperCase()] ?? block.replace(/_/g, " ")}</span>
                  <button
                    onClick={() => removeBlock(idx)}
                    className="text-text-muted hover:text-accent-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {placed.length === 0 && (
              <p className="text-text-muted text-xs text-center py-12">
                Click blocks on the left to add them to your program sequence.
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={placed.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Compile & Run Program
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Module 2 Game: Stream Matching
// ──────────────────────────────────────────────
function StreamMatchingGame({
  onSubmit,
  userTrack
}: {
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const steps = [
    { id: "s1", desc: "1. Prompt user for input 'Enter age: '" },
    { id: "s2", desc: "2. Read integer from user into variable `age`" },
    { id: "s3", desc: "3. Format and print 'Age is {age} years'" },
    { id: "s4", desc: "4. Print a trailing new line character" }
  ];

  const codePool: Record<string, Array<{ id: string; code: string }>> = {
    C: [
      { id: "c1", code: 'printf("Enter age: ");' },
      { id: "c2", code: 'scanf("%d", &age);' },
      { id: "c3", code: 'printf("Age is %d years", age);' },
      { id: "c4", code: 'printf("\\n");' }
    ],
    CPP: [
      { id: "cp1", code: 'std::cout << "Enter age: ";' },
      { id: "cp2", code: 'std::cin >> age;' },
      { id: "cp3", code: 'std::cout << "Age is " << age << " years";' },
      { id: "cp4", code: 'std::cout << std::endl;' }
    ],
    JAVA: [
      { id: "j1", code: 'System.out.print("Enter age: ");' },
      { id: "j2", code: 'age = scanner.nextInt();' },
      { id: "j3", code: 'System.out.print("Age is " + age + " years");' },
      { id: "j4", code: 'System.out.println();' }
    ],
    PYTHON: [
      { id: "p1", code: 'print("Enter age: ", end="")' },
      { id: "p2", code: 'age = int(input())' },
      { id: "p3", code: 'print(f"Age is {age} years", end="")' },
      { id: "p4", code: 'print()' }
    ],
    JAVASCRIPT: [
      { id: "js1", code: 'process.stdout.write("Enter age: ");' },
      { id: "js2", code: 'let age = parseInt(readline());' },
      { id: "js3", code: 'process.stdout.write("Age is " + age + " years");' },
      { id: "js4", code: 'console.log();' }
    ]
  };

  const pool = codePool[(userTrack || "JAVASCRIPT").toUpperCase()] || codePool.JAVASCRIPT || [];
  
  // Shuffled code choices
  const [shuffledCode, setShuffledCode] = useState<Array<{ id: string; code: string }>>([]);
  const [matches, setMatches] = useState<Record<string, string>>({}); // stepId -> codeId
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  useEffect(() => {
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setShuffledCode(shuffled);
  }, [userTrack]);

  const handleStepClick = (stepId: string) => {
    setSelectedStep(stepId);
  };

  const handleCodeClick = (codeId: string) => {
    if (!selectedStep) return;
    setMatches((prev) => ({ ...prev, [selectedStep]: codeId }));
    setSelectedStep(null);
  };

  const clearMatch = (stepId: string) => {
    setMatches((prev) => {
      const copy = { ...prev };
      delete copy[stepId];
      return copy;
    });
  };

  const handleSubmit = () => {
    // Grade match
    let correct = 0;
    const matchPairs = Object.entries(matches);
    
    matchPairs.forEach(([stepId, codeId]) => {
      const stepIdx = steps.findIndex((s) => s.id === stepId);
      const expectedCodeId = pool[stepIdx]?.id;
      if (codeId === expectedCodeId) {
        correct++;
      }
    });

    const isPassed = correct === 4;
    onSubmit({
      score: correct / 4,
      passed: isPassed,
      time_seconds: 60,
      matched_count: correct
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg text-sm text-text-secondary">
        Select a stream execution step on the left, then click the correct matching statement on the right.
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Side: Stream Steps */}
        <div className="space-y-3">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Stream Execution Steps</p>
          {steps.map((step) => {
            const mappedCodeId = matches[step.id];
            const codeObj = pool.find((c) => c.id === mappedCodeId);
            const isSelected = selectedStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`p-4 rounded-xl border text-sm transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? "bg-brand-cyan/10 border-brand-cyan text-white"
                    : "bg-bg-elevated/40 border-border text-text-secondary hover:text-white"
                }`}
              >
                <span className="font-medium">{step.desc}</span>
                {codeObj ? (
                  <div className="flex items-center justify-between bg-bg-secondary p-2.5 rounded-lg border border-border font-mono text-xs text-brand-cyan">
                    <span>{codeObj.code}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearMatch(step.id);
                      }}
                      className="text-text-muted hover:text-accent-red font-bold"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted italic">Click to match statement...</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side: Code Pool Choices */}
        <div className="space-y-3">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Available Stream Statements ({userTrack})</p>
          {shuffledCode.map((item) => {
            const isUsed = Object.values(matches).includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleCodeClick(item.id)}
                disabled={isUsed}
                className={`w-full text-left p-4 rounded-xl border font-mono text-xs transition-all ${
                  isUsed
                    ? "bg-bg-elevated/20 border-border text-text-muted opacity-40 cursor-not-allowed"
                    : "bg-bg-elevated border-border text-text-secondary hover:border-brand-cyan/40 hover:text-white"
                }`}
              >
                {item.code}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(matches).length < 4}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Stream Pipeline
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// If-Else Constructor (Module 3)
// ──────────────────────────────────────────────
function IfElseGame({
  config,
  onSubmit,
  userTrack
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const [condition, setCondition] = useState("");
  const [trueBranch, setTrueBranch] = useState("");
  const [falseBranch, setFalseBranch] = useState("");

  const trackPlaceholders = IFELSE_PLACEHOLDERS[(userTrack || "JAVASCRIPT").toUpperCase()] || IFELSE_PLACEHOLDERS.JAVASCRIPT!;

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
          { label: "IF Condition", value: condition, set: setCondition, placeholder: `e.g. ${trackPlaceholders.cond}` },
          { label: "THEN (True Branch)", value: trueBranch, set: setTrueBranch, placeholder: `e.g. ${trackPlaceholders.trueB}` },
          { label: "ELSE (False Branch)", value: falseBranch, set: setFalseBranch, placeholder: `e.g. ${trackPlaceholders.falseB}` },
        ].map((field) => (
          <div key={field.label}>
            <label className="text-xs text-text-muted mb-1.5 block">{field.label}</label>
            <textarea
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted resize-none focus:outline-none focus:border-brand-cyan/50 h-28 font-mono"
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
// Loop Builder Game (Module 4)
// ──────────────────────────────────────────────
function LoopBuilderGame({
  onSubmit,
  userTrack
}: {
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const [loopType, setLoopType] = useState("for");
  const [iterations, setIterations] = useState(5);
  const [bodyBlocks, setBodyBlocks] = useState<string[]>([]);

  const getDefaultStatement = () => {
    switch ((userTrack || "JAVASCRIPT").toUpperCase()) {
      case "JAVASCRIPT": return "console.log(i);";
      case "PYTHON": return "print(i)";
      case "JAVA": return "System.out.println(i);";
      case "C": return 'printf("%d\\n", i);';
      case "CPP": return "std::cout << i << std::endl;";
      default: return "console.log(i);";
    }
  };

  const addBodyBlock = () => setBodyBlocks((prev) => [...prev, getDefaultStatement()]);
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
          <label className="text-xs text-text-muted">Loop Body Statements ({userTrack})</label>
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
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [visited, setVisited] = useState<string[]>([]);
  const startNode = (config.start_node as string) ?? "A";
  const expectedOrder = (config.expected_order as string[]) ?? ["A", "B", "C", "D", "E"];

  const handleNodeClick = (node: string) => {
    if (visited.includes(node)) {
      setVisited((prev) => prev.filter((n) => n !== node));
    } else {
      setVisited((prev) => [...prev, node]);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      visited_order: visited,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg text-sm text-text-secondary">
        Starting at node <strong className="text-white">{startNode}</strong>, trace the Breadth-First Search (BFS) path of the graph.
      </div>
      
      <div className="flex justify-center gap-4 py-8 bg-bg-elevated/40 border border-border rounded-xl">
        {expectedOrder.map((node) => {
          const idx = visited.indexOf(node);
          const isSelected = idx !== -1;
          return (
            <button
              key={node}
              onClick={() => handleNodeClick(node)}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-heading font-bold text-lg relative transition-all ${
                isSelected
                  ? "bg-brand-cyan border-brand-cyan text-bg-primary shadow-[0_0_15px_rgba(0,180,216,0.3)]"
                  : "bg-bg-elevated border-border text-text-secondary hover:border-brand-cyan/40 hover:text-white"
              }`}
            >
              {node}
              {isSelected && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent-purple text-[10px] text-white flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-bg-secondary p-4 rounded-xl border border-border">
        <span className="text-xs text-text-muted">Trace queue order: {visited.join(" → ") || "none"}</span>
        <button
          onClick={handleSubmit}
          disabled={visited.length === 0}
          className="px-6 py-2.5 bg-brand-cyan text-bg-primary font-bold text-sm rounded-xl hover:bg-brand-cyan/95 transition-colors disabled:opacity-50"
        >
          Verify BFS Path
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// DFS Adventure Game
// ──────────────────────────────────────────────
function DfsAdventureGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [visited, setVisited] = useState<string[]>([]);
  const startNode = (config.start_node as string) ?? "A";
  const expectedOrder = (config.expected_order as string[]) ?? ["A", "B", "D", "E", "C"];

  const handleNodeClick = (node: string) => {
    if (visited.includes(node)) {
      setVisited((prev) => prev.filter((n) => n !== node));
    } else {
      setVisited((prev) => [...prev, node]);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      visited_order: visited,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-lg text-sm text-text-secondary">
        Starting at node <strong className="text-white">{startNode}</strong>, trace the Depth-First Search (DFS) path.
      </div>
      
      <div className="flex justify-center gap-4 py-8 bg-bg-elevated/40 border border-border rounded-xl">
        {expectedOrder.map((node) => {
          const idx = visited.indexOf(node);
          const isSelected = idx !== -1;
          return (
            <button
              key={node}
              onClick={() => handleNodeClick(node)}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-heading font-bold text-lg relative transition-all ${
                isSelected
                  ? "bg-accent-purple border-accent-purple text-white shadow-[0_0_15px_rgba(123,47,190,0.3)]"
                  : "bg-bg-elevated border-border text-text-secondary hover:border-accent-purple/40 hover:text-white"
              }`}
            >
              {node}
              {isSelected && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-brand-cyan text-[10px] text-bg-primary flex items-center justify-center font-mono">
                  {idx + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center bg-bg-secondary p-4 rounded-xl border border-border">
        <span className="text-xs text-text-muted">Trace stack order: {visited.join(" → ") || "none"}</span>
        <button
          onClick={handleSubmit}
          disabled={visited.length === 0}
          className="px-6 py-2.5 bg-accent-purple text-white font-bold text-sm rounded-xl hover:bg-accent-purple/95 transition-colors disabled:opacity-50"
        >
          Verify DFS Path
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Recursion Maze Game (Module 6)
// ──────────────────────────────────────────────
function RecursionMazeGame({
  onSubmit,
  userTrack
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const [baseCase, setBaseCase] = useState("");
  const [recursiveCase, setRecursiveCase] = useState("");
  const [callStack, setCallStack] = useState<string[]>([]);
  const [newFrame, setNewFrame] = useState("");
  const [isCrashed, setIsCrashed] = useState(false);
  const [crashReason, setCrashReason] = useState<string | null>(null);

  const normalizedExpected = ["factorial(3)", "factorial(2)", "factorial(1)", "factorial(0)"];
  const placeholders = RECURSION_PLACEHOLDERS[(userTrack || "JAVASCRIPT").toUpperCase()] || RECURSION_PLACEHOLDERS.JAVASCRIPT!;

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
    if (callStack.length >= 8) {
      setIsCrashed(true);
      setCrashReason("Stack Overflow! The recursion stack has exceeded its maximum depth limits.");
      return;
    }
    setCallStack((prev) => [...prev, newFrame]);
    setNewFrame("");
  };

  const popFrame = () => {
    setCallStack((prev) => prev.slice(0, prev.length - 1));
    setIsCrashed(false);
    setCrashReason(null);
  };

  const handleSubmit = () => {
    const passed = !hasError && callStack.length === 4 && !!baseCase.trim() && !!recursiveCase.trim();
    onSubmit({
      score: passed ? 1.0 : 0.0,
      passed,
      base_case: baseCase,
      recursive_case: recursiveCase,
      stack_trace: callStack,
      time_seconds: 120,
    });
  };

  return (
    <div className="space-y-6">
      {/* Maze Visualizer Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-secondary border border-border p-6 rounded-2xl">
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Recursion Maze</h3>
          <div className="grid grid-cols-4 grid-rows-3 gap-2 bg-bg-elevated/40 p-4 rounded-xl border border-border relative h-40">
            {Array.from({ length: 12 }).map((_, idx) => {
              const x = idx % 4;
              const y = Math.floor(idx / 4);
              const isPath = mazePath.some((p) => p.x === x && p.y === y);
              const isHero = currentCharPos.x === x && currentCharPos.y === y;
              
              return (
                <div
                  key={idx}
                  className={`rounded-lg flex items-center justify-center transition-all ${
                    isHero
                      ? "bg-brand-cyan text-bg-primary text-lg font-bold shadow-lg shadow-brand-cyan/20 border-2 border-white"
                      : isPath
                      ? "bg-bg-elevated border border-border"
                      : "bg-bg-primary/20 border border-border/20 opacity-30"
                  }`}
                >
                  {isHero ? "🤖" : isPath ? "•" : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* Call Stack Visualizer */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
            <span>Runtime Call Stack</span>
            {isCrashed && <span className="text-xs bg-accent-red/20 text-accent-red px-2 py-0.5 rounded border border-accent-red/20 animate-pulse font-bold">CRASHED</span>}
          </h3>
          <div className="bg-bg-elevated/40 border border-border rounded-xl p-4 flex flex-col-reverse gap-1.5 h-40 overflow-y-auto">
            {callStack.map((frame, idx) => {
              const isWrong = hasError && idx >= (firstErrorIdx === -1 ? 0 : firstErrorIdx);
              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs text-center ${
                    isWrong
                      ? "bg-accent-red/10 border-accent-red/35 text-accent-red"
                      : "bg-brand-cyan/5 border-brand-cyan/25 text-brand-cyan"
                  }`}
                >
                  {frame}
                </div>
              );
            })}
            {callStack.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-12">Stack is empty. Push frames to walk the maze.</p>
            )}
          </div>
        </div>
      </div>

      {isCrashed && crashReason && (
        <div className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-xs font-mono text-accent-red">
          {crashReason}
        </div>
      )}

      {/* Frame builder controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-secondary border border-border p-6 rounded-2xl">
        <div className="space-y-4">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Define Function Parts ({userTrack})</p>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Base Case Condition</label>
            <input
              value={baseCase}
              onChange={(e) => setBaseCase(e.target.value)}
              placeholder={`e.g. ${placeholders.base}`}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-cyan/50"
            />
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Recursive Case Statement</label>
            <input
              value={recursiveCase}
              onChange={(e) => setRecursiveCase(e.target.value)}
              placeholder={`e.g. ${placeholders.recurse}`}
              className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-cyan/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider">Control Call Stack</p>
          <div className="flex gap-2">
            <input
              value={newFrame}
              onChange={(e) => setNewFrame(e.target.value)}
              placeholder="e.g. factorial(3)"
              className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-cyan/50"
            />
            <button
              onClick={addFrame}
              className="px-4 py-2 bg-brand-cyan text-bg-primary font-bold text-xs rounded-lg hover:bg-brand-cyan/95 transition-colors"
            >
              Push Frame
            </button>
            <button
              onClick={popFrame}
              disabled={callStack.length === 0}
              className="px-4 py-2 bg-bg-elevated border border-border text-xs text-text-secondary hover:text-white rounded-lg transition-colors hover:bg-bg-elevated/60 disabled:opacity-30"
            >
              Pop
            </button>
          </div>
          <div className="text-[10px] text-text-muted leading-relaxed">
            Push <strong>factorial(3)</strong>, then <strong>factorial(2)</strong>, <strong>factorial(1)</strong>, and <strong>factorial(0)</strong> to fully reach the base case and walk the maze.
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={callStack.length < 4 || !baseCase.trim() || !recursiveCase.trim() || isCrashed}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Verify Recursion Pipeline
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Type Sorter Game (Module 1, Game 2)
// ──────────────────────────────────────────────
function TypeSorterGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const items = (config.items as Array<{ id: string; value: string; types: Record<string, string> }>) || [];
  const track = (userTrack || "JAVASCRIPT").toUpperCase();
  const types = Array.from(new Set(items.map(item => item.types[track] || item.types["JAVASCRIPT"]))).filter((t): t is string => typeof t === "string");

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleSelectItem = (itemId: string) => {
    setSelectedItem(itemId);
  };

  const handleAssignToBin = (type: string) => {
    if (!selectedItem) return;
    setMatches(prev => ({ ...prev, [selectedItem]: type }));
    setSelectedItem(null);
  };

  const clearItem = (itemId: string) => {
    setMatches(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const handleSubmit = () => {
    onSubmit({
      matches,
      time_seconds: 45,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary">
        Select a value from the left tray, then click on the matching Type Bin on the right.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3 bg-[#0A0E1A] p-4 rounded-xl border border-border h-96 overflow-y-auto">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Values Tray</h4>
          <div className="space-y-2">
            {items.map(item => {
              const assignedType = matches[item.id];
              const isSelected = selectedItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  disabled={!!assignedType}
                  className={`w-full text-left p-3.5 rounded-xl border font-mono text-sm transition-all ${
                    assignedType
                      ? "bg-bg-elevated/20 border-border text-text-muted opacity-40 cursor-not-allowed"
                      : isSelected
                      ? "bg-brand-cyan/15 border-brand-cyan text-white shadow-[0_0_10px_rgba(0,180,216,0.1)]"
                      : "bg-bg-elevated border-border text-text-primary hover:border-brand-cyan/40 hover:bg-bg-elevated/80"
                  }`}
                >
                  <span className="font-bold">{item.value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-4 h-96 overflow-y-auto">
          {types.map(type => {
            const assignedItems = items.filter(item => matches[item.id] === type);
            return (
              <div
                key={type}
                onClick={() => handleAssignToBin(type)}
                className={`flex flex-col rounded-xl border p-4 transition-all cursor-pointer min-h-[160px] ${
                  selectedItem
                    ? "border-brand-cyan/50 bg-[#1A1F35]/30 hover:bg-[#1A1F35]/50 hover:border-brand-cyan"
                    : "border-border bg-[#111827]"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan bg-[#1A1F35] px-2.5 py-1 rounded">
                    {type}
                  </span>
                  <span className="text-xs text-text-muted font-bold font-mono">
                    {assignedItems.length} items
                  </span>
                </div>

                <div className="flex-1 space-y-1.5">
                  {assignedItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-[#0A0E1A] border border-border/40 rounded-lg text-xs font-mono text-white"
                    >
                      <span>{item.value}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearItem(item.id);
                        }}
                        className="text-text-muted hover:text-accent-red transition-colors text-[10px] font-bold"
                      >
                        Clear
                      </button>
                    </div>
                  ))}
                  {assignedItems.length === 0 && (
                    <p className="text-xs text-text-muted italic text-center py-6">Empty Bin</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(matches).length < items.length}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Classifications
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Echo Chamber Game (Module 2, Game 2)
// ──────────────────────────────────────────────
function EchoChamberGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const puzzlesConfig = (config.puzzles as Record<string, Array<{ id: string; statement: string; output: string }>>) || {};
  const track = (userTrack || "JAVASCRIPT").toUpperCase();
  const list = puzzlesConfig[track] || puzzlesConfig["JAVASCRIPT"] || [];

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedStatement, setSelectedStatement] = useState<string | null>(null);

  const outputs = list.map(item => item.output);

  const handleSelectStatement = (id: string) => {
    setSelectedStatement(id);
  };

  const handleMatchOutput = (outputVal: string) => {
    if (!selectedStatement) return;
    setMatches(prev => ({ ...prev, [selectedStatement]: outputVal }));
    setSelectedStatement(null);
  };

  const clearMatch = (id: string) => {
    setMatches(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleSubmit = () => {
    onSubmit({
      output_matches: matches,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary">
        Select a print statement on the left, then select the matching stdout terminal echo on the right.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Statements</h4>
          {list.map(puzzle => {
            const mappedOutput = matches[puzzle.id];
            const isSelected = selectedStatement === puzzle.id;
            return (
              <div
                key={puzzle.id}
                onClick={() => handleSelectStatement(puzzle.id)}
                className={`p-4 rounded-xl border text-sm transition-all cursor-pointer flex flex-col gap-2.5 ${
                  isSelected
                    ? "bg-brand-cyan/10 border-brand-cyan text-white"
                    : "bg-[#111827] border-border text-text-secondary hover:text-white"
                }`}
              >
                <div className="font-mono text-xs text-white bg-bg-secondary p-2.5 rounded-lg border border-border">
                  {puzzle.statement}
                </div>
                {mappedOutput ? (
                  <div className="flex items-center justify-between bg-[#1A1F35] px-3 py-2 rounded-lg border border-brand-cyan/30 text-xs text-brand-cyan">
                    <span className="font-mono font-bold">Stdout: &ldquo;{mappedOutput}&rdquo;</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearMatch(puzzle.id);
                      }}
                      className="text-text-muted hover:text-accent-red font-bold font-sans text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted italic">Click to match terminal output...</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Console Outputs</h4>
          <div className="space-y-2">
            {outputs.map((val, idx) => {
              const isUsed = Object.values(matches).includes(val);
              return (
                <button
                  key={idx}
                  onClick={() => handleMatchOutput(val)}
                  disabled={isUsed}
                  className={`w-full text-left p-4 rounded-xl border font-mono text-xs transition-all ${
                    isUsed
                      ? "bg-bg-elevated/20 border-border text-text-muted opacity-40 cursor-not-allowed"
                      : "bg-[#111827] border-border text-text-primary hover:border-brand-cyan/40 hover:text-white"
                  }`}
                >
                  Stdout: &ldquo;{val}&rdquo;
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(matches).length < list.length}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Matches
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Switchboard Game (Module 3, Game 2)
// ──────────────────────────────────────────────
function SwitchboardGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const inputs = (config.inputs as Array<{ value: string; target: string }>) || [];
  const targets = Array.from(new Set(inputs.map(item => item.target)));

  const [routes, setRoutes] = useState<Record<string, string>>({});
  const [selectedInput, setSelectedInput] = useState<string | null>(null);

  const handleSelectInput = (val: string) => {
    setSelectedInput(val);
  };

  const handleRouteToTarget = (target: string) => {
    if (!selectedInput) return;
    setRoutes(prev => ({ ...prev, [selectedInput]: target }));
    setSelectedInput(null);
  };

  const clearRoute = (val: string) => {
    setRoutes(prev => {
      const copy = { ...prev };
      delete copy[val];
      return copy;
    });
  };

  const handleSubmit = () => {
    onSubmit({
      routes,
      time_seconds: 45,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary">
        Connect each input value on the left to its matching Switch Board target block on the right.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Input Sockets</h4>
          {inputs.map(input => {
            const mappedTarget = routes[input.value];
            const isSelected = selectedInput === input.value;
            return (
              <div
                key={input.value}
                onClick={() => handleSelectInput(input.value)}
                className={`p-4 rounded-xl border text-sm transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-brand-cyan/10 border-brand-cyan text-white"
                    : "bg-[#111827] border-border text-text-secondary hover:text-white"
                }`}
              >
                <span className="font-mono text-sm font-bold text-white">Input: {input.value}</span>
                {mappedTarget ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[#1A1F35] border border-brand-cyan/25 text-brand-cyan px-2.5 py-1 rounded font-mono">
                      Routed to: {mappedTarget}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearRoute(input.value);
                      }}
                      className="text-text-muted hover:text-accent-red transition-colors text-xs font-bold"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-text-muted italic">Click to connect socket...</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Case Branches</h4>
          <div className="space-y-2">
            {targets.map((target, idx) => {
              const isUsed = Object.values(routes).includes(target);
              return (
                <button
                  key={idx}
                  onClick={() => handleRouteToTarget(target)}
                  disabled={isUsed}
                  className={`w-full text-left p-4 rounded-xl border font-mono text-xs transition-all ${
                    isUsed
                      ? "bg-bg-elevated/20 border-border text-text-muted opacity-40 cursor-not-allowed"
                      : "bg-[#111827] border-border text-text-primary hover:border-brand-cyan/40 hover:text-white"
                  }`}
                >
                  Branch: {target}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(routes).length < inputs.length}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Routing Configuration
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Factory Line Game (Module 4, Game 2)
// ──────────────────────────────────────────────
function FactoryLineGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const expectedIterations = Number(config.expected_iterations ?? 5);

  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [actions, setActions] = useState<string[]>([]);

  const availableActions = ["retrieve", "paint", "package", "reject", "inspect"];
  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const getLoopText = () => {
    switch (track) {
      case "PYTHON":
        return `for i in range(${start}, ${end}, ${step}):`;
      default:
        return `for (let i = ${start}; i < ${end}; i += ${step}) {`;
    }
  };

  const addAction = (act: string) => {
    setActions(prev => [...prev, act]);
  };

  const removeAction = (idx: number) => {
    setActions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    onSubmit({
      loop_config: { start, end, step },
      actions,
      time_seconds: 90,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Configure the loop bounds and body actions to process exactly <strong className="text-white">{expectedIterations} items</strong> sequentially through the factory line. Each iteration must execute the required sequence of steps.
      </div>

      <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Loop Configuration ({userTrack})</h4>
        <div className="bg-[#0A0E1A] p-4 rounded-xl border border-border font-mono text-sm text-white flex flex-col md:flex-row md:items-center gap-4">
          <span className="text-text-muted">{getLoopText()}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary font-sans">Start:</span>
              <input
                type="number"
                value={start}
                onChange={(e) => setStart(parseInt(e.target.value, 10) || 0)}
                className="w-16 bg-[#111827] border border-border rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary font-sans">End:</span>
              <input
                type="number"
                value={end}
                onChange={(e) => setEnd(parseInt(e.target.value, 10) || 0)}
                className="w-16 bg-[#111827] border border-border rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-brand-cyan"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary font-sans">Step:</span>
              <input
                type="number"
                value={step}
                onChange={(e) => setStep(parseInt(e.target.value, 10) || 1)}
                min={1}
                className="w-16 bg-[#111827] border border-border rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-brand-cyan"
              />
            </div>
          </div>
          {track !== "PYTHON" && <span className="text-text-muted">{"}"}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3 bg-[#0A0E1A] p-4 rounded-xl border border-border">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Available Factory Steps</h4>
          <div className="grid grid-cols-2 gap-2">
            {availableActions.map(act => (
              <button
                key={act}
                onClick={() => addAction(act)}
                className="flex items-center justify-between px-3.5 py-2.5 bg-bg-elevated border border-border rounded-lg text-xs font-mono text-text-primary hover:border-brand-cyan hover:bg-bg-elevated/70 transition-all text-left"
              >
                <span>{act}()</span>
                <Plus className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 bg-[#0A0E1A] p-4 rounded-xl border border-border">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Loop Body Actions Sequence</h4>
          <div className="space-y-2 min-h-[140px] border border-dashed border-border/60 rounded-xl p-3">
            {actions.map((act, idx) => (
              <div
                key={`${act}-${idx}`}
                className="flex items-center justify-between px-3 py-2 bg-bg-secondary border border-border rounded-lg font-mono text-xs text-white"
              >
                <span>{idx + 1}. {act}()</span>
                <button
                  onClick={() => removeAction(idx)}
                  className="text-text-muted hover:text-accent-red transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {actions.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-10">No actions defined in loop body yet.</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={actions.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Run Loop Simulation
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Function Workshop Game (Module 5, Game 1)
// ──────────────────────────────────────────────
function FunctionWorkshopGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const expectedName = String(config.expected_name ?? "");
  const expectedReturnType = String(config.expected_return_type ?? "number");
  const expectedParams = (config.expected_params as Array<{ name: string; type: string }>) || [];
  const expectedBody = (config.expected_body as string[]) || [];

  const [name, setName] = useState("");
  const [params, setParams] = useState<Array<{ name: string; type: string }>>([]);
  const [returnType, setReturnType] = useState("number");
  const [body, setBody] = useState<string[]>([]);

  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const handleAddParam = () => {
    setParams(prev => [...prev, { name: "", type: "number" }]);
  };

  const handleRemoveParam = (idx: number) => {
    setParams(prev => prev.filter((_, i) => i !== idx));
  };

  const handleParamChange = (idx: number, field: "name" | "type", val: string) => {
    setParams(prev => prev.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const availableBodyActions = ["add", "subtract", "multiply", "divide", "return"];

  const handleAddAction = (act: string) => {
    setBody(prev => [...prev, act]);
  };

  const handleRemoveAction = (idx: number) => {
    setBody(prev => prev.filter((_, i) => i !== idx));
  };

  const getSignaturePreview = () => {
    const paramList = params.map(p => {
      const pName = p.name || `param${params.indexOf(p) + 1}`;
      if (track === "PYTHON") return pName;
      if (track === "JAVASCRIPT") return `${pName}: ${p.type}`;
      if (track === "JAVA" || track === "CPP" || track === "C") {
        const typeMap: Record<string, string> = { number: "double", string: "String", boolean: "boolean" };
        return `${typeMap[p.type] || p.type} ${pName}`;
      }
      return `${pName}: ${p.type}`;
    }).join(", ");

    const retTypeMap: Record<string, string> = { number: "double", string: "String", boolean: "boolean" };
    const mappedRet = retTypeMap[returnType] || returnType;

    const fName = name || "functionName";

    switch (track) {
      case "PYTHON":
        return `def ${fName}(${paramList}):`;
      case "JAVA":
        return `public ${mappedRet} ${fName}(${paramList}) {`;
      case "CPP":
      case "C":
        return `${mappedRet} ${fName}(${paramList}) {`;
      default: // JAVASCRIPT/TYPESCRIPT
        return `function ${fName}(${paramList}): ${returnType} {`;
    }
  };

  const handleSubmit = () => {
    onSubmit({
      name,
      params,
      return_type: returnType,
      body,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Assemble a function to match the requested signature and body operations. Use the workspace below to define the function signature, return type, parameters, and return expression steps.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specs & Info Panel */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4 h-fit">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Specification
          </h4>
          <div className="space-y-3.5 text-xs text-text-secondary">
            <div>
              <p className="text-text-muted font-sans font-medium mb-1">Target Name</p>
              <code className="bg-[#0A0E1A] px-2 py-1 rounded border border-border text-white font-mono">{expectedName}</code>
            </div>
            <div>
              <p className="text-text-muted font-sans font-medium mb-1.5">Expected Parameters</p>
              <div className="space-y-1.5">
                {expectedParams.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-white font-bold">{p.name}</span>
                    <span className="text-text-muted">:</span>
                    <span className="text-accent-purple font-bold">{p.type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-text-muted font-sans font-medium mb-1">Expected Return Type</p>
              <code className="bg-[#0A0E1A] px-2 py-1 rounded border border-border text-accent-green font-mono">{expectedReturnType}</code>
            </div>
            <div>
              <p className="text-text-muted font-sans font-medium mb-1.5">Body Actions Required</p>
              <div className="flex flex-wrap gap-1">
                {expectedBody.map((b, idx) => (
                  <span key={idx} className="bg-bg-elevated px-2 py-1 rounded border border-border font-mono text-white text-[10px]">
                    {b}()
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Panel */}
        <div className="md:col-span-2 space-y-6">
          {/* Code Signature Editor */}
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">
              Signature Builder
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-medium">Function Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. calculateInterest"
                  className="w-full bg-[#0A0E1A] border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1.5 font-medium">Return Type</label>
                <select
                  value={returnType}
                  onChange={(e) => setReturnType(e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan"
                >
                  <option value="number">number</option>
                  <option value="string">string</option>
                  <option value="boolean">boolean</option>
                </select>
              </div>
            </div>

            {/* Parameters list */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-secondary font-medium">Parameters</span>
                <button
                  onClick={handleAddParam}
                  className="flex items-center gap-1 text-[11px] text-brand-cyan hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Parameter
                </button>
              </div>
              <div className="space-y-2">
                {params.map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-[#0A0E1A] p-2 rounded-lg border border-border">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleParamChange(idx, "name", e.target.value)}
                      placeholder="Param name"
                      className="flex-1 bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                    />
                    <select
                      value={p.type}
                      onChange={(e) => handleParamChange(idx, "type", e.target.value)}
                      className="bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                    >
                      <option value="number">number</option>
                      <option value="string">string</option>
                      <option value="boolean">boolean</option>
                    </select>
                    <button
                      onClick={() => handleRemoveParam(idx)}
                      className="text-text-muted hover:text-accent-red p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {params.length === 0 && (
                  <p className="text-xs text-text-muted italic text-center py-2">No parameters defined.</p>
                )}
              </div>
            </div>
          </div>

          {/* Code Signature Preview */}
          <div className="bg-[#0A0E1A] border border-border rounded-xl p-4 font-mono text-xs text-text-secondary select-none">
            <span className="text-text-muted">// Preview:</span>
            <div className="mt-1 text-white font-bold text-sm">
              {getSignaturePreview()}
            </div>
          </div>

          {/* Body Block Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111827] border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Available Steps</h4>
              <div className="grid grid-cols-1 gap-2">
                {availableBodyActions.map(act => (
                  <button
                    key={act}
                    onClick={() => handleAddAction(act)}
                    className="flex items-center justify-between px-3 py-2 bg-bg-elevated border border-border rounded-lg text-xs font-mono text-text-primary hover:border-brand-cyan hover:bg-bg-elevated/70 transition-all text-left"
                  >
                    <span>{act}()</span>
                    <Plus className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111827] border border-border rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Function Body</h4>
              <div className="space-y-2 min-h-[140px] border border-dashed border-border/60 rounded-xl p-3 bg-[#0A0E1A]">
                {body.map((act, idx) => (
                  <div
                    key={`${act}-${idx}`}
                    className="flex items-center justify-between px-3 py-1.5 bg-[#111827] border border-border rounded-lg font-mono text-xs text-white"
                  >
                    <span>{idx + 1}. {act}()</span>
                    <button
                      onClick={() => handleRemoveAction(idx)}
                      className="text-text-muted hover:text-accent-red transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {body.length === 0 && (
                  <p className="text-xs text-text-muted italic text-center py-10">No body operations defined.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || body.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Build & Run Function Workshop
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Black Box Factory Game (Module 5, Game 2)
// ──────────────────────────────────────────────
function BlackBoxFactoryGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const inputs = (config.inputs as number[]) || [2, 5, 10];
  const expectedOperations = (config.expected_operations as string[]) || [];

  const [testInput, setTestInput] = useState<string>("");
  const [history, setHistory] = useState<Array<{ input: number; output: number }>>([]);
  const [operations, setOperations] = useState<string[]>([]);

  const availableOps = ["multiply_2", "add_1", "multiply_3", "subtract_3", "add_5"];

  const opLabel = (op: string) => {
    switch (op) {
      case "multiply_2": return "x * 2";
      case "add_1": return "x + 1";
      case "multiply_3": return "x * 3";
      case "subtract_3": return "x - 3";
      case "add_5": return "x + 5";
      default: return op;
    }
  };

  const runBlackBoxClient = (val: number) => {
    let result = val;
    for (const op of expectedOperations) {
      if (op === "multiply_2") result *= 2;
      else if (op === "add_1") result += 1;
      else if (op === "multiply_3") result *= 3;
      else if (op === "subtract_3") result -= 3;
      else if (op === "add_5") result += 5;
    }
    return result;
  };

  const handleTest = () => {
    const val = Number(testInput);
    if (isNaN(val)) return;
    const output = runBlackBoxClient(val);
    setHistory(prev => [{ input: val, output }, ...prev]);
    setTestInput("");
  };

  const handleAddOp = (op: string) => {
    setOperations(prev => [...prev, op]);
  };

  const handleRemoveOp = (idx: number) => {
    setOperations(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    onSubmit({
      operations,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  const runUserChain = (val: number) => {
    let result = val;
    for (const op of operations) {
      if (op === "multiply_2") result *= 2;
      else if (op === "add_1") result += 1;
      else if (op === "multiply_3") result *= 3;
      else if (op === "subtract_3") result -= 3;
      else if (op === "add_5") result += 5;
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Analyze the hidden function inside the <strong className="text-white">Black Box Factory</strong>. Input test numbers to probe its outputs, then construct an operations pipeline that matches the logic.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Console */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 animate-pulse" /> Factory Probe Chamber
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter probe input..."
              className="flex-1 bg-[#0A0E1A] border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan"
            />
            <button
              onClick={handleTest}
              className="px-4 py-2 bg-brand-cyan text-bg-primary text-xs font-bold rounded-lg hover:bg-brand-cyan/90 transition-all"
            >
              Test Chamber
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <h5 className="text-[11px] font-mono font-bold text-text-muted uppercase">Probe History</h5>
            {history.map((h, idx) => {
              const userVal = runUserChain(h.input);
              const matches = userVal === h.output;
              return (
                <div key={idx} className="flex items-center justify-between bg-[#0A0E1A] p-2.5 rounded-lg border border-border text-xs font-mono text-white">
                  <span>Input: <span className="font-bold text-brand-cyan">{h.input}</span></span>
                  <div className="flex items-center gap-4">
                    <span>Box: <span className="font-bold text-accent-green">{h.output}</span></span>
                    {operations.length > 0 && (
                      <span className="flex items-center gap-1">
                        Mine: <span className={`font-bold ${matches ? "text-accent-green" : "text-accent-red"}`}>{userVal}</span>
                        {matches ? <Check className="w-3 h-3 text-accent-green" /> : <XCircle className="w-3 h-3 text-accent-red" />}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {history.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-8">Input test values above to inspect the Black Box outputs.</p>
            )}
          </div>
        </div>

        {/* Chaining Workspace */}
        <div className="space-y-4">
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Available Operations</h4>
            <div className="grid grid-cols-2 gap-2">
              {availableOps.map(op => (
                <button
                  key={op}
                  onClick={() => handleAddOp(op)}
                  className="flex items-center justify-between px-3 py-2 bg-[#0A0E1A] border border-border rounded-lg text-xs font-mono text-text-primary hover:border-brand-cyan hover:bg-[#0A0E1A]/80 transition-all text-left"
                >
                  <span>{opLabel(op)}</span>
                  <Plus className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider">Your Pipeline</h4>
            <div className="space-y-2 min-h-[120px] border border-dashed border-border/60 rounded-xl p-3 bg-[#0A0E1A] flex flex-col justify-center">
              {operations.map((op, idx) => (
                <div
                  key={`${op}-${idx}`}
                  className="flex items-center justify-between px-3 py-1.5 bg-[#111827] border border-border rounded-lg font-mono text-xs text-white"
                >
                  <span>{idx + 1}. {opLabel(op)}</span>
                  <button
                    onClick={() => handleRemoveOp(idx)}
                    className="text-text-muted hover:text-accent-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {operations.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-10">Select operations to build the pipeline.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={operations.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Operations Chain
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Mirror Halls Game (Module 6, Game 2)
// ──────────────────────────────────────────────
function MirrorHallsGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const [baseCondition, setBaseCondition] = useState("");
  const [baseReturn, setBaseReturn] = useState("");
  const [reductionArg, setReductionArg] = useState("");

  const [simulationResult, setSimulationResult] = useState<{
    frames: number[];
    hitBase: boolean;
    error: string;
  } | null>(null);

  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const safeEvalClient = (expr: string, nVal: number): any => {
    const clean = (expr || "").replace(/\s+/g, "");
    if (!/^[n0-9+\-*/=<>!]+$/.test(clean)) {
      return null;
    }
    const replaced = clean.replace(/n/g, nVal.toString());

    const compMatch = replaced.match(/^([+-]?\d+)(===|!==|==|!=|<=|>=|<|>)([+-]?\d+)$/);
    if (compMatch) {
      const v1 = parseInt(compMatch[1], 10);
      const op = compMatch[2];
      const v2 = parseInt(compMatch[3], 10);
      if (op === "===" || op === "==") return v1 === v2;
      if (op === "!==" || op === "!=") return v1 !== v2;
      if (op === "<=") return v1 <= v2;
      if (op === ">=") return v1 >= v2;
      if (op === "<") return v1 < v2;
      if (op === ">") return v1 > v2;
    }

    const arithmeticMatch = replaced.match(/^([+-]?\d+)([+\-*/])([+-]?\d+)$/);
    if (arithmeticMatch) {
      const v1 = parseInt(arithmeticMatch[1], 10);
      const op = arithmeticMatch[2];
      const v2 = parseInt(arithmeticMatch[3], 10);
      if (op === "+") return v1 + v2;
      if (op === "-") return v1 - v2;
      if (op === "*") return v1 * v2;
      if (op === "/" && v2 !== 0) return v1 / v2;
      return null;
    }

    if (/^[+-]?\d+$/.test(replaced)) {
      return parseInt(replaced, 10);
    }

    return null;
  };

  const handleSimulate = () => {
    const frames: number[] = [];
    let n = 3;
    let hitBase = false;
    let error = "";

    for (let i = 0; i < 10; i++) {
      frames.push(n);
      const isBase = safeEvalClient(baseCondition, n);
      if (isBase === true) {
        hitBase = true;
        break;
      }
      if (isBase === null) {
        error = "Invalid condition format (use n, comparisons like ==, <=, numbers)";
        break;
      }

      const nextN = safeEvalClient(reductionArg, n);
      if (nextN === null) {
        error = "Invalid reduction argument format (use n, operators like -1)";
        break;
      }
      if (nextN >= n && nextN >= 0) {
        error = "Infinite recursion detected: n did not decrease!";
        break;
      }
      n = nextN;
    }

    if (!hitBase && !error) {
      error = "Stack Overflow! Infinite reflection depth exceeded.";
    }

    setSimulationResult({ frames, hitBase, error });
  };

  const getCodeOutline = () => {
    const cond = baseCondition || "/* condition */";
    const ret = baseReturn || "/* return value */";
    const red = reductionArg || "/* recursive arg */";

    switch (track) {
      case "PYTHON":
        return `def reflect(n):\n    if ${cond}:\n        return ${ret}\n    return reflect(${red})`;
      case "JAVA":
        return `public int reflect(int n) {\n    if (${cond}) {\n        return ${ret};\n    }\n    return reflect(${red});\n}`;
      case "CPP":
      case "C":
        return `int reflect(int n) {\n    if (${cond}) {\n        return ${ret};\n    }\n    return reflect(${red});\n}`;
      default: // JAVASCRIPT
        return `function reflect(n) {\n  if (${cond}) {\n    return ${ret};\n  }\n  return reflect(${red});\n}`;
    }
  };

  const handleSubmit = () => {
    onSubmit({
      base_condition: baseCondition,
      base_return: baseReturn,
      reduction_arg: reductionArg,
      time_seconds: 75,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Configure the recursive reflection function below to successfully route a beam of light through the stack of mirrors. Fill in the base case condition, return value, and the argument for the next recursive step.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Recursive Configuration ({userTrack})</h4>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs text-text-secondary mb-1 font-sans font-medium">Base Case Condition</label>
                <input
                  type="text"
                  value={baseCondition}
                  onChange={(e) => setBaseCondition(e.target.value)}
                  placeholder="e.g. n === 0"
                  className="w-full bg-[#0A0E1A] border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1 font-sans font-medium">Base Case Return Value</label>
                <input
                  type="text"
                  value={baseReturn}
                  onChange={(e) => setBaseReturn(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full bg-[#0A0E1A] border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs text-text-secondary mb-1 font-sans font-medium">Reduction Step Argument</label>
                <input
                  type="text"
                  value={reductionArg}
                  onChange={(e) => setReductionArg(e.target.value)}
                  placeholder="e.g. n - 1"
                  className="w-full bg-[#0A0E1A] border border-border rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={!baseCondition || !baseReturn || !reductionArg}
              className="w-full py-2 bg-bg-elevated border border-border hover:border-brand-cyan text-brand-cyan text-xs font-bold rounded-lg hover:bg-brand-cyan/5 transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Simulate Reflection
            </button>
          </div>

          <div className="bg-[#0A0E1A] border border-border rounded-xl p-4 font-mono text-[11px] text-text-secondary select-none whitespace-pre leading-relaxed">
            {getCodeOutline()}
          </div>
        </div>

        {/* Visualizer Hall of Mirrors */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 flex flex-col">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-4">Mirror Stack Visualizer</h4>

          <div className="flex-1 bg-[#0A0E1A] rounded-xl border border-border p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            {simulationResult ? (
              <div className="w-full space-y-4">
                <div className="flex flex-col items-center gap-2">
                  {simulationResult.frames.map((nVal, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative flex items-center justify-center border rounded-xl py-3 w-40 text-center font-mono text-xs ${
                        idx === simulationResult.frames.length - 1 && simulationResult.hitBase
                          ? "border-accent-green/60 bg-accent-green/10 text-accent-green"
                          : "border-brand-cyan/30 bg-brand-cyan/5 text-white"
                      }`}
                      style={{
                        transform: `translateY(${idx * 4}px)`,
                        zIndex: 10 - idx,
                      }}
                    >
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-[10px] text-text-muted">
                        {idx + 1}
                      </div>
                      reflect({nVal})
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-2">
                  {simulationResult.error ? (
                    <span className="text-xs text-accent-red font-semibold bg-accent-red/10 border border-accent-red/30 px-3 py-1.5 rounded-lg inline-block">
                      ⚠ {simulationResult.error}
                    </span>
                  ) : simulationResult.hitBase ? (
                    <span className="text-xs text-accent-green font-semibold bg-accent-green/10 border border-accent-green/30 px-3 py-1.5 rounded-lg inline-block">
                      ✓ Base Case Reached! Return value: {baseReturn}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-text-muted italic space-y-2">
                <p>Configure and click &ldquo;Simulate Reflection&rdquo; to fire the light beam.</p>
                <div className="w-20 h-20 border border-dashed border-border rounded-full flex items-center justify-center mx-auto text-xl opacity-30">
                  ✨
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!baseCondition || !baseReturn || !reductionArg}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Mirror Halls Configuration
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Bug Hunt Game (Module 8, Game 1)
// ──────────────────────────────────────────────
function BugHuntGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const puzzles = (config.puzzles as Record<string, { code: string; buggy_line: number }>) || {};
  const track = (userTrack || "JAVASCRIPT").toUpperCase();
  const puzzle = puzzles[track] || puzzles["JAVASCRIPT"] || { code: "", buggy_line: 3 };

  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [traces, setTraces] = useState<Array<{ step: number; line: number; vars: Record<string, string> }>>([]);

  const codeLines = puzzle.code.split("\n");

  const simulatedTraceSteps: Array<{ line: number; vars: Record<string, string> }> = [
    { line: 1, vars: { arr: "[10, 5, 20]", max: "undefined", i: "undefined" } },
    { line: 2, vars: { arr: "[10, 5, 20]", max: "10", i: "undefined" } },
    { line: 3, vars: { arr: "[10, 5, 20]", max: "10", i: "0" } },
    { line: 4, vars: { arr: "[10, 5, 20]", max: "10", i: "0", "arr[i]": "10" } },
    { line: 3, vars: { arr: "[10, 5, 20]", max: "10", i: "1" } },
    { line: 4, vars: { arr: "[10, 5, 20]", max: "10", i: "1", "arr[i]": "5" } },
    { line: 3, vars: { arr: "[10, 5, 20]", max: "10", i: "2" } },
    { line: 4, vars: { arr: "[10, 5, 20]", max: "10", i: "2", "arr[i]": "20" } },
    { line: 5, vars: { arr: "[10, 5, 20]", max: "20", i: "2", "arr[i]": "20" } },
    { line: 3, vars: { arr: "[10, 5, 20]", max: "20", i: "3" } },
    { line: 4, vars: { arr: "[10, 5, 20]", max: "20", i: "3", "arr[i]": "undefined / ERROR" } },
  ];

  const handleStepOver = () => {
    if (stepIndex >= simulatedTraceSteps.length - 1) return;
    const nextIdx = stepIndex + 1;
    setStepIndex(nextIdx);
    const stepObj = simulatedTraceSteps[nextIdx];
    setTraces(prev => [
      ...prev,
      {
        step: nextIdx + 1,
        line: stepObj.line,
        vars: stepObj.vars,
      },
    ]);
  };

  const handleResetTrace = () => {
    setStepIndex(-1);
    setTraces([]);
  };

  const handleSubmit = () => {
    if (selectedLine === null) return;
    onSubmit({
      buggy_line: selectedLine,
      variable_traces: {},
      time_seconds: 90,
      hints_used: 0,
    });
  };

  const currentHighlightLine = stepIndex !== -1 ? simulatedTraceSteps[stepIndex].line : -1;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Study the code below. Run the step-over debugger to trace the variable values in the trace table. Spot where the off-by-one error or logical bug occurs, click on the buggy line, and submit your report.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code Console */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Debugger Console ({userTrack})
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleStepOver}
                disabled={stepIndex >= simulatedTraceSteps.length - 1}
                className="px-3 py-1.5 bg-[#0A0E1A] hover:bg-bg-elevated border border-border rounded-lg text-[11px] text-white font-mono hover:border-brand-cyan/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Play className="w-3 h-3 text-brand-cyan shrink-0" /> Step Over
              </button>
              <button
                onClick={handleResetTrace}
                disabled={stepIndex === -1}
                className="px-3 py-1.5 bg-[#0A0E1A] hover:bg-bg-elevated border border-border rounded-lg text-[11px] text-text-secondary font-mono hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#0A0E1A] rounded-xl border border-border p-4 font-mono text-xs overflow-y-auto select-none space-y-1">
            {codeLines.map((line, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = lineNum === currentHighlightLine;
              const isSelected = selectedLine === lineNum;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedLine(lineNum)}
                  className={`flex items-center gap-3 py-0.5 px-2 rounded cursor-pointer group transition-all ${
                    isHighlighted ? "bg-brand-cyan/15 text-white shadow-[0_0_8px_rgba(0,180,216,0.1)] font-bold" : ""
                  } ${
                    isSelected ? "border-l-2 border-accent-orange bg-accent-orange/10 font-bold" : ""
                  } hover:bg-bg-elevated/40`}
                >
                  <span className={`w-6 text-right select-none font-bold text-[10px] ${
                    isSelected ? "text-accent-orange font-bold" : isHighlighted ? "text-brand-cyan" : "text-text-muted"
                  }`}>
                    {lineNum}
                  </span>
                  <span className={`flex-1 whitespace-pre tab-2 ${
                    isSelected ? "text-accent-orange" : isHighlighted ? "text-white" : "text-text-secondary group-hover:text-white"
                  }`}>
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trace Table */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 flex flex-col h-[480px]">
          <h4 className="text-xs font-mono font-bold text-text-muted uppercase tracking-wider mb-4">Variable State Trace (Ungraded Scaffolding)</h4>

          <div className="flex-1 bg-[#0A0E1A] rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="grid grid-cols-5 border-b border-border bg-bg-secondary p-2.5 font-mono text-[10px] text-text-muted uppercase font-bold text-center">
              <div>Step</div>
              <div>Line</div>
              <div>max</div>
              <div>i</div>
              <div>arr[i]</div>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[11px] text-white">
              {traces.map((t, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-5 border-b border-border/40 p-2.5 text-center items-center ${
                    t.vars["arr[i]"]?.includes("ERROR") ? "bg-accent-red/10 text-accent-red" : ""
                  }`}
                >
                  <div className="text-text-muted font-bold">#{t.step}</div>
                  <div className="text-brand-cyan font-bold">{t.line}</div>
                  <div>{t.vars.max}</div>
                  <div>{t.vars.i}</div>
                  <div className={t.vars["arr[i]"]?.includes("ERROR") ? "text-accent-red font-bold" : "text-text-secondary"}>
                    {t.vars["arr[i]"] || "-"}
                  </div>
                </div>
              ))}

              {traces.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-20 px-4">
                  Debugger idle. Click &ldquo;Step Over&rdquo; to start tracing variables and execution steps.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={selectedLine === null}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        {selectedLine !== null ? `Submit Bug Report: Bug on Line ${selectedLine}` : "Select Buggy Line to Submit"}
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Object Foundry Game (Module 9, Game 1)
// ──────────────────────────────────────────────
function ObjectFoundryGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const className = String(config.class_name ?? "Car");
  const expectedAttributes = (config.expected_attributes as Array<{ name: string; type: string }>) || [];
  const targetSpecs = (config.target_specs as Array<{ color: string; price: number }>) || [];

  const [attributes, setAttributes] = useState<Array<{ name: string; type: string }>>([]);
  const [instantiations, setInstantiations] = useState<Array<{ color: string; price: string }>>([
    { color: "", price: "" },
    { color: "", price: "" },
  ]);

  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const handleAddAttribute = () => {
    setAttributes(prev => [...prev, { name: "", type: "string" }]);
  };

  const handleRemoveAttribute = (idx: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAttributeChange = (idx: number, field: "name" | "type", val: string) => {
    setAttributes(prev => prev.map((a, i) => i === idx ? { ...a, [field]: val } : a));
  };

  const handleInstantiationChange = (idx: number, field: "color" | "price", val: string) => {
    setInstantiations(prev => prev.map((inst, i) => i === idx ? { ...inst, [field]: val } : inst));
  };

  const getClassDeclarationPreview = () => {
    const fields = attributes.map(a => {
      const aName = a.name || "field";
      if (track === "PYTHON") return `        self.${aName} = ${aName}`;
      if (track === "JAVASCRIPT") return `    this.${aName} = ${aName};`;
      if (track === "JAVA" || track === "CPP") {
        const typeMap: Record<string, string> = { number: "double", string: "String", boolean: "boolean" };
        const mappedType = typeMap[a.type] || a.type;
        return `    private ${mappedType} ${aName};\n    public void set${aName.charAt(0).toUpperCase() + aName.slice(1)}(${mappedType} ${aName}) { this.${aName} = ${aName}; }`;
      }
      return `    this.${aName} = ${aName};`;
    }).join("\n");

    const params = attributes.map(a => {
      const aName = a.name || "field";
      if (track === "PYTHON" || track === "JAVASCRIPT") return aName;
      const typeMap: Record<string, string> = { number: "double", string: "String", boolean: "boolean" };
      return `${typeMap[a.type] || a.type} ${aName}`;
    }).join(", ");

    switch (track) {
      case "PYTHON":
        return `class ${className}:\n    def __init__(self, ${params}):\n${fields || "        pass"}`;
      case "JAVA":
        return `public class ${className} {\n    public ${className}(${params}) {\n${fields.replace(/private/g, "this")}\n    }\n}`;
      default: // JAVASCRIPT
        return `class ${className} {\n  constructor(${params}) {\n${fields}\n  }\n}`;
    }
  };

  const getInstantiationPreview = (idx: number) => {
    const inst = instantiations[idx] || { color: "", price: "" };
    const colVal = inst.color ? `"${inst.color}"` : '"red"';
    const prVal = inst.price || "15000";

    switch (track) {
      case "PYTHON":
        return `car${idx + 1} = ${className}(${colVal}, ${prVal})`;
      case "JAVA":
      case "CPP":
        return `${className} car${idx + 1} = new ${className}(${colVal}, ${prVal});`;
      default: // JAVASCRIPT
        return `const car${idx + 1} = new ${className}(${colVal}, ${prVal});`;
    }
  };

  const handleSubmit = () => {
    onSubmit({
      attributes,
      instantiations: instantiations.map(inst => ({
        args: [inst.color ? `"${inst.color}"` : "", inst.price],
      })),
      time_seconds: 90,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Define a class blueprint for <strong className="text-white">{className}</strong> on the assembly line. Define its attributes, then configure constructor instantiations to fulfill the target orders.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Target Orders */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4 h-fit">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Target Orders
          </h4>
          <div className="space-y-4 text-xs text-text-secondary">
            {targetSpecs.map((spec, idx) => (
              <div key={idx} className="bg-[#0A0E1A] p-3 rounded-lg border border-border space-y-2">
                <p className="font-sans font-bold text-white uppercase tracking-wide text-[10px]">Order #{idx + 1}</p>
                <div className="font-mono space-y-1">
                  <div className="flex justify-between">
                    <span>Color:</span>
                    <span className="text-brand-cyan font-bold">{spec.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="text-accent-orange font-bold">${spec.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blueprint Editor & Instantiator */}
        <div className="md:col-span-2 space-y-6">
          {/* Blueprint Editor */}
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Blueprint Fields</h4>
              <button
                onClick={handleAddAttribute}
                className="flex items-center gap-1 text-[11px] text-brand-cyan hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Attribute
              </button>
            </div>

            <div className="space-y-2">
              {attributes.map((a, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-[#0A0E1A] p-2.5 rounded-lg border border-border">
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => handleAttributeChange(idx, "name", e.target.value)}
                    placeholder="Field name"
                    className="flex-1 bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                  />
                  <select
                    value={a.type}
                    onChange={(e) => handleAttributeChange(idx, "type", e.target.value)}
                    className="bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="boolean">boolean</option>
                  </select>
                  <button
                    onClick={() => handleRemoveAttribute(idx)}
                    className="text-text-muted hover:text-accent-red p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {attributes.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-2">No attributes defined yet.</p>
              )}
            </div>
          </div>

          {/* Instantiation Panel */}
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Constructor Arguments</h4>

            <div className="space-y-4">
              {instantiations.map((inst, idx) => (
                <div key={idx} className="bg-[#0A0E1A] p-3 rounded-lg border border-border space-y-3">
                  <p className="text-[10px] font-mono font-bold text-text-muted uppercase">Instance #{idx + 1} Arguments</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-text-secondary mb-1 font-mono uppercase">Color (String)</label>
                      <input
                        type="text"
                        value={inst.color}
                        onChange={(e) => handleInstantiationChange(idx, "color", e.target.value)}
                        placeholder="e.g. red"
                        className="w-full bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-secondary mb-1 font-mono uppercase">Price (Number)</label>
                      <input
                        type="number"
                        value={inst.price}
                        onChange={(e) => handleInstantiationChange(idx, "price", e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Code Preview */}
          <div className="bg-[#0A0E1A] border border-border rounded-xl p-4 font-mono text-[11px] text-text-secondary select-none space-y-3 leading-relaxed">
            <div>
              <span className="text-text-muted">// Class Blueprint Preview:</span>
              <pre className="mt-1 text-white font-semibold whitespace-pre-wrap">{getClassDeclarationPreview()}</pre>
            </div>
            <div className="border-t border-border/40 pt-2">
              <span className="text-text-muted">// Instantiations Preview:</span>
              <pre className="mt-1 text-white font-semibold whitespace-pre-wrap">
                {getInstantiationPreview(0)}
                {"\n"}
                {getInstantiationPreview(1)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={attributes.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Object Foundry Blueprint
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Wire & Register Game (Module 7, Game 1)
// ──────────────────────────────────────────────
function WireRegisterGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const [connections, setConnections] = useState<Array<{ from: string; to: string }>>([]);
  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const handleAddConnection = (from: string, to: string) => {
    if (connections.some((c) => c.from === from && c.to === to)) return;
    setConnections((prev) => [...prev, { from, to }]);
  };

  const handleRemoveConnection = (idx: number) => {
    setConnections((prev) => prev.filter((_, i) => i !== idx));
  };

  // Simulate state
  const state = { INPUT: 42, SP: 0, OUTPUT_A: 0, RAM: { 42: 99 } };
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    for (const conn of connections) {
      let value = 0;
      if (conn.from === "INPUT") {
        value = state.INPUT;
      } else if (conn.from === "SP") {
        value = state.SP;
      } else if (conn.from === "RAM[SP]") {
        value = state.RAM[state.SP as keyof typeof state.RAM] || 0;
      }

      if (conn.to === "SP") {
        if (state.SP !== value) {
          state.SP = value;
          changed = true;
        }
      } else if (conn.to === "OUTPUT_A") {
        if (state.OUTPUT_A !== value) {
          state.OUTPUT_A = value;
          changed = true;
        }
      }
    }
  }

  const getCodePreview = () => {
    const lines: string[] = [];
    if (track === "C" || track === "CPP") {
      lines.push("int input_val = 42;");
      lines.push("int* sp = NULL;");
      lines.push("int ram_cell = 99;");
      lines.push("int output_a = 0;");
      lines.push("");
      lines.push("// Resulting execution sequence:");
      connections.forEach((c) => {
        if (c.from === "INPUT" && c.to === "SP") {
          lines.push("sp = &input_val; // SP points to INPUT");
        } else if (c.from === "RAM[SP]" && c.to === "OUTPUT_A") {
          lines.push("output_a = *sp; // output_a receives dereferenced sp");
        } else if (c.from === "SP" && c.to === "OUTPUT_A") {
          lines.push("output_a = (int)sp; // output_a receives raw address pointer value");
        } else if (c.from === "INPUT" && c.to === "OUTPUT_A") {
          lines.push("output_a = input_val; // output_a receives input directly");
        }
      });
    } else {
      lines.push("let input_val = 42;");
      lines.push("let sp = null;");
      lines.push("let ram_cell = 99;");
      lines.push("let output_a = 0;");
      lines.push("");
      lines.push("// Resulting execution sequence:");
      connections.forEach((c) => {
        if (c.from === "INPUT" && c.to === "SP") {
          lines.push("sp = input_val; // sp reference bounds input");
        } else if (c.from === "RAM[SP]" && c.to === "OUTPUT_A") {
          lines.push("output_a = ram[sp]; // output_a receives dereferenced index");
        } else if (c.from === "SP" && c.to === "OUTPUT_A") {
          lines.push("output_a = sp; // output_a receives direct value copy");
        } else if (c.from === "INPUT" && c.to === "OUTPUT_A") {
          lines.push("output_a = input_val;");
        }
      });
    }
    return lines.join("\n");
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Establish the correct wire routing to load the input value into the Stack Pointer (<code className="text-white">SP</code>), and then dereference it to populate <code className="text-white">OUTPUT_A</code> with the memory value.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wire Editor */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Configure Connection Wires</h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="block text-text-muted mb-2 uppercase tracking-wide text-[10px]">Source Port (From)</span>
              <div className="space-y-2">
                {["INPUT", "SP", "RAM[SP]"].map((src) => (
                  <button
                    key={src}
                    onClick={() => {
                      const tgt = src === "INPUT" ? "SP" : "OUTPUT_A";
                      handleAddConnection(src, tgt);
                    }}
                    className="w-full text-left px-3 py-2 bg-[#0A0E1A] hover:bg-brand-cyan/5 border border-border rounded text-white font-mono hover:border-brand-cyan/40 transition-colors"
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-text-muted mb-2 uppercase tracking-wide text-[10px]">Target Port (To)</span>
              <div className="space-y-2">
                {["SP", "OUTPUT_A"].map((tgt) => (
                  <button
                    key={tgt}
                    onClick={() => {
                      const src = tgt === "SP" ? "INPUT" : "RAM[SP]";
                      handleAddConnection(src, tgt);
                    }}
                    className="w-full text-left px-3 py-2 bg-[#0A0E1A] hover:bg-brand-cyan/5 border border-border rounded text-white font-mono hover:border-brand-cyan/40 transition-colors"
                  >
                    {tgt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-4">
            <span className="block text-text-muted mb-2 uppercase tracking-wide text-[10px]">Active Wires</span>
            <div className="space-y-2">
              {connections.map((c, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#0A0E1A] px-3 py-2 rounded border border-border font-mono text-xs">
                  <span className="text-white">
                    <span className="text-brand-cyan">{c.from}</span> ➔ <span className="text-accent-purple">{c.to}</span>
                  </span>
                  <button onClick={() => handleRemoveConnection(idx)} className="text-text-muted hover:text-accent-red">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {connections.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-4">No wire connections added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* State Visualizer */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Live Simulation State</h4>
            <div className="font-mono text-xs space-y-3 bg-[#0A0E1A] p-4 rounded-lg border border-border">
              <div className="flex justify-between border-b border-border/30 pb-2">
                <span className="text-text-secondary">INPUT (value):</span>
                <span className="text-accent-green font-bold">{state.INPUT}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-2">
                <span className="text-text-secondary">Register SP:</span>
                <span className={state.SP === 42 ? "text-accent-green font-bold" : "text-white font-bold"}>{state.SP}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-2">
                <span className="text-text-secondary">RAM[SP] (resolves to RAM[{state.SP}]):</span>
                <span className={state.SP === 42 ? "text-accent-green font-bold" : "text-white font-bold"}>
                  {state.SP === 42 ? state.RAM[42] : 0}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-text-secondary">OUTPUT_A (target output):</span>
                <span className={state.OUTPUT_A === 99 ? "text-accent-green font-bold text-sm" : "text-accent-red font-bold text-sm"}>
                  {state.OUTPUT_A}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0E1A] border border-border rounded-xl p-4 font-mono text-[10px] text-text-muted">
            <span className="block mb-2">// Language Code Preview ({track})</span>
            <pre className="text-white whitespace-pre-wrap">{getCodePreview()}</pre>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSubmit({ connections })}
        disabled={connections.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Register Connections
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Heap Heist Game (Module 7, Game 2)
// ──────────────────────────────────────────────
function HeapHeistGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const codeSequence = (config.code_sequence as string[]) || [];

  const [ptr1Target, setPtr1Target] = useState<string>("");
  const [ptr2Target, setPtr2Target] = useState<string>("");
  const [freedBlocks, setFreedBlocks] = useState<string[]>([]);

  const toggleFreed = (addr: string) => {
    setFreedBlocks((prev) =>
      prev.includes(addr) ? prev.filter((x) => x !== addr) : [...prev, addr]
    );
  };

  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const getHeapVisual = () => {
    const hasRefA = ptr1Target === "0x1000" || ptr2Target === "0x1000";
    const hasRefB = ptr1Target === "0x2000" || ptr2Target === "0x2000";

    const isFreedA = freedBlocks.includes("0x1000");
    const isFreedB = freedBlocks.includes("0x2000");

    return [
      {
        id: "A",
        addr: "0x1000",
        label: "Block A (size 4 bytes)",
        hasRef: hasRefA,
        isFreed: isFreedA,
        status: isFreedA ? "DEALLOCATED" : hasRefA ? "REFERENCED" : "LEAKED ⚠️",
        statusColor: isFreedA ? "text-text-muted" : hasRefA ? "text-accent-green" : "text-accent-orange font-bold animate-pulse",
      },
      {
        id: "B",
        addr: "0x2000",
        label: "Block B (size 4 bytes)",
        hasRef: hasRefB,
        isFreed: isFreedB,
        status: isFreedB ? "DEALLOCATED" : hasRefB ? "REFERENCED" : "LEAKED ⚠️",
        statusColor: isFreedB ? "text-text-muted" : hasRefB ? "text-accent-green" : "text-accent-orange font-bold",
      },
    ];
  };

  const handleSubmit = () => {
    const allocations = [];
    if (ptr1Target) allocations.push({ pointer: "ptr1", heap_address: ptr1Target });
    if (ptr2Target) allocations.push({ pointer: "ptr2", heap_address: ptr2Target });

    onSubmit({
      allocations,
      freed: freedBlocks,
      time_seconds: 90,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Trace the pointer reassignments and memory deallocations in the code sequence. Link stack pointers to their final heap blocks, and mark the correct blocks as freed to prevent memory leaks and dangling pointers.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code & Pointers Panel */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Code Sequence ({track})</h4>
            <div className="font-mono text-xs bg-[#0A0E1A] p-4 rounded-lg border border-border space-y-2 select-none">
              {codeSequence.map((line, idx) => (
                <div key={idx} className="text-text-secondary">
                  <span className="text-text-muted mr-3">{idx + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Stack Pointers Mappings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#0A0E1A] p-3 rounded border border-border">
                <span className="font-mono text-xs text-white font-bold">ptr1 (Pointer)</span>
                <select
                  value={ptr1Target}
                  onChange={(e) => setPtr1Target(e.target.value)}
                  className="bg-[#111827] border border-border rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                >
                  <option value="">-- Unassigned --</option>
                  <option value="0x1000">0x1000 (Block A)</option>
                  <option value="0x2000">0x2000 (Block B)</option>
                </select>
              </div>

              <div className="flex items-center justify-between bg-[#0A0E1A] p-3 rounded border border-border">
                <span className="font-mono text-xs text-white font-bold">ptr2 (Pointer)</span>
                <select
                  value={ptr2Target}
                  onChange={(e) => setPtr2Target(e.target.value)}
                  className="bg-[#111827] border border-border rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                >
                  <option value="">-- Unassigned --</option>
                  <option value="0x1000">0x1000 (Block A)</option>
                  <option value="0x2000">0x2000 (Block B)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Heap Blocks Panel */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Heap Allocation Blocks</h4>

          <div className="space-y-4">
            {getHeapVisual().map((block) => (
              <div
                key={block.id}
                className={`p-4 rounded-xl border transition-all ${
                  block.isFreed
                    ? "bg-[#0A0E1A]/40 border-border/40"
                    : block.hasRef
                    ? "bg-[#0A0E1A] border-accent-green/30"
                    : "bg-[#0A0E1A] border-accent-orange/40"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-xs text-white font-bold">{block.label}</p>
                    <p className="font-mono text-[10px] text-text-muted mt-0.5">Address: {block.addr}</p>
                  </div>
                  <span className={`font-mono text-[10px] uppercase ${block.statusColor}`}>
                    {block.status}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-border/40 pt-3">
                  <span className="text-xs text-text-secondary">Deallocate Block:</span>
                  <button
                    onClick={() => toggleFreed(block.addr)}
                    className={`px-3 py-1 rounded font-mono text-xs font-bold border transition-colors ${
                      block.isFreed
                        ? "bg-accent-green text-bg-primary border-accent-green"
                        : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40 hover:text-white"
                    }`}
                  >
                    {block.isFreed ? "FREED" : "CALL FREE()"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors"
      >
        Submit Memory Lifecycle Config
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Test Case Tower Game (Module 8, Game 2)
// ──────────────────────────────────────────────
function TestCaseTowerGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const codeSnippet = String(config.code_snippet ?? "");
  const [testCases, setTestCases] = useState<Array<{ x: string; y: string }>>([]);
  const [inputX, setInputX] = useState<string>("");
  const [inputY, setInputY] = useState<string>("");

  const handleAddTestCase = () => {
    if (testCases.length >= 3) {
      toast.error("Maximum limit of 3 test cases reached!");
      return;
    }
    setTestCases((prev) => [...prev, { x: inputX || "0", y: inputY || "0" }]);
    setInputX("");
    setInputY("");
  };

  const handleRemoveTestCase = (idx: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== idx));
  };

  // Evaluate branches locally
  const getBranchCoverage = () => {
    const coverage = {
      "Branch A": false,
      "Branch B": false,
      "Branch C": false,
    };

    testCases.forEach((tc) => {
      const x = Number(tc.x);
      const y = Number(tc.y);
      if (x > 0 && y < 5) {
        coverage["Branch A"] = true;
      } else if (x === 0) {
        coverage["Branch B"] = true;
      } else {
        coverage["Branch C"] = true;
      }
    });

    return coverage;
  };

  const coverage = getBranchCoverage();

  const handleSubmit = () => {
    onSubmit({
      test_cases: testCases.map((tc) => ({
        x: Number(tc.x),
        y: Number(tc.y),
      })),
      time_seconds: 90,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Design a set of test inputs to achieve <strong className="text-white">100% Branch Coverage</strong> for the function snippet. Note: you must cover all branches using <strong className="text-white">at most 3 test cases</strong>!
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Code Snippet */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Function Code</h4>
          <pre className="font-mono text-xs bg-[#0A0E1A] p-4 rounded-lg border border-border text-white whitespace-pre-wrap select-none leading-relaxed">
            {codeSnippet}
          </pre>
        </div>

        {/* Center: Branch Tower */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider mb-4">Branch Tower</h4>
            <div className="space-y-3">
              {[
                { name: "Branch A", cond: "x > 0 && y < 5", covered: coverage["Branch A"] },
                { name: "Branch B", cond: "else if (x === 0)", covered: coverage["Branch B"] },
                { name: "Branch C", cond: "else (default)", covered: coverage["Branch C"] },
              ].reverse().map((floor) => (
                <div
                  key={floor.name}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    floor.covered
                      ? "bg-accent-green/10 border-accent-green text-accent-green shadow-[0_0_10px_rgba(6,214,160,0.15)]"
                      : "bg-[#0A0E1A] border-border text-text-muted"
                  }`}
                >
                  <p className="text-xs font-bold font-mono tracking-wide">{floor.name}</p>
                  <p className="text-[10px] font-mono mt-1">{floor.cond}</p>
                  <span className="inline-block text-[9px] font-mono font-bold mt-2 uppercase px-1.5 py-0.5 rounded bg-bg-secondary">
                    {floor.covered ? "✓ COVERED" : "✗ UNCOVERED"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border/40 pt-4 text-center">
            <span className="text-xs text-text-secondary font-mono">
              Total Coverage:{" "}
              <strong className="text-white">
                {Object.values(coverage).filter(Boolean).length} / 3
              </strong>{" "}
              branches
            </span>
          </div>
        </div>

        {/* Right: Test Cases Inputs */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Test Suite Inputs</h4>

            <div className="bg-[#0A0E1A] p-3 rounded-lg border border-border space-y-3">
              <div>
                <label className="block text-[10px] text-text-secondary mb-1 font-mono uppercase">Parameter x (Number)</label>
                <input
                  type="number"
                  value={inputX}
                  onChange={(e) => setInputX(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary mb-1 font-mono uppercase">Parameter y (Number)</label>
                <input
                  type="number"
                  value={inputY}
                  onChange={(e) => setInputY(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full bg-[#111827] border border-border rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <button
                onClick={handleAddTestCase}
                disabled={testCases.length >= 3}
                className="w-full py-1.5 bg-[#111827] hover:bg-brand-cyan/10 border border-border hover:border-brand-cyan/40 text-brand-cyan text-xs font-mono font-bold rounded transition-colors"
              >
                + Add Test Case
              </button>
            </div>

            <div className="border-t border-border/40 pt-3 space-y-2">
              <span className="block text-text-muted uppercase tracking-wide text-[9px]">Test Cases ({testCases.length}/3)</span>
              {testCases.map((tc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#0A0E1A] px-3 py-2 rounded border border-border font-mono text-xs">
                  <span className="text-white">
                    x: <span className="text-brand-cyan font-bold">{tc.x}</span>, y: <span className="text-accent-purple font-bold">{tc.y}</span>
                  </span>
                  <button onClick={() => handleRemoveTestCase(idx)} className="text-text-muted hover:text-accent-red">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {testCases.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-2">No test inputs defined.</p>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={testCases.length === 0}
            className="w-full py-2.5 bg-brand-cyan text-bg-primary font-bold rounded-lg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 text-xs uppercase"
          >
            Run Test Suite
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Constructor Chain Game (Module 9, Game 2)
// ──────────────────────────────────────────────
function ConstructorChainGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const targetDesc = String(config.target_desc ?? "");
  const [chain, setChain] = useState<string[]>([]);
  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const handleAddBlock = (block: string) => {
    setChain((prev) => [...prev, block]);
  };

  const handleRemoveBlock = (idx: number) => {
    setChain((prev) => prev.filter((_, i) => i !== idx));
  };

  const getBlockCodeLabel = (block: string) => {
    if (track === "PYTHON") {
      if (block === "super") return "super().__init__(color, price)";
      if (block === "this_maxSpeed") return "self.maxSpeed = maxSpeed";
      if (block === "this") return "self.__init__(color, price) # Overload";
    } else if (track === "JAVA" || track === "JAVASCRIPT") {
      if (block === "super") return "super(color, price);";
      if (block === "this_maxSpeed") return "this.maxSpeed = maxSpeed;";
      if (block === "this") return "this(color, price); // Overload";
    } else if (track === "CPP") {
      if (block === "super") return ": Car(color, price)";
      if (block === "this_maxSpeed") return "maxSpeed(maxSpeed)";
      if (block === "this") return ": SportsCar(color, price) // Overload";
    }
    return block;
  };

  const getPreviewCode = () => {
    const lines: string[] = [];
    if (track === "PYTHON") {
      lines.push("class SportsCar(Car):");
      lines.push("    def __init__(self, color, price, maxSpeed):");
      if (chain.length === 0) {
        lines.push("        # Arrange constructor chain blocks here...");
      } else {
        chain.forEach((b) => {
          lines.push(`        ${getBlockCodeLabel(b)}`);
        });
      }
    } else if (track === "JAVA") {
      lines.push("public class SportsCar extends Car {");
      lines.push("    public SportsCar(String color, double price, int maxSpeed) {");
      if (chain.length === 0) {
        lines.push("        // Arrange constructor chain blocks here...");
      } else {
        chain.forEach((b) => {
          lines.push(`        ${getBlockCodeLabel(b)}`);
        });
      }
      lines.push("    }");
      lines.push("}");
    } else if (track === "CPP") {
      lines.push("class SportsCar : public Car {");
      lines.push("public:");
      const initList = chain.map((b) => getBlockCodeLabel(b)).join(", ");
      lines.push(`    SportsCar(string color, double price, int maxSpeed) ${initList ? initList + " {}" : "{}"}`);
      lines.push("};");
    } else {
      lines.push("class SportsCar extends Car {");
      lines.push("  constructor(color, price, maxSpeed) {");
      if (chain.length === 0) {
        lines.push("    // Arrange constructor chain blocks here...");
      } else {
        chain.forEach((b) => {
          lines.push(`    ${getBlockCodeLabel(b)}`);
        });
      }
      lines.push("  }");
      lines.push("}");
    }
    return lines.join("\n");
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Arrange the constructor blocks in the correct execution order to delegate parent constructor initialization and assign subclass fields.
      </div>

      <div className="bg-[#111827] border border-border p-4 rounded-xl text-xs text-text-secondary font-mono">
        <strong>Goal:</strong> {targetDesc}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Available Blocks */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Available Delegation Blocks</h4>
          <div className="space-y-2">
            {[
              { id: "super", desc: "Parent Constructor call" },
              { id: "this_maxSpeed", desc: "Local Attribute initializer" },
              { id: "this", desc: "Overloaded Constructor delegation (distractor)" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => handleAddBlock(b.id)}
                className="w-full flex flex-col text-left p-3 bg-[#0A0E1A] hover:bg-brand-cyan/5 border border-border rounded hover:border-brand-cyan/40 transition-all"
              >
                <span className="font-mono text-xs text-white font-bold">{getBlockCodeLabel(b.id)}</span>
                <span className="text-[10px] text-text-muted mt-1">{b.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chain Sequence */}
        <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Your Execution Chain</h4>
          <div className="min-h-36 bg-[#0A0E1A] border border-dashed border-border rounded-lg p-3 space-y-2">
            {chain.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#111827] px-3 py-2 rounded border border-border font-mono text-xs">
                <span className="text-white font-semibold">
                  <span className="text-text-muted mr-2">#{idx + 1}</span> {getBlockCodeLabel(b)}
                </span>
                <button onClick={() => handleRemoveBlock(idx)} className="text-text-muted hover:text-accent-red">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {chain.length === 0 && (
              <p className="text-xs text-text-muted italic text-center py-10">Click blocks on the left to chain them.</p>
            )}
          </div>
        </div>
      </div>

      {/* Code Preview */}
      <div className="bg-[#0A0E1A] border border-border rounded-xl p-4 font-mono text-[10px] text-text-secondary">
        <span className="block mb-2">// Chain Code Preview ({track})</span>
        <pre className="text-white whitespace-pre-wrap font-semibold leading-relaxed">{getPreviewCode()}</pre>
      </div>

      <button
        onClick={() => onSubmit({ chain })}
        disabled={chain.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit Constructor Chain
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Shape Shifter Arena Game (Module 10, Game 1)
// ──────────────────────────────────────────────
function ShapeShifterArenaGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const [assignments, setAssignments] = useState<Record<string, string>>({
    slot1: "",
    slot2: "",
  });
  const [calls, setCalls] = useState<string[]>([]);
  const track = (userTrack || "JAVASCRIPT").toUpperCase();

  const handleAssign = (slot: string, cls: string) => {
    setAssignments((prev) => ({ ...prev, [slot]: cls }));
  };

  const handleAddCall = (call: string) => {
    setCalls((prev) => [...prev, call]);
  };

  const handleRemoveCall = (idx: number) => {
    setCalls((prev) => prev.filter((_, i) => i !== idx));
  };

  const getCodePreview = () => {
    const lines: string[] = [];
    const ass1 = assignments.slot1 || "[Unassigned]";
    const ass2 = assignments.slot2 || "[Unassigned]";

    if (track === "PYTHON") {
      lines.push(`slot1: Warrior = ${ass1}()`);
      lines.push(`slot2: Warrior = ${ass2}()`);
      lines.push("");
      lines.push("# Action queue execution:");
      calls.forEach((c) => {
        lines.push(`${c.replace(/;/g, "")}`);
      });
    } else if (track === "JAVA" || track === "CPP") {
      lines.push(`Warrior slot1 = new ${ass1}();`);
      lines.push(`Warrior slot2 = new ${ass2}();`);
      lines.push("");
      lines.push("// Action queue execution:");
      calls.forEach((c) => {
        lines.push(`${c}`);
      });
    } else {
      lines.push(`const slot1 = new ${ass1}();`);
      lines.push(`const slot2 = new ${ass2}();`);
      lines.push("");
      lines.push("// Action queue execution:");
      calls.forEach((c) => {
        lines.push(`${c}`);
      });
    }
    return lines.join("\n");
  };

  const handleSubmit = () => {
    onSubmit({
      assignments,
      calls,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl text-sm text-text-secondary leading-relaxed">
        Polymorphism and Method Overriding allow us to store subclass instances inside a base class reference variable (<code className="text-white">Warrior</code>) and invoke dynamic behavior. Dispatch the correct classes to combat targets and queue their overriding method actions.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Arena Setup */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Polymorph Squad Allocation</h4>

            <div className="space-y-4 text-xs">
              <div className="bg-[#0A0E1A] p-4 rounded-lg border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white font-mono">Slot 1 (Target: Spellcaster Weakness)</span>
                  <span className="text-[10px] text-accent-orange font-bold uppercase font-mono">Weak to Magic</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Warrior", "Mage", "Archer"].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => handleAssign("slot1", cls)}
                      className={`py-1.5 rounded font-mono text-[10px] font-bold border transition-colors ${
                        assignments.slot1 === cls
                          ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                          : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A0E1A] p-4 rounded-lg border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white font-mono">Slot 2 (Target: Airborne Weakness)</span>
                  <span className="text-[10px] text-accent-orange font-bold uppercase font-mono">Weak to Physical Ranged</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Warrior", "Mage", "Archer"].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => handleAssign("slot2", cls)}
                      className={`py-1.5 rounded font-mono text-[10px] font-bold border transition-colors ${
                        assignments.slot2 === cls
                          ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                          : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Combat Action Queue Builder</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {["slot1.attack();", "slot2.attack();", "slot1.defend();", "slot2.defend();"].map((call) => (
                <button
                  key={call}
                  onClick={() => handleAddCall(track === "PYTHON" ? call.replace(/;/g, "") : call)}
                  className="px-3 py-2 bg-[#0A0E1A] hover:bg-brand-cyan/5 border border-border hover:border-brand-cyan/40 rounded text-white font-mono transition-colors text-left"
                >
                  + {track === "PYTHON" ? call.replace(/;/g, "") : call}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Queue & Code Preview */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between min-h-[200px]">
            <div>
              <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider mb-3">Action Queue</h4>
              <div className="space-y-2">
                {calls.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0A0E1A] px-3 py-1.5 rounded border border-border font-mono text-xs">
                    <span className="text-white">
                      <span className="text-text-muted mr-2">#{idx + 1}</span> {c}
                    </span>
                    <button onClick={() => handleRemoveCall(idx)} className="text-text-muted hover:text-accent-red">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {calls.length === 0 && (
                  <p className="text-xs text-text-muted italic text-center py-6">No actions queued yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0A0E1A] border border-border rounded-xl p-4 font-mono text-[10px] text-text-secondary">
            <span className="block mb-2">// Polymorph Dispatch Preview ({track})</span>
            <pre className="text-white whitespace-pre-wrap font-semibold leading-relaxed">{getCodePreview()}</pre>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!assignments.slot1 || !assignments.slot2 || calls.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Launch Attack Sequence
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Vault Keeper Game (Module 10, Game 2)
// ──────────────────────────────────────────────
function VaultKeeperGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const track = (userTrack || "JAVASCRIPT").toUpperCase();
  const fields = (config.fields as Array<{ name: string; description: string }>) || [];
  const methods = (config.methods as Array<{ name: string }>) || [];

  const [modifiers, setModifiers] = useState<Record<string, string>>({});
  const [access, setAccess] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialMods: Record<string, string> = {};
    const initialAccess: Record<string, string> = {};
    fields.forEach((f) => {
      initialMods[f.name] = "public";
      initialAccess[f.name] = "readwrite";
    });
    methods.forEach((m) => {
      initialMods[m.name] = "public";
    });
    setModifiers(initialMods);
    setAccess(initialAccess);
  }, [config, fields, methods]);

  const handleModifierChange = (name: string, value: string) => {
    setModifiers((prev) => {
      const updated = { ...prev, [name]: value };
      if (value === "public") {
        setAccess((aPrev) => ({ ...aPrev, [name]: "readwrite" }));
      }
      return updated;
    });
  };

  const handleAccessChange = (name: string, value: string) => {
    if (modifiers[name] === "public" && value !== "readwrite") {
      toast.error("Public fields must have readwrite access.");
      return;
    }
    setAccess((prev) => ({ ...prev, [name]: value }));
  };

  const getVisualFormat = (name: string, isMethod: boolean) => {
    const mod = modifiers[name] || "public";
    if (track === "PYTHON") {
      if (mod === "private") return `__${name}${isMethod ? "()" : ""}`;
      if (mod === "protected") return `_${name}${isMethod ? "()" : ""}`;
      return `${name}${isMethod ? "()" : ""}`;
    }
    if (track === "JAVASCRIPT") {
      if (mod === "private") return `#${name}${isMethod ? "()" : ""}`;
      return `${name}${isMethod ? "()" : ""}`;
    }
    return `${mod} ${isMethod ? "void " : ""}${name}${isMethod ? "()" : ""}`;
  };

  const handleSubmit = () => {
    onSubmit({
      modifiers,
      access,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-secondary leading-relaxed bg-bg-elevated/40 border border-border p-4 rounded-xl">
        Secure the vault by configuring the proper encapsulation modifiers and getters/setters access.
        Fields variables should be encapsulated, and only exposed when necessary.
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-heading font-bold text-white">Class Variables (Fields)</h4>
        {fields.map((f) => (
          <div key={f.name} className="p-4 bg-[#111827] border border-border rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs text-brand-cyan font-bold">{getVisualFormat(f.name, false)}</span>
              <span className="text-[10px] text-text-secondary">{f.description}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase mb-1.5">Access Modifier</p>
                <div className="flex gap-1.5">
                  {(track === "JAVASCRIPT" ? ["private", "public"] : ["private", "protected", "public"]).map((val) => (
                    <button
                      key={val}
                      onClick={() => handleModifierChange(f.name, val)}
                      className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
                        modifiers[f.name] === val
                          ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                          : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase mb-1.5">External Getter/Setter Access</p>
                <div className="flex gap-1.5">
                  {["hidden", "readonly", "readwrite"].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleAccessChange(f.name, val)}
                      disabled={modifiers[f.name] === "public" && val !== "readwrite"}
                      className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
                        access[f.name] === val
                          ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                          : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40 disabled:opacity-30"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        <h4 className="text-sm font-heading font-bold text-white pt-2">Class Methods</h4>
        {methods.map((m) => (
          <div key={m.name} className="p-4 bg-[#111827] border border-border rounded-xl flex justify-between items-center">
            <span className="font-mono text-xs text-brand-cyan font-bold">{getVisualFormat(m.name, true)}</span>
            <div>
              <div className="flex gap-1.5">
                {(track === "JAVASCRIPT" ? ["private", "public"] : ["private", "protected", "public"]).map((val) => (
                  <button
                    key={val}
                    onClick={() => handleModifierChange(m.name, val)}
                    className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
                      modifiers[m.name] === val
                        ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                        : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors"
      >
        Lock & Encapsulate Vault
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Interface Bridge Game (Module 11, Game 1)
// ──────────────────────────────────────────────
function InterfaceBridgeGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const classes = ["Car", "Airplane"];
  const interfaces = ["Drivable", "Flyable"];
  const allMethods = ["drive", "fly"];

  const [mappings, setMappings] = useState<Record<string, string[]>>({ Car: [], Airplane: [] });
  const [methods, setMethods] = useState<Record<string, string[]>>({ Car: [], Airplane: [] });

  const toggleInterface = (cls: string, inf: string) => {
    setMappings((prev) => {
      const current = prev[cls] || [];
      const updated = current.includes(inf) ? current.filter((x) => x !== inf) : [...current, inf];
      return { ...prev, [cls]: updated };
    });
  };

  const toggleMethod = (cls: string, method: string) => {
    setMethods((prev) => {
      const current = prev[cls] || [];
      const updated = current.includes(method) ? current.filter((x) => x !== method) : [...current, method];
      return { ...prev, [cls]: updated };
    });
  };

  const handleSubmit = () => {
    onSubmit({
      mappings,
      methods,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-secondary bg-bg-elevated/40 border border-border p-4 rounded-xl">
        Connect class declarations to the interfaces they implement, and select which method signatures must be declared/implemented to fulfill the contracts.
      </div>

      <div className="space-y-4">
        {classes.map((cls) => (
          <div key={cls} className="p-4 bg-[#111827] border border-border rounded-xl space-y-4">
            <h4 className="font-mono text-sm font-bold text-white">class {cls}</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Interfaces check */}
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Implements Interfaces</p>
                <div className="flex gap-2">
                  {interfaces.map((inf) => {
                    const isSelected = (mappings[cls] || []).includes(inf);
                    return (
                      <button
                        key={inf}
                        onClick={() => toggleInterface(cls, inf)}
                        className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold border transition-colors ${
                          isSelected
                            ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                            : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                        }`}
                      >
                        {inf}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Methods check */}
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase mb-2">Implemented Methods</p>
                <div className="flex gap-2">
                  {allMethods.map((m) => {
                    const isSelected = (methods[cls] || []).includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMethod(cls, m)}
                        className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold border transition-colors ${
                          isSelected
                            ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                            : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                        }`}
                      >
                        {m}()
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors"
      >
        Establish Interface Bridge
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Assembly Yard Game (Module 11, Game 2)
// ──────────────────────────────────────────────
function AssemblyYardGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const parts = [
    { name: "Engine", description: "Car has an Engine. If Car is destroyed, Engine is destroyed." },
    { name: "Wheel", description: "Car has Wheels. If Car is destroyed, Wheels are destroyed." },
    { name: "Driver", description: "Car has a Driver. Driver exists independently of the Car." },
    { name: "NavigationService", description: "Car uses a GPS service to navigate." }
  ];

  const [relationships, setRelationships] = useState<Record<string, string>>({});

  const setRelation = (part: string, val: string) => {
    setRelationships((prev) => ({ ...prev, [part]: val }));
  };

  const handleSubmit = () => {
    onSubmit({
      relationships,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-secondary bg-bg-elevated/40 border border-border p-4 rounded-xl">
        Classify the object-oriented relationships between a container class (<code className="text-white">Car</code>) and its related component classes.
      </div>

      <div className="space-y-4">
        {parts.map((p) => (
          <div key={p.name} className="p-4 bg-[#111827] border border-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-mono text-xs font-bold text-white mb-1">{p.name} Relationship</h4>
              <p className="text-[10px] text-text-secondary">{p.description}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {["composition", "aggregation", "dependency"].map((val) => (
                <button
                  key={val}
                  onClick={() => setRelation(p.name, val)}
                  className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold border transition-all ${
                    relationships[p.name] === val
                      ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                      : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                  }`}
                >
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(relationships).length < 4}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Verify Architecture Relations
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Pattern Forge Game (Module 12, Game 1)
// ──────────────────────────────────────────────
function PatternForgeGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const patternName = (config.pattern_name as string) || "Strategy";
  const components = ["PaymentProcessor", "IPaymentStrategy", "CreditCardPayment", "PayPalPayment"];
  const rolesList = ["Context", "StrategyInterface", "ConcreteStrategy"];

  const [roles, setRoles] = useState<Record<string, string>>({});

  const assignRole = (comp: string, role: string) => {
    setRoles((prev) => ({ ...prev, [comp]: role }));
  };

  const handleSubmit = () => {
    onSubmit({
      roles,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-secondary bg-bg-elevated/40 border border-border p-4 rounded-xl">
        Forge the <span className="text-brand-cyan font-mono font-bold">{patternName} Pattern</span> architecture by mapping each component to its correct design pattern role.
      </div>

      <div className="space-y-4">
        {components.map((comp) => (
          <div key={comp} className="p-4 bg-[#111827] border border-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-mono text-xs font-bold text-white">{comp}</h4>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {rolesList.map((val) => (
                <button
                  key={val}
                  onClick={() => assignRole(comp, val)}
                  className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold border transition-all ${
                    roles[comp] === val
                      ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                      : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(roles).length < components.length}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Verify Design Pattern
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// SOLID Foundations Game (Module 12, Game 2)
// ──────────────────────────────────────────────
function SOLIDFoundationsGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const items = [
    {
      id: "snippet_s",
      desc: "Class User does user auth, profile DB updates, and email sending.",
      principles: ["SRP", "OCP", "LSP", "ISP", "DIP"],
      resolutions: [
        { id: "res_s", name: "Separate class UserAuth, UserRepo, and EmailService" },
        { id: "res_o", name: "Introduce Strategy pattern for shape drawer" },
        { id: "res_l", name: "Ensure child classes completely fulfill parent contracts" },
        { id: "res_i", name: "Break large interfaces into small role-specific interfaces" },
        { id: "res_d", name: "Inject DB interface instead of instantiating MySQLDatabase" }
      ]
    },
    {
      id: "snippet_o",
      desc: "Adding a shape requires modifying the ShapeDrawer draw() function with an if-else chain.",
      principles: ["SRP", "OCP", "LSP", "ISP", "DIP"],
    },
    {
      id: "snippet_l",
      desc: "Subclass Penguin overrides Fly() but throws NotImplementedException.",
      principles: ["SRP", "OCP", "LSP", "ISP", "DIP"],
    },
    {
      id: "snippet_i",
      desc: "Interface Worker contains 20 methods, forcing robotic class to implement eating methods.",
      principles: ["SRP", "OCP", "LSP", "ISP", "DIP"],
    },
    {
      id: "snippet_d",
      desc: "UserService directly imports and instantiates concrete MySQLDatabase inside constructor.",
      principles: ["SRP", "OCP", "LSP", "ISP", "DIP"],
    }
  ];

  const [violations, setViolations] = useState<Record<string, string>>({});
  const [resolutions, setResolutions] = useState<Record<string, string>>({});

  const setPrincipleVal = (id: string, val: string) => {
    setViolations((prev) => ({ ...prev, [id]: val }));
  };

  const setResolutionVal = (id: string, val: string) => {
    setResolutions((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = () => {
    onSubmit({
      violations,
      resolutions,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-secondary bg-bg-elevated/40 border border-border p-4 rounded-xl font-sans">
        Analyze the architectural violations. For each code scenario, map the violated SOLID principle and match the corresponding clean code resolution.
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-[#111827] border border-border rounded-xl space-y-3">
            <p className="text-xs text-white leading-relaxed">{item.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase mb-1.5">Violates Principle</p>
                <div className="flex flex-wrap gap-1">
                  {item.principles?.map((val) => (
                    <button
                      key={val}
                      onClick={() => setPrincipleVal(item.id, val)}
                      className={`px-2 py-1 rounded font-mono text-[9px] font-bold border transition-colors ${
                        violations[item.id] === val
                          ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                          : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] text-text-muted font-bold uppercase mb-1.5">Refactored Resolution</p>
                <select
                  value={resolutions[item.id] || ""}
                  onChange={(e) => setResolutionVal(item.id, e.target.value)}
                  className="w-full bg-[#0A0E1A] border border-border rounded p-1.5 font-mono text-[10px] text-white hover:border-brand-cyan/40 focus:outline-none transition-colors"
                >
                  <option value="">-- Match Resolution --</option>
                  {items[0]?.resolutions?.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(violations).length < 5 || Object.keys(resolutions).length < 5}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Validate SOLID Foundations
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Refactor Run Game (Module 13, Game 1)
// ──────────────────────────────────────────────
function RefactorRunGame({
  config,
  onSubmit,
  userTrack,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
  userTrack: string;
}) {
  const steps = [
    { id: "replace_magic_numbers", label: "Replace magic literal constants with descriptive variables" },
    { id: "extract_method", label: "Extract inner logic / mathematical formula into a separate helper method" },
    { id: "rename_variables", label: "Rename local method parameter names to descriptive identifiers" }
  ];

  const [selected, setSelected] = useState<string[]>([]);

  const toggleStep = (id: string) => {
    if (selected.includes(id)) {
      setSelected((prev) => prev.filter((x) => x !== id));
    } else {
      setSelected((prev) => [...prev, id]);
    }
  };

  const handleReset = () => {
    setSelected([]);
  };

  const handleSubmit = () => {
    onSubmit({
      actions: selected,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-secondary bg-bg-elevated/40 border border-border p-4 rounded-xl leading-relaxed space-y-2">
        <p className="text-white font-bold">Refactoring Mission:</p>
        <p>Clean up a legacy, messy calculator block by ordering your actions. Enforce the strict logical sequence: first isolate constants, then modularize logic by extracting helper functions, and finally rename variables to improve readability.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider mb-3">Refactoring Operations</h4>
          <div className="space-y-2">
            {steps.map((s) => {
              const isAdded = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => !isAdded && toggleStep(s.id)}
                  disabled={isAdded}
                  className="w-full flex items-start gap-2.5 px-3 py-2.5 bg-bg-elevated/60 border border-border rounded-lg text-xs text-white hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all text-left font-mono disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-cyan shrink-0 mt-0.5" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-[#111827] border border-border rounded-xl p-5 flex flex-col justify-between min-h-[180px]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider">Refactor Queue</h4>
              {selected.length > 0 && (
                <button onClick={handleReset} className="text-[10px] text-text-muted hover:text-white flex items-center gap-1">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
            <div className="space-y-2">
              {selected.map((id, idx) => {
                const label = steps.find((s) => s.id === id)?.label || id;
                return (
                  <div key={id} className="flex justify-between items-center bg-[#0A0E1A] px-3 py-2 rounded border border-border font-mono text-[10px] text-white">
                    <span>
                      <span className="text-brand-cyan mr-2">Step #{idx + 1}:</span> {label}
                    </span>
                  </div>
                );
              })}
              {selected.length === 0 && (
                <p className="text-xs text-text-muted italic text-center py-8">Select steps on the left to add them to your queue.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={selected.length === 0}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Run Refactoring Sequence
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Code Review Court Game (Module 13, Game 2)
// ──────────────────────────────────────────────
function CodeReviewCourtGame({
  config,
  onSubmit,
}: {
  config: Record<string, unknown>;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const prLines = [
    { id: "line1", code: 'const query = "SELECT * FROM users WHERE id = " + userId;', desc: "Raw SQL query string concatenating variables directly." },
    { id: "line2", code: "let Constant_rate_value = 0.05;", desc: "Variable declared with snake_case and inconsistent naming styles." },
    { id: "line3", code: "for (let i = 0; i < users.length; i++) { db.queryUser(users[i]); }", desc: "Executing a database connection query inside a loop iteration." },
    { id: "line4", code: "const formattedName = name.trim().toUpperCase();", desc: "Sanitizing input by removing outer whitespace and forcing uppercase." }
  ];

  const [reviews, setReviews] = useState<Record<string, string>>({});

  const setReviewClass = (id: string, classification: string) => {
    setReviews((prev) => ({ ...prev, [id]: classification }));
  };

  const handleSubmit = () => {
    onSubmit({
      reviews,
      time_seconds: 60,
      hints_used: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-text-secondary bg-bg-elevated/40 border border-border p-4 rounded-xl font-sans">
        Evaluate the pull request diff statements. Classify each code implementation line as a security vulnerability, style violation, performance bottleneck, or correct code.
      </div>

      <div className="space-y-4 font-mono text-xs">
        {prLines.map((line) => (
          <div key={line.id} className="p-4 bg-[#111827] border border-border rounded-xl space-y-3">
            <div className="bg-[#0A0E1A] p-2.5 rounded border border-border text-white whitespace-pre-wrap font-semibold overflow-x-auto">
              {line.code}
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="text-[10px] text-text-secondary font-sans">{line.desc}</span>
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {["security_flaw", "style_violation", "performance_issue", "correct_code"].map((val) => (
                  <button
                    key={val}
                    onClick={() => setReviewClass(line.id, val)}
                    className={`px-2.5 py-1.5 rounded text-[9px] font-bold border transition-colors ${
                      reviews[line.id] === val
                        ? "bg-brand-cyan text-bg-primary border-brand-cyan"
                        : "bg-transparent text-text-secondary border-border hover:border-brand-cyan/40"
                    }`}
                  >
                    {val.replace(/_/g, " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={Object.keys(reviews).length < prLines.length}
        className="w-full py-3 bg-brand-cyan text-bg-primary font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
      >
        Submit PR Review
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Result Screen
// ──────────────────────────────────────────────
function ResultScreen({
  result,
  onRetry,
  worldSlug,
}: {
  result: SubmitResult;
  onRetry: () => void;
  worldSlug: string;
}) {
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
          href={`/roadmaps/${worldSlug}`}
          className="px-5 py-2.5 rounded-xl bg-brand-cyan text-bg-primary font-medium hover:bg-brand-cyan/90 transition-colors"
        >
          {result.passed ? "Continue Roadmap" : "Back to Module"}
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
  const [userTrack, setUserTrack] = useState<string>("JAVASCRIPT");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch<GameConfig>(`/games/${id}`),
      apiFetch<{ user: { languageTrack: string } }>("/users/me").catch(() => null)
    ])
      .then(([gameRes, userRes]) => {
        setGame(gameRes.data);
        if (userRes && userRes.data?.user) {
          setUserTrack(userRes.data.user.languageTrack || "JAVASCRIPT");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("This game is locked. Unlock the module first.");
          router.push(`/roadmaps`);
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
        return <IfElseGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "loop_builder":
        return <LoopBuilderGame onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "bfs_explorer":
        return <BfsExplorerGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "dfs_adventure":
        return <DfsAdventureGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "recursion_maze":
        return <RecursionMazeGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "stream_matching":
        return <StreamMatchingGame onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "logic_builder":
        return <LogicBuilderGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "type_sorter":
        return <TypeSorterGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "echo_chamber":
        return <EchoChamberGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "switchboard":
        return <SwitchboardGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "factory_line":
        return <FactoryLineGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "function_workshop":
        return <FunctionWorkshopGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "black_box_factory":
        return <BlackBoxFactoryGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "mirror_halls":
        return <MirrorHallsGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "bug_hunt":
        return <BugHuntGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "object_foundry":
        return <ObjectFoundryGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "wire_register":
        return <WireRegisterGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "heap_heist":
        return <HeapHeistGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "test_case_tower":
        return <TestCaseTowerGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "constructor_chain":
        return <ConstructorChainGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "shape_shifter_arena":
        return <ShapeShifterArenaGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "vault_keeper":
        return <VaultKeeperGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "interface_bridge":
        return <InterfaceBridgeGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "assembly_yard":
        return <AssemblyYardGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "pattern_forge":
        return <PatternForgeGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "solid_foundations":
        return <SOLIDFoundationsGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      case "refactor_run":
        return <RefactorRunGame config={game.config} onSubmit={(p) => void handleSubmit(p)} userTrack={userTrack} />;
      case "code_review_court":
        return <CodeReviewCourtGame config={game.config} onSubmit={(p) => void handleSubmit(p)} />;
      default:
        // Game type not yet implemented — show explicit placeholder
        return (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center text-3xl">
              🚧
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">Game Coming Soon</h3>
              <p className="text-sm text-text-secondary max-w-sm">
                The <span className="text-brand-cyan font-mono">{game.game_type.replace(/_/g, " ")}</span> game for this module is being built as part of Phase 4B.
                Check back after the next update.
              </p>
            </div>
            <Link
              href={`/roadmaps/${slug}`}
              className="px-5 py-2.5 rounded-xl bg-bg-elevated border border-border text-text-secondary hover:text-white text-sm transition-colors"
            >
              Back to Module
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href={`/roadmaps/${slug}`}
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Module Details
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-2xl"
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
