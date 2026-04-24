"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question, Topic, Subject } from "@/types/database";
import "@/styles/browse.css";

const PAGE_SIZE = 20;

export default function TopicQuestionsPage() {
  const params = useParams();
  const subjectSlug = params.subject as string;
  const topicSlug = params.topic as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch subject first, then topic
    supabase
      .from("subjects")
      .select("*")
      .eq("slug", subjectSlug)
      .single()
      .then(async ({ data: sub }: { data: Subject | null }) => {
        setSubject(sub);
        if (!sub) return;
        const { data: top } = await supabase
          .from("topics")
          .select("*")
          .eq("subject_id", sub.id)
          .eq("slug", topicSlug)
          .single();
        setTopic(top);
      });
  }, [subjectSlug, topicSlug]);

  const loadQuestions = useCallback(
    async (pageNum: number) => {
      if (!topic) return;
      setLoading(true);
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("topic_id", topic.id)
        .order("id")
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const rows = data ?? [];
      if (rows.length < PAGE_SIZE) setHasMore(false);
      setQuestions((prev) => (pageNum === 0 ? rows : [...prev, ...rows]));
      setLoading(false);
    },
    [topic]
  );

  useEffect(() => {
    if (topic) loadQuestions(0);
  }, [topic, loadQuestions]);

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
          <Link href={`/subjects/${subjectSlug}`}>{subject?.name}</Link><span>›</span>
          <span>{topic?.name}</span>
        </div>

        <h1 style={{ marginTop: "16px" }}>
          {subject?.icon}{" "}
          <span className="gradient-text">{topic?.name}</span> Questions
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
            <p>No questions found for this topic yet.</p>
          </div>
        ) : (
          <QuestionList
            questions={questions}
            sessionLabel={`${topic?.name} — All Questions`}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loading={loading}
          />
        )}
      </div>
    </main>
  );
}
