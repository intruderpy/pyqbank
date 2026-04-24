"use client";

import { useState, useCallback } from "react";
import type { Question } from "@/types/database";
import QuestionList from "@/components/questions/QuestionList";
import { getQuestionsByAdvancedFilter } from "@/lib/queries";

const PAGE_SIZE = 20;

interface Props {
  initialQuestions: Question[];
  categoryId: number;
  year: number;
  date: string | null;
  shift: string | null;
  sessionLabel: string;
}

export default function ExamClientView({ initialQuestions, categoryId, year, date, shift, sessionLabel }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(initialQuestions.length === PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const rows = await getQuestionsByAdvancedFilter(categoryId, year, date, shift, null, nextPage, PAGE_SIZE);
      if (rows.length < PAGE_SIZE) setHasMore(false);
      setQuestions((prev) => [...prev, ...rows]);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [page, categoryId, year, date, shift, hasMore, loading]);

  return (
    <QuestionList
      questions={questions}
      sessionLabel={sessionLabel}
      onLoadMore={loadMore}
      hasMore={hasMore}
      loading={loading}
    />
  );
}
