"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UsageData {
  messages_today: number;
  limit: number;
  is_premium: boolean;
}

export default function AiMentorChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your SkillForge AI Mentor. Ask me any conceptual question about variables, conditions, loops, recursion, stack states, or career prep!",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch AI usage and settings when open
  const fetchUsageAndSettings = async () => {
    try {
      const [usageRes, userRes] = await Promise.all([
        apiFetch<UsageData>("/mentor-ai/usage"),
        apiFetch<{ user: { selectedModel?: string } }>("/users/me"),
      ]);
      setUsage(usageRes.data);
      if (userRes.data.user.selectedModel) {
        setSelectedModel(userRes.data.user.selectedModel);
      }
    } catch (error) {
      console.error("Failed to load mentor limits and settings:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void fetchUsageAndSettings();
    }
  }, [isOpen]);

  const handleModelChange = async (modelName: string) => {
    try {
      setSelectedModel(modelName);
      await apiFetch("/users/me/settings", {
        method: "PATCH",
        body: JSON.stringify({ selectedModel: modelName }),
      });
      toast.success(`Active AI model switched to ${modelName}`);
    } catch (error) {
      console.error("Failed to update active model:", error);
      toast.error("Failed to switch model");
    }
  };

  useEffect(() => {
    // Scroll to bottom of message list
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSending(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch<{ reply: string; session_id: string }>("/mentor-ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: userMsg.content, session_id: sessionId }),
      });

      setSessionId(res.data.session_id);
      
      const assistantMsg: ChatMessage = {
        id: "msg-" + Math.random().toString(36).substr(2, 9),
        role: "assistant",
        content: res.data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      void fetchUsageAndSettings();
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        setErrorMessage("Daily limit reached. Upgrade to Premium for unlimited chat!");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      console.error("Mentor chat error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-brand-cyan to-accent-purple text-bg-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/30 transition-all border border-white/10"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <X key="close" className="w-6 h-6 text-white" />
          ) : (
            <MessageSquare key="open" className="w-6 h-6 text-white" />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Dialog Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-[360px] sm:w-[400px] h-[520px] bg-bg-secondary border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-bg-elevated border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-cyan" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-none mb-1">AI Mentor</h4>
                  <select
                    value={selectedModel}
                    onChange={(e) => void handleModelChange(e.target.value)}
                    className="bg-transparent text-[10px] text-text-secondary focus:outline-none cursor-pointer hover:text-white font-medium transition-colors border-none p-0"
                  >
                  {usage?.is_premium ? (
                    <>
                      {/* Premium-only models */}
                      <option value="deepseek-r1-groq" className="bg-bg-elevated text-white">DeepSeek R1 · Groq (Premium)</option>
                      <option value="llama-3.3-70b-groq" className="bg-bg-elevated text-white">Llama 3.3 70B · Groq (Premium)</option>
                      <option value="deepseek-v3" className="bg-bg-elevated text-white">DeepSeek V3 · OpenRouter (Premium)</option>
                      <option value="qwen-3-pro" className="bg-bg-elevated text-white">Qwen3 Pro · OpenRouter (Premium)</option>
                      {/* Free models also available to premium */}
                      <option value="gemini-2.5-flash" className="bg-bg-elevated text-white">Gemini 2.5 Flash</option>
                      <option value="qwen-3" className="bg-bg-elevated text-white">Qwen3 · Groq</option>
                      <option value="llama-4-scout" className="bg-bg-elevated text-white">Llama 4 Scout · Groq</option>
                      <option value="deepseek-r1-free" className="bg-bg-elevated text-white">DeepSeek R1 · OpenRouter</option>
                    </>
                  ) : (
                    <>
                      <option value="gemini-2.5-flash" className="bg-bg-elevated text-white">Gemini 2.5 Flash (Free)</option>
                      <option value="qwen-3" className="bg-bg-elevated text-white">Qwen3 · Groq (Free)</option>
                      <option value="llama-4-scout" className="bg-bg-elevated text-white">Llama 4 Scout · Groq (Free)</option>
                      <option value="deepseek-r1-free" className="bg-bg-elevated text-white">DeepSeek R1 · OpenRouter (Free)</option>
                    </>
                  )}
                  </select>
                </div>
              </div>
              {!usage?.is_premium && usage && (
                <span className="text-[10px] font-mono font-bold bg-bg-primary border border-border rounded px-2 py-0.5 text-text-secondary">
                  Limits: {usage.messages_today}/{usage.limit}
                </span>
              )}
            </div>

            {/* Message Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 font-body scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-cyan text-bg-primary font-medium"
                        : "bg-bg-elevated border border-border/80 text-text-primary"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-bg-elevated border border-border/80 rounded-xl px-4 py-2.5 text-sm text-text-secondary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-accent-red/15 border border-accent-red/20 rounded-xl text-xs text-accent-red">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-bg-elevated border-t border-border flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask something about coding..."
                className="flex-1 bg-bg-primary border border-border rounded-xl px-3.5 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-brand-cyan/50"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 bg-brand-cyan hover:bg-brand-cyan/90 disabled:bg-bg-primary disabled:text-text-muted text-bg-primary font-bold rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
