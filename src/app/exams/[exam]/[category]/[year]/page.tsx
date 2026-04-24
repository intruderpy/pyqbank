"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question, ExamSession, Subject, Exam, Category } from "@/types/database";
import { getQuestionsByAdvancedFilter } from "@/lib/queries";
import "@/styles/browse.css";

const PAGE_SIZE = 20;

export default function YearQuestionsPage() {
  const params = useParams();
  const examSlug = params.exam as string;
  const categorySlug = params.category as string;
  const year = Number(params.year);

  const [exam, setExam] = useState<Exam | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  // Filters State
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableShifts, setAvailableShifts] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [allSessions, setAllSessions] = useState<ExamSession[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  // Questions State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  // Initial Metadata & Filter Data Fetch
  useEffect(() => {
    async function fetchInitialData() {
      // Fetch Exam & Category
      const { data: eData }: { data: Exam | null } = await supabase.from("exams").select("*").eq("slug", examSlug).single();
      setExam(eData);
      if (!eData) return;

      const { data: cData }: { data: Category | null } = await supabase.from("categories").select("*").eq("exam_id", eData.id).eq("slug", categorySlug).single();
      setCategory(cData);

      if (!cData) return;

      // Fetch Sessions for this Category & Year
      const { data: sessionData }: { data: ExamSession[] | null } = await supabase
        .from("exam_sessions")
        .select("*")
        .eq("category_id", cData.id)
        .eq("year", year);
      
      const sessions = sessionData ?? [];
      setAllSessions(sessions);

      // Extract unique dates
      const dates = Array.from(new Set(sessions.map((s) => s.exam_date).filter(Boolean))) as string[];
      setAvailableDates(dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime()));

      // Fetch active subjects for this year
      const { data: qData } = await supabase
        .from("questions")
        .select("subject_id, exam_sessions!inner()")
        .eq("exam_sessions.category_id", cData.id)
        .eq("exam_sessions.year", year);
      
      if (qData) {
        const subjectIds = Array.from(new Set(qData.map((q: any) => q.subject_id).filter(Boolean)));
        if (subjectIds.length > 0) {
          const { data: subData } = await supabase.from("subjects").select("*").in("id", subjectIds);
          setAvailableSubjects(subData ?? []);
        }
      }
    }
    fetchInitialData();
  }, [examSlug, categorySlug, year]);

  // Update Shifts when Date changes
  useEffect(() => {
    if (selectedDate) {
      const shiftsForDate = allSessions
        .filter((s) => s.exam_date === selectedDate && s.shift)
        .map((s) => s.shift as string);
      setAvailableShifts(Array.from(new Set(shiftsForDate)));
    } else {
      setAvailableShifts([]);
      setSelectedShift(null); // Clear shift if date is cleared
    }
  }, [selectedDate, allSessions]);

  // Fetch Questions
  const loadQuestions = useCallback(
    async (pageNum: number) => {
      if (!category) return;
      setLoading(true);
      try {
        const rows = await getQuestionsByAdvancedFilter(
          category.id,
          year,
          selectedDate,
          selectedShift,
          selectedSubject,
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
    [category, year, selectedDate, selectedShift, selectedSubject]
  );

  // Trigger reload when filters change
  useEffect(() => {
    if (category) {
      setPage(0);
      loadQuestions(0);
    }
  }, [category, loadQuestions]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadQuestions(next);
  };

  const label = `${category?.name ?? "Questions"} — ${year}`;

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
          <Link href={`/exams/${examSlug}`}>{exam?.name ?? examSlug}</Link><span>›</span>
          <Link href={`/exams/${examSlug}/${categorySlug}`}>{category?.name ?? categorySlug}</Link><span>›</span>
          <span>{year}</span>
        </div>

        <h1 style={{ marginTop: "16px" }}>
          <span className="gradient-text">{category?.name} {year}</span> Questions
        </h1>

        {/* ── Dynamic Filters ─────────────────────────────────── */}
        <div className="filter-bar">
          <div className="filter-group">
            <label>Exam Date</label>
            <select
              className="filter-select"
              value={selectedDate ?? ""}
              onChange={(e) => setSelectedDate(e.target.value || null)}
            >
              <option value="">All Dates</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Shift</label>
            <select
              className="filter-select"
              value={selectedShift ?? ""}
              onChange={(e) => setSelectedShift(e.target.value || null)}
              disabled={!selectedDate || availableShifts.length === 0}
            >
              <option value="">All Shifts</option>
              {availableShifts.map((s) => (
                <option key={s} value={s}>{s} Shift</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Subject</label>
            <select
              className="filter-select"
              value={selectedSubject ?? ""}
              onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Questions List ──────────────────────────────────── */}
        {loading && questions.length === 0 ? (
          <div style={{ marginTop: "48px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "140px", marginBottom: "16px", borderRadius: "16px" }} />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state" style={{ marginTop: "48px" }}>
            <span>📭</span>
            <p>No questions found for the selected filters.</p>
            <button className="btn btn-outline btn-sm" onClick={() => { setSelectedDate(null); setSelectedShift(null); setSelectedSubject(null); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <QuestionList
            questions={questions}
            sessionLabel={label}
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
          display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 200px;
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
