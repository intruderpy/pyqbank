import { supabase } from "./supabase";
import type { Exam, Category, ExamSession, Subject, Topic, Question } from "@/types/database";

// ── Exams ──────────────────────────────────────────────────

export async function getAllExams(): Promise<Exam[]> {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getExamBySlug(slug: string): Promise<Exam | null> {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("slug", slug)
    .single();
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
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("exam_id", examId)
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// ── Exam Sessions ──────────────────────────────────────────

export async function getSessionsByCategory(categoryId: number): Promise<ExamSession[]> {
  const { data, error } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("category_id", categoryId)
    .order("year", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Subjects ───────────────────────────────────────────────

export async function getAllSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// ── Topics ─────────────────────────────────────────────────

export async function getTopicsBySubject(subjectId: number): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("subject_id", subjectId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

// ── Questions ──────────────────────────────────────────────

export async function getQuestionsBySession(
  sessionId: number,
  page = 0,
  pageSize = 20
): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("exam_session_id", sessionId)
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

export async function getQuestionsByTopic(
  topicId: number,
  page = 0,
  pageSize = 20
): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("topic_id", topicId)
    .order("id")
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return data ?? [];
}
