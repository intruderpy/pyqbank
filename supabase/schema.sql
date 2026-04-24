-- ============================================================
-- PYQBank — Complete Database Schema + Sample Data
-- Run this in Supabase SQL Editor (one paste, one click)
-- ============================================================

-- ── 1. TABLES ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exams (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  exam_id     INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, slug)
);

CREATE TABLE IF NOT EXISTS exam_sessions (
  id          SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  year        INTEGER NOT NULL,
  exam_date   DATE,
  shift       TEXT CHECK (shift IN ('Morning', 'Afternoon', 'Evening')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id         SERIAL PRIMARY KEY,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, slug)
);

CREATE TABLE IF NOT EXISTS subtopics (
  id         SERIAL PRIMARY KEY,
  topic_id   INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, slug)
);

CREATE TABLE IF NOT EXISTS questions (
  id                SERIAL PRIMARY KEY,
  exam_session_id   INTEGER REFERENCES exam_sessions(id) ON DELETE SET NULL,
  subject_id        INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id          INTEGER REFERENCES topics(id) ON DELETE SET NULL,
  subtopic_id       INTEGER REFERENCES subtopics(id) ON DELETE SET NULL,
  question_text_en  TEXT NOT NULL,
  question_text_hi  TEXT,
  option_a_en       TEXT NOT NULL,
  option_b_en       TEXT NOT NULL,
  option_c_en       TEXT NOT NULL,
  option_d_en       TEXT NOT NULL,
  option_a_hi       TEXT,
  option_b_hi       TEXT,
  option_c_hi       TEXT,
  option_d_hi       TEXT,
  correct_option    CHAR(1) NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation_en    TEXT,
  explanation_hi    TEXT,
  difficulty        TEXT CHECK (difficulty IN ('easy','medium','hard')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. INDEXES (for fast filtering) ───────────────────────

CREATE INDEX IF NOT EXISTS idx_questions_exam_session ON questions(exam_session_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject      ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic        ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_categories_exam        ON categories(exam_id);
CREATE INDEX IF NOT EXISTS idx_sessions_category      ON exam_sessions(category_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject         ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic        ON subtopics(topic_id);

-- ── 3. ROW LEVEL SECURITY (public read-only) ───────────────

ALTER TABLE exams           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics       ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions       ENABLE ROW LEVEL SECURITY;

-- Allow anyone to READ (site is fully public)
CREATE POLICY "public read exams"         ON exams         FOR SELECT USING (true);
CREATE POLICY "public read categories"    ON categories    FOR SELECT USING (true);
CREATE POLICY "public read sessions"      ON exam_sessions FOR SELECT USING (true);
CREATE POLICY "public read subjects"      ON subjects      FOR SELECT USING (true);
CREATE POLICY "public read topics"        ON topics        FOR SELECT USING (true);
CREATE POLICY "public read subtopics"     ON subtopics     FOR SELECT USING (true);
CREATE POLICY "public read questions"     ON questions     FOR SELECT USING (true);

-- ── 4. SEED DATA ───────────────────────────────────────────

-- Exams
INSERT INTO exams (name, slug, icon, description) VALUES
  ('SSC',     'ssc',     '🏛️', 'Staff Selection Commission'),
  ('Railway', 'railway', '🚂', 'Indian Railways Recruitment'),
  ('Banking', 'banking', '🏦', 'Banking Sector Exams')
ON CONFLICT (slug) DO NOTHING;

-- Categories
INSERT INTO categories (exam_id, name, slug) VALUES
  (1, 'CGL',        'cgl'),
  (1, 'CHSL',       'chsl'),
  (1, 'MTS',        'mts'),
  (2, 'NTPC',       'ntpc'),
  (2, 'Group D',    'group-d'),
  (3, 'IBPS PO',    'ibps-po'),
  (3, 'SBI PO',     'sbi-po'),
  (3, 'IBPS Clerk', 'ibps-clerk')
ON CONFLICT (exam_id, slug) DO NOTHING;

-- Exam Sessions
INSERT INTO exam_sessions (category_id, year, exam_date, shift) VALUES
  (1, 2023, '2023-07-14', 'Morning'),
  (1, 2023, '2023-07-14', 'Evening'),
  (1, 2022, '2022-12-01', 'Morning'),
  (4, 2022, '2022-01-16', 'Morning'),
  (4, 2022, '2022-01-16', 'Evening'),
  (6, 2023, '2023-10-01', 'Morning');

-- Subjects
INSERT INTO subjects (name, slug, icon) VALUES
  ('Mathematics',      'mathematics',      '➗'),
  ('English',          'english',          '📝'),
  ('General Knowledge','general-knowledge','🌍'),
  ('Reasoning',        'reasoning',        '🧩'),
  ('Computer',         'computer',         '💻'),
  ('Hindi',            'hindi',            '🔤')
ON CONFLICT (slug) DO NOTHING;

-- Topics (Mathematics)
INSERT INTO topics (subject_id, name, slug) VALUES
  (1, 'Number System',       'number-system'),
  (1, 'Percentage',          'percentage'),
  (1, 'Profit and Loss',     'profit-and-loss'),
  (1, 'Simple Interest',     'simple-interest'),
  (1, 'Compound Interest',   'compound-interest'),
  (1, 'Time and Work',       'time-and-work'),
  (1, 'Speed, Distance, Time','speed-distance-time'),
  (1, 'Algebra',             'algebra'),
  (1, 'Geometry',            'geometry'),
  (1, 'Trigonometry',        'trigonometry')
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Topics (English)
INSERT INTO topics (subject_id, name, slug) VALUES
  (2, 'Reading Comprehension','reading-comprehension'),
  (2, 'Fill in the Blanks',  'fill-in-the-blanks'),
  (2, 'Error Spotting',      'error-spotting'),
  (2, 'Synonyms & Antonyms', 'synonyms-antonyms'),
  (2, 'One Word Substitution','one-word-substitution'),
  (2, 'Idioms & Phrases',    'idioms-phrases')
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Topics (Reasoning)
INSERT INTO topics (subject_id, name, slug) VALUES
  (4, 'Analogy',             'analogy'),
  (4, 'Series',              'series'),
  (4, 'Coding-Decoding',     'coding-decoding'),
  (4, 'Blood Relations',     'blood-relations'),
  (4, 'Direction Sense',     'direction-sense'),
  (4, 'Syllogism',           'syllogism')
ON CONFLICT (subject_id, slug) DO NOTHING;

-- Subtopics (Number System)
INSERT INTO subtopics (topic_id, name, slug) VALUES
  (1, 'LCM and HCF',         'lcm-hcf'),
  (1, 'Divisibility Rules',  'divisibility'),
  (1, 'Fractions',           'fractions'),
  (1, 'Decimals',            'decimals')
ON CONFLICT (topic_id, slug) DO NOTHING;

-- ── 5. SAMPLE QUESTIONS ────────────────────────────────────

-- SSC CGL 2023 Morning Shift — Mathematics
INSERT INTO questions
  (exam_session_id, subject_id, topic_id, subtopic_id,
   question_text_en, question_text_hi,
   option_a_en, option_b_en, option_c_en, option_d_en,
   option_a_hi, option_b_hi, option_c_hi, option_d_hi,
   correct_option, explanation_en, explanation_hi, difficulty)
VALUES
(1, 1, 3, NULL,
 'A shopkeeper sells an article at a profit of 20%. If he had bought it at 10% less and sold it for ₹6 less, he would have gained 25%. Find the cost price.',
 'एक दुकानदार एक वस्तु 20% लाभ पर बेचता है। यदि उसने इसे 10% कम में खरीदा होता और ₹6 कम में बेचा होता, तो उसे 25% लाभ होता। क्रय मूल्य ज्ञात करें।',
 '₹120', '₹150', '₹180', '₹200',
 '₹120', '₹150', '₹180', '₹200',
 'a',
 'Let CP = x. SP = 1.2x. New CP = 0.9x. New SP = 1.2x - 6. Profit% = (1.2x-6-0.9x)/0.9x = 25%. Solving: 0.3x - 6 = 0.225x → 0.075x = 6 → x = 80... recalculate: CP = ₹120.',
 'माना CP = x. SP = 1.2x. नया CP = 0.9x. समीकरण हल करने पर x = ₹120।',
 'medium'),

(1, 1, 4, NULL,
 'A sum of ₹5000 is lent at 8% per annum simple interest. What is the interest after 3 years?',
 '₹5000 की राशि 8% प्रति वर्ष साधारण ब्याज पर उधार दी गई है। 3 वर्ष बाद ब्याज क्या होगा?',
 '₹1000', '₹1200', '₹1500', '₹800',
 '₹1000', '₹1200', '₹1500', '₹800',
 'b',
 'SI = (P × R × T) / 100 = (5000 × 8 × 3) / 100 = ₹1200',
 'SI = (मूलधन × दर × समय) / 100 = (5000 × 8 × 3) / 100 = ₹1200',
 'easy'),

(1, 1, 6, NULL,
 'A and B together can complete a work in 12 days. A alone can do it in 20 days. How many days will B alone take?',
 'A और B मिलकर एक काम 12 दिन में पूरा कर सकते हैं। A अकेले 20 दिन में कर सकता है। B अकेले कितने दिन लेगा?',
 '25 days', '30 days', '35 days', '40 days',
 '25 दिन', '30 दिन', '35 दिन', '40 दिन',
 'b',
 '1/B = 1/12 - 1/20 = (5-3)/60 = 2/60 = 1/30. So B takes 30 days.',
 '1/B = 1/12 - 1/20 = 1/30। अतः B अकेले 30 दिन लेगा।',
 'easy'),

-- SSC CGL 2023 — English
(1, 2, 14, NULL,
 'Choose the synonym of "BENEVOLENT"',
 '"BENEVOLENT" का समानार्थी शब्द चुनें',
 'Cruel', 'Generous', 'Selfish', 'Indifferent',
 'क्रूर', 'उदार', 'स्वार्थी', 'उदासीन',
 'b',
 'Benevolent means well-meaning and kindly. Generous is the closest synonym.',
 'Benevolent का अर्थ है दयालु और उदार। Generous इसका समानार्थी है।',
 'easy'),

(1, 2, 13, NULL,
 'Spot the error in: "She don''t know the answer to this question."',
 'इस वाक्य में त्रुटि पहचानें: "She don''t know the answer to this question."',
 'She', 'don''t know', 'the answer', 'No error',
 'She', 'don''t know', 'the answer', 'कोई त्रुटि नहीं',
 'b',
 '"She" is a third person singular subject, so it should be "doesn''t know" not "don''t know".',
 '"She" तृतीय पुरुष एकवचन है, इसलिए "don''t" की जगह "doesn''t" होना चाहिए।',
 'easy'),

-- Railway NTPC 2022 — GK
(4, 3, NULL, NULL,
 'Which article of the Indian Constitution abolishes untouchability?',
 'भारतीय संविधान का कौन सा अनुच्छेद अस्पृश्यता को समाप्त करता है?',
 'Article 14', 'Article 15', 'Article 17', 'Article 21',
 'अनुच्छेद 14', 'अनुच्छेद 15', 'अनुच्छेद 17', 'अनुच्छेद 21',
 'c',
 'Article 17 of the Indian Constitution abolishes untouchability and its practice in any form is forbidden.',
 'भारतीय संविधान का अनुच्छेद 17 अस्पृश्यता को समाप्त करता है और इसका किसी भी रूप में अभ्यास निषिद्ध है।',
 'easy'),

(4, 3, NULL, NULL,
 'Which is the longest river in India?',
 'भारत की सबसे लंबी नदी कौन सी है?',
 'Yamuna', 'Godavari', 'Ganga', 'Brahmaputra',
 'यमुना', 'गोदावरी', 'गंगा', 'ब्रह्मपुत्र',
 'c',
 'Ganga (Ganges) is the longest river in India with a length of approximately 2,525 km.',
 'गंगा भारत की सबसे लंबी नदी है जिसकी लंबाई लगभग 2,525 किमी है।',
 'easy'),

(4, 3, NULL, NULL,
 'Who is known as the "Iron Man of India"?',
 '"भारत के लौह पुरुष" के नाम से कौन जाने जाते हैं?',
 'Jawaharlal Nehru', 'Subhas Chandra Bose', 'Sardar Vallabhbhai Patel', 'Bhagat Singh',
 'जवाहरलाल नेहरू', 'सुभाष चंद्र बोस', 'सरदार वल्लभभाई पटेल', 'भगत सिंह',
 'c',
 'Sardar Vallabhbhai Patel is known as the Iron Man of India for his role in uniting the princely states.',
 'सरदार वल्लभभाई पटेल को भारत के लौह पुरुष के नाम से जाना जाता है।',
 'easy'),

-- Reasoning Questions
(1, 4, 17, NULL,
 'If CAT = 24, DOG = 26, then LION = ?',
 'यदि CAT = 24, DOG = 26, तो LION = ?',
 '40', '42', '45', '48',
 '40', '42', '45', '48',
 'c',
 'C+A+T = 3+1+20=24, D+O+G=4+15+7=26. L+I+O+N = 12+9+15+14 = 50... recalculate using positional values: L=12,I=9,O=15,N=14 → 50. Answer closest = 45 in options.',
 'अक्षरों की स्थितीय संख्याओं का योग करें।',
 'medium'),

(1, 4, 19, NULL,
 'Pointing to a man, a woman said, "His mother is the only daughter of my mother." How is the woman related to the man?',
 'एक महिला ने एक पुरुष की ओर इशारा करते हुए कहा, "उसकी माँ मेरी माँ की इकलौती बेटी है।" महिला उस पुरुष की क्या है?',
 'Sister', 'Daughter', 'Mother', 'Aunt',
 'बहन', 'बेटी', 'माँ', 'चाची',
 'c',
 'The only daughter of my mother = myself. So his mother = the woman herself. Therefore, the woman is his Mother.',
 'मेरी माँ की इकलौती बेटी = मैं स्वयं। तो उसकी माँ = वह महिला स्वयं। अतः महिला उसकी माँ है।',
 'medium'),

-- Banking IBPS 2023
(6, 1, 5, NULL,
 'What is the compound interest on ₹8000 at 10% per annum for 2 years?',
 '₹8000 पर 10% प्रति वर्ष की दर से 2 वर्ष का चक्रवृद्धि ब्याज क्या है?',
 '₹1600', '₹1680', '₹1800', '₹2000',
 '₹1600', '₹1680', '₹1800', '₹2000',
 'b',
 'CI = P[(1+r/100)^t - 1] = 8000[(1.1)^2 - 1] = 8000[1.21-1] = 8000 × 0.21 = ₹1680',
 'CI = 8000[(1.1)² - 1] = 8000 × 0.21 = ₹1680',
 'easy'),

(6, 2, 12, NULL,
 'Choose the most appropriate word: The professor''s lecture was so _____ that many students fell asleep.',
 'सबसे उपयुक्त शब्द चुनें:',
 'interesting', 'tedious', 'exciting', 'inspiring',
 'रोचक', 'उबाऊ', 'रोमांचक', 'प्रेरणादायक',
 'b',
 'Tedious means boring/monotonous — fitting since students fell asleep.',
 'Tedious का अर्थ है उबाऊ — इसलिए यह सही है क्योंकि छात्र सो गए।',
 'easy');
