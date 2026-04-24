-- Run this in your Supabase SQL Editor to add the slug column to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Optionally, if you want to generate slugs for existing questions based on their ID temporarily
-- UPDATE questions SET slug = 'q-' || id WHERE slug IS NULL;
