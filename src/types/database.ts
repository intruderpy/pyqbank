// ============================================================
// PYQBank — Database Types (matches Supabase schema exactly)
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      exams: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["exams"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["exams"]["Insert"]>;
      };
      categories: {
        Row: {
          id: number;
          exam_id: number;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      exam_sessions: {
        Row: {
          id: number;
          category_id: number;
          year: number;
          exam_date: string | null;
          shift: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["exam_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["exam_sessions"]["Insert"]>;
      };
      subjects: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subjects"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
      };
      topics: {
        Row: {
          id: number;
          subject_id: number;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["topics"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["topics"]["Insert"]>;
      };
      subtopics: {
        Row: {
          id: number;
          topic_id: number;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subtopics"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["subtopics"]["Insert"]>;
      };
      questions: {
        Row: {
          id: number;
          slug: string | null;
          exam_session_id: number | null;
          subject_id: number | null;
          topic_id: number | null;
          subtopic_id: number | null;
          question_text_en: string;
          question_text_hi: string | null;
          option_a_en: string;
          option_b_en: string;
          option_c_en: string;
          option_d_en: string;
          option_a_hi: string | null;
          option_b_hi: string | null;
          option_c_hi: string | null;
          option_d_hi: string | null;
          correct_option: "a" | "b" | "c" | "d";
          explanation_en: string | null;
          explanation_hi: string | null;
          difficulty: "easy" | "medium" | "hard" | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["questions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      correct_option: "a" | "b" | "c" | "d";
      difficulty_level: "easy" | "medium" | "hard";
    };
  };
};

// ── Convenience row types ──────────────────────────────────
export type Exam         = Database["public"]["Tables"]["exams"]["Row"];
export type Category     = Database["public"]["Tables"]["categories"]["Row"];
export type ExamSession  = Database["public"]["Tables"]["exam_sessions"]["Row"];
export type Subject      = Database["public"]["Tables"]["subjects"]["Row"];
export type Topic        = Database["public"]["Tables"]["topics"]["Row"];
export type Subtopic     = Database["public"]["Tables"]["subtopics"]["Row"];
export type Question     = Database["public"]["Tables"]["questions"]["Row"];
