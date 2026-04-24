"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question, Topic, Subject, Subtopic } from "@/types/database";
import { getQuestionsByTopicAdvanced } from "@/lib/queries";
import "@/styles/browse.css";

const PAGE_SIZE = 20;

export default function TopicQuestionsPage() {
  const params = useParams();
  const subjectSlug = params.subject as string;
  const topicSlug = params.topic as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  // Filters State
  const [availableSubtopics, setAvailableSubtopics] = useState<Subtopic[]>([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Initial Metadata & Filter Data Fetch
  useEffect(() => {
    async function fetchInitialData() {
      // Fetch Subject
      const { data: sub }: { data: Subject | null } = await supabase.from("subjects").select("*").eq("slug", subjectSlug).single();
      setSubject(sub);
      if (!sub) return;

      // Fetch Topic
      const { data: top }: { data: Topic | null } = await supabase.from("topics").select("*").eq("subject_id", sub.id).eq("slug", topicSlug).single();
      setTopic(top);
      if (!top) return;

      // Fetch Active Subtopics (subtopics that have questions under this topic)
      const { data: qData } = await supabase
        .from("questions")
        .select("subtopic_id")
        .eq("topic_id", top.id);

      if (qData) {
        const subtopicIds = Array.from(new Set(qData.map((q: any) => q.subtopic_id).filter(Boolean)));
        if (subtopicIds.length > 0) {
          const { data: subData } = await supabase.from("subtopics").select("*").in("id", subtopicIds).order("name");
          setAvailableSubtopics(subData ?? []);
        }
      }
    }
    fetchInitialData();
  }, [subjectSlug, topicSlug]);

  const loadQuestions = useCallback(
    async (pageNum: number) => {
      if (!topic) return;
      setLoading(true);
      try {
        const rows = await getQuestionsByTopicAdvanced(
          topic.id,
          selectedSubtopic,
          pageNum,
          PAGE_SIZE
        );

        if (rows.length < PAGE_SIZE) setHasMore(false);
        else setHasMore(true);

        setQuestions((prev) => (pageNum === 0 ? rows : [...prev, ...rows]));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    },
    [topic, selectedSubtopic]
  );

  // Trigger reload when topic or filters change
  useEffect(() => {
    if (topic) {
      setPage(0);
      loadQuestions(0);
    }
  }, [topic, selectedSubtopic, loadQuestions]);

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
          <span>{topic?.name ?? topicSlug}</span>
        </div>

        <h1 style={{ marginTop: "16px" }}>
          {subject?.icon}{" "}
          <span className="gradient-text">{topic?.name}</span> Questions
        </h1>

        {/* ── Dynamic Filters ─────────────────────────────────── */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Subtopic</label>
            <select
              className="filter-select"
              value={selectedSubtopic ?? ""}
              onChange={(e) => setSelectedSubtopic(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Subtopics</option>
              {availableSubtopics.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Questions List ──────────────────────────────────── */}
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
            <p>No questions found for the selected subtopic.</p>
            <button className="btn btn-outline btn-sm" onClick={() => setSelectedSubtopic(null)}>
              Clear Filters
            </button>
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

      <style jsx>{`
        .filter-bar {
          display: flex; gap: 16px; flex-wrap: wrap;
          background: var(--bg-card);
          padding: 20px; border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          margin-top: 24px; margin-bottom: 32px;
        }
        .filter-group {
          display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 200px; max-width: 400px;
        }
        .filter-group label {
          font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
        }
        .filter-select {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-default);
          background: var(--bg-surface);
          color: var(--text-primary);
          font-family: var(--font-sans); font-size: 0.95rem;
          outline: none; cursor: pointer; transition: var(--ease-default);
        }
        .filter-select:hover:not(:disabled) { border-color: var(--brand-primary); }
        .filter-select:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </main>
  );
}
