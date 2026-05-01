-- ============================================================
-- PYQBank — View Optimizations (N+1 Query Fix)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create a view for Exam Statistics
-- This view aggregates the total number of questions for each exam
-- and collects all category names into a single array (tags).
CREATE OR REPLACE VIEW exam_stats AS
SELECT 
  e.id,
  e.name,
  e.slug,
  e.icon,
  e.description,
  e.created_at,
  COUNT(q.id) AS question_count,
  COALESCE(
    (
      SELECT array_agg(DISTINCT c.name) 
      FROM categories c 
      WHERE c.exam_id = e.id
    ),
    '{}'::text[]
  ) AS tags
FROM exams e
LEFT JOIN categories c ON c.exam_id = e.id
LEFT JOIN exam_sessions es ON es.category_id = c.id
LEFT JOIN questions q ON q.exam_session_id = es.id
GROUP BY e.id;


-- 2. Create a view for Subject Statistics
-- This view calculates the total number of questions for each subject.
CREATE OR REPLACE VIEW subject_stats AS
SELECT 
  s.id,
  s.name,
  s.slug,
  s.icon,
  s.created_at,
  COUNT(q.id) AS question_count
FROM subjects s
LEFT JOIN questions q ON q.subject_id = s.id
GROUP BY s.id;


-- 3. Grant permissions
GRANT SELECT ON exam_stats TO public;
GRANT SELECT ON exam_stats TO anon;
GRANT SELECT ON exam_stats TO authenticated;

GRANT SELECT ON subject_stats TO public;
GRANT SELECT ON subject_stats TO anon;
GRANT SELECT ON subject_stats TO authenticated;
