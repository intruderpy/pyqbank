import { supabase } from "./supabase";
import type { Exam, Category, ExamSession, Subject, Topic, Subtopic, Question, ExamStats, SubjectStats } from "@/types/database";

// ── Exams ──────────────────────────────────────────────────

export async function getAllExams(): Promise<ExamStats[]> {
  const { data, error } = await supabase
    .from("exam_stats")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  const { data, error } = await supabase.from("exams").select("*").eq("slug", slug).single();
  if (error) return null;
  return data;
}

// ── Categories ─────────────────────────────────────────────

export async function getCategoriesByExam(examId: number): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("exam_id", examId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getCategoryBySlug(examId: number, slug: string): Promise<Category | null> {
  const { data, error } = await supabase.from("categories").select("*").eq("exam_id", examId).eq("slug", slug).single();
  if (error) return null;
  return data;
}

// ── Exam Sessions & Filters ────────────────────────────────

export async function getSessionsByCategory(categoryId: number): Promise<ExamSession[]> {
  const { data, error } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("category_id", categoryId)
    .order("year", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSessionsByCategoryAndYear(categoryId: number, year: number): Promise<ExamSession[]> {
  const { data, error } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("category_id", categoryId)
    .eq("year", year)
    .order("exam_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Subjects ───────────────────────────────────────────────

export async function getAllSubjects(): Promise<SubjectStats[]> {
  const { data, error } = await supabase
    .from("subject_stats")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const { data, error } = await supabase.from("subjects").select("*").eq("slug", slug).single();
  if (error) return null;
  return data;
}

// ── Topics & Subtopics ─────────────────────────────────────

export async function getTopicsBySubject(subjectId: number): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getSubtopicsByTopic(topicId: number): Promise<Subtopic[]> {
  const { data, error } = await supabase.from("subtopics").select("*").eq("topic_id", topicId).order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getSubtopicBySlug(topicId: number, slug: string): Promise<Subtopic | null> {
  const { data, error } = await supabase.from("subtopics").select("*").eq("topic_id", topicId).eq("slug", slug).single();
  if (error) return null;
  return data;
}

// ── Questions ──────────────────────────────────────────────

export async function getQuestionsByAdvancedFilter(
  categoryId: number,
  year: number,
  date: string | null,
  shift: string | null,
  subjectId: number | null,
  page = 0,
  pageSize = 20
): Promise<Question[]> {
  let query = supabase
    .from("questions")
    .select("*, exam_sessions!inner(*)")
    .eq("exam_sessions.category_id", categoryId)
    .eq("exam_sessions.year", year);

  if (date) query = query.eq("exam_sessions.exam_date", date);
  if (shift) query = query.eq("exam_sessions.shift", shift);
  if (subjectId) query = query.eq("subject_id", subjectId);

  const { data, error } = await query
    .order("id")
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  
  // Clean up the joined property to match Question type if needed
  return (data as (Question & { exam_sessions: any })[])?.map(q => {
    const { exam_sessions: _, ...rest } = q;
    return rest as Question;
  }) ?? [];
}

export async function getQuestionsByTopicAdvanced(
  topicId: number,
  subtopicId: number | null,
  page = 0,
  pageSize = 20
): Promise<Question[]> {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("topic_id", topicId);

  if (subtopicId) query = query.eq("subtopic_id", subtopicId);

  const { data, error } = await query
    .order("id")
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return data ?? [];
}

export async function getQuestionsBySubject(
  subjectId: number,
  page = 0,
  pageSize = 20
): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("subject_id", subjectId)
    .order("id")
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return data ?? [];
}

export async function getQuestionBySlug(slug: string): Promise<(Question & { 
  topics: (Topic & { subjects: Subject | null }) | null,
  exam_sessions: (ExamSession & { categories: (Category & { exams: Exam | null }) | null }) | null
}) | null> {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      topics(name, slug, subjects(name, slug)),
      exam_sessions(year, exam_date, shift, categories(name, slug, exams(name, slug)))
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }
  return data;
}
