"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question, Subject } from "@/types/database";
import "@/styles/browse.css";

const PAGE_SIZE = 20;

export default function SubjectQuestionsPage() {
  const params = useParams();
  const subjectSlug = params.subject as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch subject info
  useEffect(() => {
    supabase
      .from("subjects")
      .select("*")
      .eq("slug", subjectSlug)
      .single()
      .then(({ data }) => setSubject(data));
  }, [subjectSlug]);

  const loadQuestions = useCallback(
    async (pageNum: number) => {
      if (!subject) return;
      setLoading(true);
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("subject_id", subject.id)
        .order("id")
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const rows = data ?? [];
      if (rows.length < PAGE_SIZE) setHasMore(false);
      setQuestions((prev) => (pageNum === 0 ? rows : [...prev, ...rows]));
      setLoading(false);
    },
    [subject]
  );

  useEffect(() => {
    if (subject) loadQuestions(0);
  }, [subject, loadQuestions]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadQuestions(next);
  };

  return (
    <main>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span>📚</span><span className="gradient-text">PYQBank</span>
          </Link>
          <div className="navbar-links">
            <Link href="/exams" className="nav-link">Exams</Link>
            <Link href="/subjects" className="nav-link active">Subjects</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: "32px 24px" }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link><span>›</span>
          <Link href="/subjects">Subjects</Link><span>›</span>
          <Link href={`/subjects/${subjectSlug}`}>{subject?.name ?? subjectSlug}</Link><span>›</span>
          <span>All Questions</span>
        </div>

        <h1 style={{ marginTop: "16px" }}>
          {subject?.icon} <span className="gradient-text">{subject?.name}</span> Questions
        </h1>

        {loading && questions.length === 0 ? (
          <div style={{ marginTop: "48px" }}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: "140px", marginBottom: "16px", borderRadius: "16px" }}
              />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state" style={{ marginTop: "48px" }}>
            <span>📭</span>
            <p>No questions found for this subject yet.</p>
          </div>
        ) : (
          <QuestionList
            questions={questions}
            sessionLabel={`${subject?.name} — All Questions`}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
          />
        )}
      </div>
    </main>
  );
}
