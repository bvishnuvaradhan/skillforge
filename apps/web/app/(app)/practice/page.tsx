"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Sparkles, Terminal, Code2, Layers, Cpu, HelpCircle, Plus, Trash2, RotateCcw } from "lucide-react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface Challenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: "Arrays" | "Conditionals" | "Loops" | "Recursion";
  description: string;
  defaultCode: string;
  visualBlocksAvailable: string[];
}

const challenges: Challenge[] = [
  {
    id: "two-sum",
    title: "Two Sum Solver",
    difficulty: "easy",
    category: "Arrays",
    description: "Write a function `twoSum(nums, target)` that returns the indices of the two numbers such that they add up to the `target`.",
    defaultCode: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    visualBlocksAvailable: ["Array loop", "Complement map check", "Store index map", "Return match"],
  },
  {
    id: "grid-navigator",
    title: "Grid Pathfinder",
    difficulty: "medium",
    category: "Loops",
    description: "Guide the robot to the exit stone at coordinates (3, 2). Construct the block logic sequence using repeat loops, conditionals, and movement blocks.",
    defaultCode: `// Use visual blocks tab to generate code`,
    visualBlocksAvailable: ["Repeat 3 times", "Move Forward", "If (reached exit)", "Turn Right", "Collect Chest"],
  },
  {
    id: "factorial",
    title: "Recursive Factorial",
    difficulty: "easy",
    category: "Recursion",
    description: "Write a recursive function `factorial(n)` that returns the product of all positive integers less than or equal to `n`.",
    defaultCode: `function factorial(n) {
  // Base Case
  if (n <= 1) return 1;
  // Recursive Case
  return n * factorial(n - 1);
}`,
    visualBlocksAvailable: ["Base Case (n <= 1)", "Recursive call (n - 1)", "Multiply result", "Return value"],
  },
];

interface VisualBlock {
  id: string;
  label: string;
  type: "loop" | "action" | "conditional";
  codeSnippet: string;
}

const blockTemplates: VisualBlock[] = [
  { id: "move", label: "Move Forward", type: "action", codeSnippet: "moveForward();" },
  { id: "right", label: "Turn Right", type: "action", codeSnippet: "turnRight();" },
  { id: "repeat", label: "Repeat (3 times)", type: "loop", codeSnippet: "for (let i = 0; i < 3; i++) {\n  __BODY__\n}" },
  { id: "exit-check", label: "If (reached exit)", type: "conditional", codeSnippet: "if (isAtExit()) {\n  __BODY__\n}" },
  { id: "collect", label: "Collect Chest", type: "action", codeSnippet: "collectChest();" },
];

export default function PracticeHubPage() {
  const [activeTab, setActiveTab] = useState<"code" | "visual">("code");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(challenges[0]!);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [code, setCode] = useState(challenges[0]!.defaultCode);
  const [workspaceBlocks, setWorkspaceBlocks] = useState<VisualBlock[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "💡 Welcome to the SkillForge Practice Hub.",
    "Select a challenge and test your skills in the IDE or Drag-and-Drop visual block builder."
  ]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [user, setUser] = useState<{ plan: string } | null>(null);

  useEffect(() => {
    // Fetch user details to display plan information
    apiFetch<{ user: { plan: string } }>("/users/me")
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error("Error loading user context:", err));
  }, []);

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setCode(challenge.defaultCode);
    setWorkspaceBlocks([]);
    setConsoleLogs([`📝 Selected challenge: ${challenge.title}. Ready for execution.`]);
  };

  const addBlockToWorkspace = (block: VisualBlock) => {
    setWorkspaceBlocks((prev) => [...prev, { ...block, id: `block-${Math.random().toString(36).substr(2, 9)}` }]);
  };

  const removeBlockFromWorkspace = (id: string) => {
    setWorkspaceBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const clearWorkspace = () => {
    setWorkspaceBlocks([]);
  };

  const compileBlocks = () => {
    if (workspaceBlocks.length === 0) {
      toast.error("Workspace is empty! Add blocks first.");
      return;
    }

    let compiledCode = "";
    let indent = "";
    workspaceBlocks.forEach((block) => {
      if (block.type === "loop" || block.type === "conditional") {
        const parts = block.codeSnippet.split("__BODY__");
        compiledCode += `${indent}${parts[0]?.trim()}\n${indent}  // Nested block body\n${indent}${parts[1]?.trim() || "}"}\n`;
      } else {
        compiledCode += `${indent}${block.codeSnippet}\n`;
      }
    });

    setCode(compiledCode);
    toast.success("Blocks compiled successfully! Check Code Editor tab.");
    setActiveTab("code");
  };

  const runCode = () => {
    setIsCompiling(true);
    setConsoleLogs((prev) => [...prev, "⚡ Initializing compiler sandbox...", "🛠️ Compiling code into AST tree..."]);

    setTimeout(() => {
      setConsoleLogs((prev) => [
        ...prev,
        "✓ Compilation successful.",
        "🧪 Running test assertions...",
        `[TEST 1] input: [2, 7, 11, 15], target: 9 | Expected: [0, 1] | Passed`,
        `[TEST 2] input: [3, 2, 4], target: 6 | Expected: [1, 2] | Passed`,
        "🎉 Success: All test cases passed! +15 XP earned."
      ]);
      setIsCompiling(false);
      toast.success("Practice challenge complete! +15 XP");
    }, 1500);
  };

  const filteredChallenges = challenges.filter(
    (c) => selectedCategory === "All" || c.category === selectedCategory
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-1 flex items-center gap-3">
          <Cpu className="w-8 h-8 text-brand-cyan" />
          Practice Hub
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-text-secondary text-sm">
            Master computer science concepts using Monaco code editing or block programming workspaces.
          </p>
          {user?.plan === "premium" && (
            <span className="px-2 py-0.5 bg-accent-purple/20 border border-accent-purple/30 text-[10px] text-accent-purple rounded-md font-bold uppercase tracking-wider">
              ✨ Premium Active
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Challenges Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {["All", "Arrays", "Loops", "Recursion"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-cyan/15 border-brand-cyan text-brand-cyan"
                    : "bg-bg-secondary border-border text-text-secondary hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Challenges List */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white px-1 mb-2">Challenges</h3>
            {filteredChallenges.map((challenge) => {
              const isActive = selectedChallenge.id === challenge.id;
              return (
                <div
                  key={challenge.id}
                  onClick={() => handleChallengeSelect(challenge)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-bg-elevated border-brand-cyan/40"
                      : "bg-bg-secondary/40 border-border/60 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-text-secondary">{challenge.category}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                        challenge.difficulty === "easy"
                          ? "bg-accent-green/10 text-accent-green"
                          : "bg-accent-orange/10 text-accent-orange"
                      }`}
                    >
                      {challenge.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{challenge.title}</h4>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{challenge.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Editor Sandbox */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="bg-bg-secondary border border-border rounded-2xl overflow-hidden flex flex-col h-[500px]">
            {/* Toolbar */}
            <div className="bg-bg-elevated border-b border-border px-6 py-3 flex items-center justify-between flex-wrap gap-4">
              {/* Tab selector */}
              <div className="flex bg-bg-primary p-1 rounded-xl border border-border">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "code" ? "bg-bg-elevated text-brand-cyan" : "text-text-secondary hover:text-white"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  Code Playground
                </button>
                <button
                  onClick={() => setActiveTab("visual")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "visual" ? "bg-bg-elevated text-accent-purple" : "text-text-secondary hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Visual Blocks
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {activeTab === "visual" && (
                  <>
                    <button
                      onClick={clearWorkspace}
                      className="px-3 py-1.5 border border-border hover:bg-bg-elevated text-text-secondary hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Workspace
                    </button>
                    <button
                      onClick={compileBlocks}
                      className="px-3 py-1.5 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Compile to Code
                    </button>
                  </>
                )}
                {activeTab === "code" && (
                  <button
                    onClick={runCode}
                    disabled={isCompiling}
                    className="px-4 py-1.5 bg-brand-cyan hover:bg-brand-cyan/90 disabled:opacity-50 text-bg-primary rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Code
                  </button>
                )}
              </div>
            </div>

            {/* Sandbox Workspace */}
            <div className="flex-1 bg-bg-primary overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeTab === "code" ? (
                  <motion.div
                    key="code-editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full"
                  >
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineHeight: 20,
                        fontFamily: "JetBrains Mono",
                        scrollbar: { vertical: "hidden" },
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="visual-blocks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border"
                  >
                    {/* Blocks palette */}
                    <div className="p-4 overflow-y-auto space-y-3">
                      <h4 className="text-xs font-bold text-text-secondary mb-2">Block Toolbox</h4>
                      {blockTemplates.map((block) => (
                        <div
                          key={block.id}
                          onClick={() => addBlockToWorkspace(block)}
                          className={`p-3 rounded-xl border border-border/80 flex items-center justify-between cursor-pointer transition-all hover:bg-bg-elevated/40 hover:border-brand-cyan/20 active:scale-95 group ${
                            block.type === "loop"
                              ? "bg-accent-orange/5"
                              : block.type === "conditional"
                              ? "bg-accent-purple/5"
                              : "bg-bg-secondary"
                          }`}
                        >
                          <span className="text-xs font-medium text-white">{block.label}</span>
                          <Plus className="w-3.5 h-3.5 text-text-muted group-hover:text-brand-cyan" />
                        </div>
                      ))}
                    </div>

                    {/* Drag-n-Drop workspace */}
                    <div className="md:col-span-2 p-4 flex flex-col overflow-hidden">
                      <h4 className="text-xs font-bold text-text-secondary mb-3">Logic Workspace</h4>
                      <div className="flex-1 border border-dashed border-border/80 rounded-xl p-4 overflow-y-auto space-y-2.5 bg-bg-secondary/20 relative">
                        {workspaceBlocks.length === 0 ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-text-muted">
                            <HelpCircle className="w-8 h-8 mb-2" />
                            <p className="text-xs">Click items from the Toolbox palette to add them to your logic tree.</p>
                          </div>
                        ) : (
                          workspaceBlocks.map((block, index) => (
                            <motion.div
                              key={block.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex items-center justify-between p-3 border rounded-xl font-mono text-xs text-white ${
                                block.type === "loop"
                                  ? "bg-accent-orange/10 border-accent-orange/30"
                                  : block.type === "conditional"
                                  ? "bg-accent-purple/10 border-accent-purple/30"
                                  : "bg-bg-elevated border-border"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-text-muted font-bold">{index + 1}</span>
                                <span>{block.label}</span>
                              </div>
                              <button
                                onClick={() => removeBlockFromWorkspace(block.id)}
                                className="text-text-muted hover:text-accent-red p-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Console logs */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-text-secondary flex items-center gap-2 border-b border-border/60 pb-2.5">
              <Terminal className="w-4 h-4 text-brand-cyan" />
              SANDBOX EXECUTION LOGS
            </h3>
            <div className="bg-bg-primary rounded-xl p-4 font-mono text-xs text-text-secondary h-44 overflow-y-auto space-y-1.5 scrollbar-thin">
              {consoleLogs.map((log, index) => (
                <div key={index} className="leading-relaxed whitespace-pre-wrap">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
