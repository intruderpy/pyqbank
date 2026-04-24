"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question, ExamSession } from "@/types/database";
import "@/styles/browse.css";

const PAGE_SIZE = 20;

export default function SessionQuestionsPage() {
  const params = useParams();
  const sessionId = Number(params.session);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load session info
  useEffect(() => {
    supabase
      .from("exam_sessions")
      .select("*")
      .eq("id", sessionId)
      .single()
      .then(({ data }) => setSession(data));
  }, [sessionId]);

  // Load first page
  const loadQuestions = useCallback(async (pageNum: number) => {
    setLoading(true);
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("exam_session_id", sessionId)
      .order("id")
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    const rows = data ?? [];
    if (rows.length < PAGE_SIZE) setHasMore(false);

    setQuestions((prev) => pageNum === 0 ? rows : [...prev, ...rows]);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { loadQuestions(0); }, [loadQuestions]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadQuestions(next);
  };

  const sessionLabel = session
    ? `${session.year}${session.exam_date ? ` · ${new Date(session.exam_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}${session.shift ? ` · ${session.shift} Shift` : ""}`
    : "Loading...";

  return (
    <main>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span>📚</span><span className="gradient-text">PYQBank</span>
          </Link>
          <div className="navbar-links">
            <Link href="/exams" className="nav-link active">Exams</Link>
            <Link href="/subjects" className="nav-link">Subjects</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: "32px 24px" }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link><span>›</span>
          <Link href="/exams">Exams</Link><span>›</span>
          <span>{sessionLabel}</span>
        </div>

        {loading && questions.length === 0 ? (
          <div style={{ marginTop: "48px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "140px", marginBottom: "16px", borderRadius: "16px" }} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state" style={{ marginTop: "48px" }}>
            <span>📭</span>
            <p>No questions found for this session yet.</p>
          </div>
        ) : (
          <QuestionList
            questions={questions}
            sessionLabel={sessionLabel}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
          />
        )}
      </div>
    </main>
  );
}
