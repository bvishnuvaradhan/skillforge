"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, CheckCircle, BookOpen } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface LessonDetail {
  id: string;
  title: string;
  content: Record<string, unknown>;
  order_index: number;
  estimated_minutes: number;
  topic_tags: string[];
  completed: boolean;
}

// Structured content renderer supporting both blocks and sections JSON formats
function LessonContentRenderer({ content }: { content: Record<string, unknown> }) {
  interface LessonItem {
    type: string;
    content?: string;
    text?: string;
    code?: string;
    items?: string[];
  }
  const blocks = (content.blocks as LessonItem[]) ?? [];
  const sections = (content.sections as LessonItem[]) ?? [];

  const itemsToRender = blocks.length > 0 ? blocks : sections;

  if (itemsToRender.length === 0) {
    return (
      <div className="prose prose-invert max-w-none">
        <pre className="bg-bg-elevated rounded-lg p-4 text-sm overflow-x-auto text-text-secondary">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {itemsToRender.map((item, idx) => {
        const type = item.type;
        const text = item.content ?? item.text;
        const code = item.content ?? item.code;

        switch (type) {
          case "text":
          case "paragraph":
            return (
              <p key={idx} className="text-text-secondary leading-relaxed text-base">
                {text}
              </p>
            );
          case "code":
            return (
              <pre key={idx} className="bg-bg-elevated border border-border rounded-xl p-4 text-sm font-mono text-accent-green overflow-x-auto">
                {code}
              </pre>
            );
          case "list":
            return (
              <ul key={idx} className="space-y-2">
                {(item.items ?? []).map((listVal, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary">
                    <span className="text-brand-cyan mt-1 shrink-0">•</span>
                    {listVal}
                  </li>
                ))}
              </ul>
            );
          case "header":
          case "heading":
            return (
              <h3 key={idx} className="text-xl font-heading font-semibold text-white mt-4 first:mt-0">
                {text}
              </h3>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

export default function LessonPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Timer states for enforcing reading behavior
  const [canComplete, setCanComplete] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(10);

  useEffect(() => {
    if (!slug || !id) return;
    apiFetch<LessonDetail>(`/worlds/${slug}/lessons/${id}`)
      .then((res) => {
        setLesson(res.data);
        setCompleted(res.data.completed || false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error("Lesson locked. Complete prerequisites first.");
          router.push(`/worlds`);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, id, router]);

  // Enforce reading timer when lesson is loaded (only if not already completed)
  useEffect(() => {
    if (!lesson || completed) return;
    setCanComplete(false);
    setSecondsRemaining(10);
 
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
 
    return () => clearInterval(timer);
  }, [lesson, completed]);

  const handleComplete = async () => {
    if (!slug || !id || !canComplete) return;
    setCompleting(true);
    try {
      await apiFetch(`/worlds/${slug}/lessons/${id}/complete`, { method: "POST" });
      setCompleted(true);
      toast.success("Lesson complete! +25 XP 🎉");
    } catch {
      toast.error("Failed to mark lesson complete.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse max-w-3xl mx-auto">
        <div className="h-8 bg-bg-elevated rounded w-40 mb-6" />
        <div className="h-8 bg-bg-elevated rounded w-72 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 bg-bg-secondary rounded" style={{ width: `${80 + i * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href={`/worlds/${slug}`}
        className="flex items-center gap-2 text-text-secondary hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to World
      </Link>

      <motion.article
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lesson {lesson.order_index + 1}</span>
            <span>•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{lesson.estimated_minutes} min read</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-4">{lesson.title}</h1>
          <div className="flex flex-wrap gap-2">
            {lesson.topic_tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 text-xs bg-bg-elevated text-text-muted px-2.5 py-1 rounded-full border border-border"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-8" />

        {/* Content */}
        <div className="bg-bg-secondary rounded-2xl border border-border p-8 mb-8">
          <LessonContentRenderer content={lesson.content} />
        </div>

        {/* Complete button */}
        <div className="flex justify-end">
          {completed ? (
            <Link
              href={`/worlds/${slug}`}
              className="flex items-center gap-2 px-6 py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors"
            >
              Back to World
            </Link>
          ) : (
            <button
              onClick={() => void handleComplete()}
              disabled={completing || !canComplete}
              className="flex items-center gap-2 px-6 py-3 bg-brand-cyan text-bg-primary font-semibold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              {completing
                ? "Marking complete..."
                : canComplete
                ? "Mark as Complete (+25 XP)"
                : `Read for ${secondsRemaining}s to complete`}
            </button>
          )}
        </div>
      </motion.article>
    </div>
  );
}
