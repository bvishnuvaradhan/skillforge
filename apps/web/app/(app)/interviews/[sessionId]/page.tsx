"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import Editor from "@monaco-editor/react";
import { apiFetch } from "../../../../lib/api";
import { env } from "../../../../env";
import { 
  Code, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  User, 
  Sparkles, 
  Volume2,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function HumanLiveInterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [code, setCode] = useState("// Start typing code cooperatively...\n\nfunction main() {\n  console.log('Collaborative Environment');\n}");
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [partnerCursor, setPartnerCursor] = useState<{ line: number; ch: number } | null>(null);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const [isMentor, setIsMentor] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const isIncomingUpdate = useRef(false);

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails();
      initSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      const res = await apiFetch<any>(`/interviews`);
      const current = res.data.find((s: any) => s.id === sessionId);
      if (!current) {
        toast.error("Session not found");
        router.push("/interviews");
        return;
      }
      setSession(current);
      // Determine if logged in user is the mentor
      const profileRes = await apiFetch<any>("/users/me");
      setIsMentor(profileRes.data.id === current.mentorId);
    } catch (err: any) {
      toast.error(err.message || "Failed to load session details");
    }
  };

  const initSocket = () => {
    const socketUrl = env.NEXT_PUBLIC_SOCKET_URL ?? env.NEXT_PUBLIC_API_URL;
    const socket = io(`${socketUrl}/live-interviews`, {
      withCredentials: true,
      transports: ["websocket"],
      auth: { token: "cookie_based" }, // backend gateway checks authorization headers / cookies
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to live interview socket gateway");
      socket.emit("join_room", { sessionId });
    });

    socket.on("user_joined", (data) => {
      setPartnerConnected(true);
      toast.info("Your interview partner has joined the room!");
    });

    socket.on("code_updated", (data: { code: string }) => {
      isIncomingUpdate.current = true;
      setCode(data.code);
    });

    socket.on("cursor_updated", (data: { cursor: { line: number; ch: number } }) => {
      setPartnerCursor(data.cursor);
    });

    socket.on("interview_finished", () => {
      toast.success("Interview session has been completed by your partner.");
      router.push("/interviews");
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    const val = value ?? "";
    setCode(val);

    if (isIncomingUpdate.current) {
      isIncomingUpdate.current = false;
      return;
    }

    if (socketRef.current) {
      socketRef.current.emit("code_update", { sessionId, code: val });
    }
  };

  const handleCursorChange = (ev: any) => {
    if (socketRef.current) {
      const position = ev.position;
      socketRef.current.emit("cursor_update", {
        sessionId,
        cursor: { line: position.lineNumber, ch: position.column },
      });
    }
  };

  const handleEndInterview = () => {
    if (socketRef.current) {
      socketRef.current.emit("interview_completed", { sessionId });
    }
    toast.success("Ending live room and returning to dashboard...");
    router.push("/interviews");
  };

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      
      {/* Left Pane: Collaborative Code Workspace */}
      <div className="flex-1 flex flex-col h-full bg-[#1e1e1e]">
        <div className="px-6 py-4 border-b border-border bg-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-primary font-bold text-sm font-display">
            <Code className="w-4 h-4 text-brand-cyan" />
            Live Interview Editor
            {partnerCursor && (
              <span className="text-[10px] bg-accent-purple/20 text-accent-purple font-semibold px-2 py-0.5 rounded border border-accent-purple/30 ml-3">
                Partner at L:{partnerCursor.line} C:{partnerCursor.ch}
              </span>
            )}
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
            value={code}
            onChange={handleCodeChange}
            onMount={(editor) => {
              editor.onDidChangeCursorPosition(handleCursorChange);
            }}
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

      {/* Right Pane: Video/Audio Overlay Mockup */}
      <div className="w-[300px] border-l border-border bg-bg-secondary flex flex-col h-full justify-between">
        
        {/* Connection status card */}
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-bold font-display text-text-primary border-b border-border pb-3">
            Participants
          </h2>

          <div className="space-y-4">
            {/* User Participant Card (Local) */}
            <div className="bg-bg-elevated border border-border rounded-xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-purple/20 text-accent-purple border border-accent-purple/30 flex items-center justify-center font-bold">
                  U
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">You (Local User)</h4>
                  <p className="text-[10px] text-brand-cyan font-semibold">
                    {isMentor ? "Host Mentor" : "Student Candidate"}
                  </p>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border/50 pt-2">
                <span className="flex items-center gap-1.5 text-accent-green">
                  <span className="w-2 h-2 rounded-full bg-accent-green"></span>
                  Connected
                </span>
                <div className="flex gap-2">
                  {micActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-accent-red" />}
                  {videoActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5 text-accent-red" />}
                </div>
              </div>
            </div>

            {/* Partner Participant Card (Remote) */}
            <div className={`bg-bg-elevated border border-border rounded-xl p-4 space-y-3 relative overflow-hidden transition-all ${
              partnerConnected ? "opacity-100" : "opacity-60"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 flex items-center justify-center font-bold">
                  P
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">
                    {isMentor ? "Student Candidate" : "Host Mentor"}
                  </h4>
                  <p className="text-[10px] text-text-secondary">
                    {partnerConnected ? "Joined room" : "Waiting for connection..."}
                  </p>
                </div>
              </div>

              {/* Status indicators */}
              <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border/50 pt-2">
                <span className={`flex items-center gap-1.5 ${partnerConnected ? "text-accent-green" : "text-text-muted"}`}>
                  <span className={`w-2 h-2 rounded-full ${partnerConnected ? "bg-accent-green animate-pulse" : "bg-text-muted"}`}></span>
                  {partnerConnected ? "Connected" : "Offline"}
                </span>

                {partnerConnected && (
                  <div className="flex items-center gap-2">
                    {/* Animated waveform representing speech */}
                    <div className="flex items-end gap-0.5 h-3 w-6">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <span
                          key={bar}
                          className="w-1 bg-brand-cyan rounded-full animate-bounce"
                          style={{
                            height: "100%",
                            animationDuration: `${0.4 + bar * 0.1}s`,
                          }}
                        ></span>
                      ))}
                    </div>
                    <Volume2 className="w-3.5 h-3.5 text-brand-cyan" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons (Mic, Camera, Hangup) */}
        <div className="p-6 border-t border-border bg-bg-secondary space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setMicActive(!micActive)}
              className={`p-3 rounded-full border transition-all ${
                micActive 
                  ? "bg-bg-elevated border-border text-text-primary hover:bg-bg-secondary" 
                  : "bg-accent-red/20 border-accent-red/40 text-accent-red hover:bg-accent-red/30"
              }`}
            >
              {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setVideoActive(!videoActive)}
              className={`p-3 rounded-full border transition-all ${
                videoActive 
                  ? "bg-bg-elevated border-border text-text-primary hover:bg-bg-secondary" 
                  : "bg-accent-red/20 border-accent-red/40 text-accent-red hover:bg-accent-red/30"
              }`}
            >
              {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={handleEndInterview}
              className="p-3 rounded-full bg-accent-red text-bg-primary hover:scale-105 transition-all"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-text-muted text-center flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Encrypted secure mock gateway
          </p>
        </div>
      </div>
    </div>
  );
}
