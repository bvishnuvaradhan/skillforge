"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { apiFetch } from "../../../../lib/api";
import { Bot, Send, User, ChevronLeft, Award, Sparkles, CheckCircle, Code, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  code?: string;
  timestamp?: string;
}

export default function AiInterviewRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [codeContent, setCodeContent] = useState("// Type your code response here\n\nfunction solve() {\n  // your code\n}");
  const [sending, setSending] = useState(false);
  const [completing, setCompleting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionId) {
      toast.error("No active session ID specified");
      router.push("/interviews");
      return;
    }
    fetchSessionDetails();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessionDetails = async () => {
    try {
      const res = await apiFetch<any>(`/interviews/${sessionId}/feedback`);
      setSession(res.data.session);
      
      // Load history from Redis via backend controller message sync
      // To keep it simple, we initialize history from the starter message in the db session,
      // or we can request history. Since it returns { session, feedback } and history is in redis,
      // we can fetch the initial greeting that the service stored.
      // We will initialize the chat with a message if history is empty.
      if (res.data.session) {
        // If completed already, redirect to feedback
        if (res.data.session.status === "completed") {
          router.push(`/interviews/feedback/${sessionId}`);
          return;
        }
      }
      
      // Let's add a default welcome message if there are no messages
      setMessages([
        {
          role: "assistant",
          content: "Welcome to your AI Mock Interview! I've loaded your DLT focus topics. Let's begin: Can you describe your approach to reversing a linked list, and then write the implementation in the editor?",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      toast.error(err.message || "Failed to load interview room");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !codeContent.trim()) return;

    const userMsg = inputText.trim();
    const currentCode = codeContent;

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMsg,
        code: currentCode,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInputText("");
    setSending(true);

    try {
      const res = await apiFetch<{ message: string }>(`/interviews/${sessionId}/message`, {
        method: "POST",
        body: JSON.stringify({
          message: userMsg,
          code: currentCode !== "// Type your code response here\n\nfunction solve() {\n  // your code\n}" ? currentCode : undefined,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.message,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message to AI");
    } finally {
      setSending(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (messages.length < 2) {
      toast.error("Please answer at least one question before completing.");
      return;
    }

    try {
      setCompleting(true);
      toast.info("AI Recruiter is scoring your interview. Please wait...");
      const res = await apiFetch<{ success: boolean }>(`/interviews/${sessionId}/complete`, {
        method: "POST",
      });

      if (res.success) {
        toast.success("Interview completed! Generating scorecard...");
        router.push(`/interviews/feedback/${sessionId}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete interview");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      
      {/* Left Pane: Chat Interface */}
      <div className="flex-1 flex flex-col border-r border-border h-full bg-bg-primary">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg-secondary">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/interviews")}
              className="text-text-secondary hover:text-text-primary p-1 bg-bg-elevated rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-cyan" />
              <div>
                <h2 className="font-bold text-text-primary text-sm font-display leading-tight">AI Interviewer</h2>
                <p className="text-[10px] text-text-muted capitalize">
                  {session ? `${session.interviewType} Interview` : "Active Mock Session"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCompleteInterview}
            disabled={completing}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-cyan to-accent-purple text-bg-primary font-bold text-xs py-2.5 px-4 rounded-xl hover:scale-105 shadow-md shadow-brand-cyan/10 transition-all"
          >
            <Award className="w-4 h-4" />
            {completing ? "Grading..." : "Finish Interview"}
          </button>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx}
              className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role !== "user" && (
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-sm shrink-0 border border-brand-cyan/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[75%] space-y-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                  msg.role === "user"
                    ? "bg-accent-purple/20 border-accent-purple/30 text-text-primary"
                    : "bg-bg-secondary border-border text-text-primary"
                }`}>
                  {msg.content}
                </div>

                {msg.code && (
                  <div className="bg-bg-secondary border border-border rounded-xl p-3 text-xs font-mono text-text-secondary overflow-x-auto max-w-full">
                    <span className="text-[10px] text-brand-cyan uppercase tracking-wider block mb-2 font-bold font-sans">
                      Submitted Code
                    </span>
                    <pre className="whitespace-pre">{msg.code}</pre>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-accent-purple/20 text-accent-purple flex items-center justify-center font-bold text-sm shrink-0 border border-accent-purple/30">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Panel */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-bg-secondary flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            placeholder="Type your explanation or response to the AI Interviewer..."
            className="flex-1 bg-bg-elevated border border-border text-text-primary rounded-xl px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-brand-cyan text-sm"
          />
          <button
            type="submit"
            disabled={sending}
            className="bg-brand-cyan text-bg-primary font-bold p-3 rounded-xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Right Pane: Code Editor */}
      <div className="w-[45%] h-full bg-[#1e1e1e] flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary font-bold text-sm font-display">
            <Code className="w-4 h-4 text-brand-cyan" />
            Monaco Workspace
          </div>
          <span className="text-[10px] bg-brand-cyan/20 text-brand-cyan font-bold px-2 py-0.5 rounded border border-brand-cyan/30">
            JavaScript
          </span>
        </div>

        <div className="flex-1 w-full overflow-hidden">
          <Editor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={codeContent}
            onChange={(val) => setCodeContent(val ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "JetBrains Mono",
              lineNumbers: "on",
              wordWrap: "on",
            }}
          />
        </div>
      </div>
    </div>
  );
}
