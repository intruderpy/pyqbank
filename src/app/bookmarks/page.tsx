"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question } from "@/types/database";
import "@/styles/browse.css";

export default function BookmarksPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const savedIds = JSON.parse(localStorage.getItem("pyq_bookmarks") || "[]");
        if (savedIds.length === 0) {
          setLoading(false);
          return;
        }

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
          .in("id", savedIds)
          .order('id', { ascending: false });

        if (!error && data) {
          setQuestions(data as unknown as Question[]);
        }
      } catch (err) {
        console.error("Error loading bookmarks:", err);
      } finally {
        setLoading(false);
      }
    }

    loadBookmarks();
  }, []);

  return (
    <main className="container py-8">
      <h1 className="year-heading">📌 Saved Questions</h1>

      {loading ? (
        <div className="skeleton" style={{ height: "300px", width: "100%", marginTop: "24px" }} />
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <span>📍</span>
          <p>You haven't saved any questions yet.</p>
          <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Click the "Save" button on any question to bookmark it for later revision.</p>
        </div>
      ) : (
        <QuestionList
          questions={questions}
          sessionLabel={`Saved: ${questions.length} questions`}
          onLoadMore={() => {}}
          hasMore={false}
          loading={false}
        />
      )}
    </main>
  );
}
