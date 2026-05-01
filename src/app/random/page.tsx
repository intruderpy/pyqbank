"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question } from "@/types/database";
import "@/styles/browse.css";

export default function RandomPracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(20);

  const fetchRandom = async (num: number) => {
    setLoading(true);
    try {
      // Supabase doesn't have a native RANDOM(), so we fetch a large set and shuffle client-side
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          exam_sessions!inner(
            id, year, exam_date, shift,
            exams!inner(name, slug),
            categories!inner(name, slug)
          )
        `)
        .limit(200);

      if (!error && data) {
        // Shuffle and take `num`
        const shuffled = (data as unknown as Question[])
          .sort(() => Math.random() - 0.5)
          .slice(0, num);
        setQuestions(shuffled);
      }
    } catch (err) {
      console.error("Error fetching random questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandom(count);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="container py-8">
      <h1 className="year-heading">🎲 Random Practice</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        Practice a random set of questions from across all exams and subjects.
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
        {[10, 20, 50].map((n) => (
          <button
            key={n}
            className={`btn ${count === n ? "btn-primary" : "btn-outline"}`}
            onClick={() => { setCount(n); fetchRandom(n); }}
          >
            {n} Questions
          </button>
        ))}
        <button
          className="btn btn-outline"
          onClick={() => fetchRandom(count)}
          style={{ marginLeft: "auto" }}
        >
          🔄 Shuffle Again
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: "300px", width: "100%" }} />
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <span>📭</span>
          <p>No questions found. Add some questions first.</p>
        </div>
      ) : (
        <QuestionList
          questions={questions}
          sessionLabel={`Random: ${questions.length} questions`}
          onLoadMore={() => {}}
          hasMore={false}
          loading={false}
        />
      )}
    </main>
  );
}
