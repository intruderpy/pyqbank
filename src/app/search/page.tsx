import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import QuestionList from "@/components/questions/QuestionList";
import type { Question } from "@/types/database";

export const metadata: Metadata = {
  title: "Search Results",
  description: "Search for PYQ bank questions.",
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || "";

  let questions: Question[] = [];

  if (query) {
    // Basic implementation: search question_text_en or question_text_hi
    // Use ilike for partial matching if textSearch isn't fully set up yet
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
      .or(`question_text_en.ilike.%${query}%,question_text_hi.ilike.%${query}%`)
      .limit(50);

    if (!error && data) {
      questions = data as unknown as Question[];
    }
  }

  return (
    <div className="container py-8">
      <h1 className="year-heading">Search Results for "{query}"</h1>

      {!query ? (
        <div className="empty-state">
          <span>🔍</span>
          <p>Please enter a search term above to find questions.</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <span>🏜️</span>
          <p>No questions found for "{query}". Try a different term.</p>
        </div>
      ) : (
        <QuestionList
          questions={questions}
          sessionLabel={`Results: ${questions.length} questions`}
          onLoadMore={async () => {}}
          hasMore={false}
          loading={false}
        />
      )}
    </div>
  );
}
