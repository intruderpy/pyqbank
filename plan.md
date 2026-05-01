# PYQBank — Complete Project Plan
**Previous Year Questions Bank for Competitive Exams**

---

## 📋 PROJECT OVERVIEW

**Project Name:** PYQBank  
**Repository:** `intruderpy/pyqbank`  
**Current Status:** In active development (partial rebuild via Antigravity agent)  
**Deployment:** Vercel  
**Development Environment:** GitHub Codespaces  
**Target Users:** Students preparing for SSC, Railway, and Banking competitive exams

**Purpose:** A comprehensive, searchable web platform that aggregates previous year questions (PYQs) from competitive exams, enabling students to practice with real exam questions organized by exam type, subject, topic, date, and shift.

---

## 🏗️ TECH STACK

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** JavaScript/JSX
- **Styling:** CSS/Tailwind CSS (implied from modern Next.js setup)
- **UI Components:** React functional components
- **Internationalization:** Bilingual support (Hindi/English toggle)
- **Scroll Behavior:** Infinite scroll implementation (20 questions per load)

### Backend & Data
- **Database:** Supabase (PostgreSQL)
- **Server:** Vercel serverless functions
- **API:** RESTful queries via Supabase SDK
- **Database Queries:** `lib/queries.js` with helper functions

### SEO & Metadata
- **Slug Generation:** URL-friendly slug-based routing
- **Metadata:** `generateMetadata()` for dynamic per-page SEO
- **Sitemap:** `sitemap.ts` for search engine crawling
- **Robots:** `robots.ts` configuration
- **Structured Data:** JSON-LD schema markup
- **Social Sharing:** OG meta tags (text-based, no image generation)

### Hosting & Deployment
- **Web Host:** Vercel
- **Version Control:** Git (GitHub)
- **CI/CD:** Vercel's built-in deployments

---

## 🗂️ DATA ARCHITECTURE

### Database Schema (PostgreSQL via Supabase)

#### Tables

**1. `exams` Table**
```
- id (UUID, Primary Key)
- name (String, e.g., "SSC CGL", "RRB NTPC", "Banking")
- code (String, Unique identifier, e.g., "ssc_cgl")
- description (Text, optional exam details)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**2. `categories` Table**
```
- id (UUID, Primary Key)
- exam_id (UUID, Foreign Key → exams.id)
- name (String, e.g., "General Awareness", "Quantitative Aptitude")
- code (String, Unique with exam, e.g., "ga", "qa")
- description (Text, optional)
- order (Integer, for sorting)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**3. `years` Table**
```
- id (UUID, Primary Key)
- exam_id (UUID, Foreign Key → exams.id)
- year (Integer, e.g., 2023, 2022)
- season (String, optional, e.g., "Spring", "Fall")
- created_at (Timestamp)
- updated_at (Timestamp)
```

**4. `dates` Table**
```
- id (UUID, Primary Key)
- exam_id (UUID, Foreign Key → exams.id)
- year_id (UUID, Foreign Key → years.id)
- exam_date (Date, actual exam date)
- season (String, optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**5. `shifts` Table**
```
- id (UUID, Primary Key)
- date_id (UUID, Foreign Key → dates.id)
- shift_number (Integer, e.g., 1, 2, 3)
- shift_label (String, e.g., "Morning", "Afternoon", "Evening")
- start_time (Time, optional)
- end_time (Time, optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**6. `subjects` Table**
```
- id (UUID, Primary Key)
- name (String, e.g., "General Knowledge", "Mathematics")
- code (String, Unique, e.g., "gk", "math")
- description (Text, optional)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**7. `topics` Table**
```
- id (UUID, Primary Key)
- subject_id (UUID, Foreign Key → subjects.id)
- name (String, e.g., "History", "Algebra")
- code (String, Unique with subject, e.g., "history", "algebra")
- description (Text, optional)
- order (Integer, for sorting)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**8. `subtopics` Table**
```
- id (UUID, Primary Key)
- topic_id (UUID, Foreign Key → topics.id)
- name (String, e.g., "Ancient India", "Linear Equations")
- code (String, Unique with topic, e.g., "ancient_india", "linear_eq")
- description (Text, optional)
- order (Integer, for sorting)
- created_at (Timestamp)
- updated_at (Timestamp)
```

**9. `questions` Table**
```
- id (UUID, Primary Key)
- slug (String, Unique, URL-friendly identifier)
- question_text (Text, the actual question)
- question_text_hi (Text, Hindi translation of question)
- question_type (String, "mcq" or "qa" for Q&A)
- difficulty (String, optional: "easy", "medium", "hard")
- answer (String or Text, correct answer/explanation)
- answer_hi (String or Text, Hindi translation)
- option_a (String, for MCQ)
- option_b (String, for MCQ)
- option_c (String, for MCQ)
- option_d (String, for MCQ)
- option_a_hi (String, Hindi MCQ option A)
- option_b_hi (String, Hindi MCQ option B)
- option_c_hi (String, Hindi MCQ option C)
- option_d_hi (String, Hindi MCQ option D)
- explanation (Text, optional detailed explanation)
- explanation_hi (Text, Hindi explanation)
- exam_id (UUID, Foreign Key → exams.id)
- category_id (UUID, Foreign Key → categories.id)
- year_id (UUID, Foreign Key → years.id)
- date_id (UUID, Foreign Key → dates.id)
- shift_id (UUID, Foreign Key → shifts.id, nullable for year-level questions)
- subject_id (UUID, Foreign Key → subjects.id, nullable)
- topic_id (UUID, Foreign Key → topics.id, nullable)
- subtopic_id (UUID, Foreign Key → subtopics.id, nullable)
- order (Integer, question order in exam)
- views_count (Integer, analytics tracking)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Relationships Summary
```
exams (1) ─── (Many) categories
exams (1) ─── (Many) years
years (1) ─── (Many) dates
dates (1) ─── (Many) shifts
shifts (1) ─── (Many) questions

subjects (1) ─── (Many) topics
topics (1) ─── (Many) subtopics
subtopics (1) ─── (Many) questions

exams (1) ─── (Many) questions (exam_id)
categories (1) ─── (Many) questions (category_id)
subjects (1) ─── (Many) questions (subject_id)
```

---

## 📂 PROJECT DIRECTORY STRUCTURE

```
pyqbank/
├── .github/
│   └── workflows/
│       └── (CI/CD configurations)
├── .gitignore
├── app/
│   ├── layout.tsx                    # Root layout with language provider
│   ├── page.tsx                      # Homepage
│   ├── api/
│   │   └── (Next.js API routes, if any)
│   ├── (exams)/
│   │   ├── page.tsx                  # All exams listing page
│   │   ├── [exam]/
│   │   │   ├── page.tsx              # Exam categories page
│   │   │   ├── [category]/
│   │   │   │   ├── page.tsx          # Years listing for category
│   │   │   │   ├── [year]/
│   │   │   │   │   ├── page.tsx      # Dates listing for year
│   │   │   │   │   ├── [date]/
│   │   │   │   │   │   ├── page.tsx  # Shifts listing for date
│   │   │   │   │   │   └── [shift]/
│   │   │   │   │   │       └── page.tsx # Questions for date/shift
│   ├── subject/
│   │   ├── page.tsx                  # All subjects listing page
│   │   ├── [subject]/
│   │   │   ├── page.tsx              # Topics for subject
│   │   │   ├── [topic]/
│   │   │   │   ├── page.tsx          # Subtopics for topic
│   │   │   │   └── [subtopic]/
│   │   │   │       └── page.tsx      # Questions for subtopic (MISSING)
│   ├── question/
│   │   └── [slug]/
│   │       └── page.tsx              # Individual question detail page (MISSING)
│   └── layout.tsx                    # App layout wrapper
├── components/
│   ├── LanguageToggle.tsx            # Hindi/English language switcher
│   ├── QuestionList.tsx              # Reusable question display component
│   ├── Breadcrumb.tsx                # Breadcrumb navigation (MISSING)
│   ├── QuestionCard.tsx              # Individual question card component
│   ├── QuizMode.tsx                  # Q&A quiz mode display
│   ├── MCQMode.tsx                   # MCQ mode display
│   └── (other UI components)
├── lib/
│   ├── queries.js                    # All database query functions
│   ├── utils.js                      # Utility functions (slug generation, formatting)
│   └── supabase.js                   # Supabase client initialization
├── styles/
│   └── globals.css                   # Global styling
├── public/
│   ├── favicon.ico
│   └── (static assets)
├── app/
│   ├── sitemap.ts                    # Dynamic XML sitemap generation
│   ├── robots.ts                     # robots.txt configuration
│   └── metadata.ts                   # Default metadata configuration
├── package.json
├── package-lock.json
├── next.config.js
├── jsconfig.json (or tsconfig.json)
├── .env.local                        # Local environment variables
├── .env.example                      # Example environment variables
└── README.md
```

---

## 🔧 CORE FUNCTIONS IN `lib/queries.js`

### Implemented Functions

**1. `getExams()`**
- Fetches all exams from the database
- Returns: Array of exam objects with `{id, name, code, description}`
- Used in: `/exams` page, homepage

**2. `getTopics(subjectId)`**
- Fetches all topics for a specific subject
- Parameter: `subjectId` (UUID)
- Returns: Array of topics sorted by order
- Used in: `/subject/[subject]` page

**3. `getQuestions(filters)`**
- Fetches questions based on multiple filters
- Parameters: `{examId, categoryId, yearId, dateId, shiftId, subjectId, topicId, subtopicId, page, limit}`
- Returns: Paginated array of questions (20 per load for infinite scroll)
- Used in: All question listing pages

**4. `getQuestion(slug)`**
- Fetches a single question by slug
- Parameter: `slug` (String)
- Returns: Question object with all fields and translations
- Used in: `/question/[slug]` page

**5. `getExamDates(examId, yearId)`**
- Fetches all dates for a specific exam and year
- Parameters: `examId`, `yearId` (UUID)
- Returns: Array of date objects
- Used in: `/[exam]/[category]/[year]` page

**6. `getExamShifts(dateId)`**
- Fetches all shifts for a specific exam date
- Parameter: `dateId` (UUID)
- Returns: Array of shift objects with labels
- Used in: `/[exam]/[category]/[year]/[date]` page

**7. `getSubtopics(topicId)`**
- Fetches all subtopics for a specific topic
- Parameter: `topicId` (UUID)
- Returns: Array of subtopic objects sorted by order
- Used in: `/subject/[subject]/[topic]` page

### Key Implementation Details

- **Connection:** All functions use Supabase SDK with PostgreSQL inner joins
- **Error Handling:** Functions should include try-catch blocks and meaningful error messages
- **Caching:** Consider caching frequently accessed data (exams, subjects, topics)
- **Performance:** Optimize queries with proper indexing on foreign keys and commonly filtered fields

---

## 📄 COMPONENT BREAKDOWN

### 1. `QuestionList.tsx` (Implemented)
**Purpose:** Reusable component to display a list of questions
**Props:**
```javascript
{
  questions: Array,           // Array of question objects
  language: "en" | "hi",     // Current language
  mode: "qa" | "mcq",        // Display mode
  onLoadMore: Function,      // Callback for infinite scroll
  isLoading: Boolean,        // Loading state
  hasMore: Boolean           // More questions available?
}
```
**Features:**
- Renders questions in selected mode (Q&A or MCQ)
- Infinite scroll with 20 questions per load
- Language toggle support (English/Hindi)
- Answer toggling (click to reveal)

### 2. `LanguageToggle.tsx` (Implemented)
**Purpose:** Toggle between Hindi and English
**Props:**
```javascript
{
  currentLanguage: "en" | "hi",
  onLanguageChange: Function
}
```
**Features:**
- Button to switch language
- Persists choice in localStorage/context
- Updates all page content in real-time

### 3. `Breadcrumb.tsx` (Missing)
**Purpose:** Navigation breadcrumb trail showing current location
**Props:**
```javascript
{
  items: Array,              // Breadcrumb path items
  // items format: [{label: "SSC CGL", href: "/exams/ssc_cgl"}, ...]
}
```
**Implementation Needed:**
- Display hierarchical path
- Link to parent pages
- Add to all question listing pages
- Style appropriately (responsive design)
- Show up to 5 levels deep, collapse if needed

### 4. `QuestionCard.tsx` (Implied)
**Purpose:** Display individual question in a card format
**Props:**
```javascript
{
  question: Object,
  language: "en" | "hi",
  mode: "qa" | "mcq",
  showAnswer: Boolean,
  onToggleAnswer: Function
}
```
**Features:**
- Question text in selected language
- Options for MCQ (A, B, C, D)
- Toggle answer visibility
- Display difficulty level badge

### 5. `QuizMode.tsx` (Implied)
**Purpose:** Q&A mode display (show question, hide answer initially)
**Features:**
- Large question text
- Click to reveal answer
- Navigation (prev/next question)
- Progress indicator

### 6. `MCQMode.tsx` (Implied)
**Purpose:** Multiple choice question mode
**Features:**
- Question with 4 options
- Click option to select
- Show correct answer
- Display explanation
- Mark as correct/incorrect

---

## 📍 ROUTING & URL STRUCTURE

### Exam-Based Hierarchy
```
/                                        # Homepage
/exams                                   # All exams
/exams/[exam]                           # Exam categories
/exams/[exam]/[category]                # Years in category
/exams/[exam]/[category]/[year]         # Dates in year
/exams/[exam]/[category]/]/[year]/[date]      # Shifts on date
/exams/[exam]/[category]/[year]/[date]/[shift] # Questions for shift
```

### Subject-Based Hierarchy
```
/subject                                 # All subjects
/subject/[subject]                      # Topics in subject
/subject/[subject]/[topic]              # Subtopics in topic
/subject/[subject]/[topic]/[subtopic]   # Questions for subtopic (MISSING)
```

### Direct Question Access
```
/question/[slug]                        # Individual question detail page (MISSING)
```

### URL Parameter Format
- `[exam]`: lowercase code, e.g., `ssc_cgl`, `rrb_ntpc`
- `[category]`: lowercase code, e.g., `general_awareness`, `qa`
- `[year]`: numeric, e.g., `2023`, `2022`
- `[date]`: formatted date, e.g., `2023-12-10` (ISO format)
- `[shift]`: numeric, e.g., `1`, `2`, `3`
- `[subject]`: lowercase code, e.g., `gk`, `math`
- `[topic]`: lowercase code, e.g., `history`, `algebra`
- `[subtopic]`: lowercase code, e.g., `ancient_india`, `linear_eq`
- `[slug]`: unique question identifier, e.g., `ssc-cgl-2023-qa-001`

---

## 🎨 SEO & METADATA IMPLEMENTATION

### Dynamic Metadata (`generateMetadata()`)

Each page should generate SEO-friendly metadata:

**Homepage `/page.tsx`:**
```javascript
export const metadata = {
  title: "PYQBank - Previous Year Questions Bank",
  description: "Practice with real exam questions from SSC, Railway, Banking exams",
  openGraph: {
    title: "PYQBank - Previous Year Questions",
    description: "Master competitive exams with previous year questions",
    type: "website",
    url: "https://pyqbank.vercel.app"
  }
}
```

**Exam Listing `/exams/page.tsx`:**
```javascript
export const metadata = {
  title: "All Exams - PYQBank",
  description: "Browse previous year questions from SSC, Railway, Banking exams"
}
```

**Individual Exam `/exams/[exam]/page.tsx`:**
```javascript
export async function generateMetadata({ params }) {
  const exam = await getExam(params.exam);
  return {
    title: `${exam.name} Questions - PYQBank`,
    description: `Practice ${exam.name} with previous year questions`,
    openGraph: {
      title: `${exam.name} - PYQBank`,
      description: `Browse and practice ${exam.name} previous year questions`
    }
  }
}
```

**Question List Pages:**
```javascript
export async function generateMetadata({ params }) {
  // Example: /exams/ssc_cgl/general_awareness/2023
  return {
    title: `SSC CGL 2023 General Awareness Questions`,
    description: `Previous year questions from SSC CGL 2023 General Awareness section`
  }
}
```

**Individual Question Page `/question/[slug]/page.tsx`:**
```javascript
export async function generateMetadata({ params }) {
  const question = await getQuestion(params.slug);
  return {
    title: `Question: ${question.question_text.substring(0, 60)}...`,
    description: question.question_text,
    openGraph: {
      title: `SSC CGL Question - PYQBank`,
      description: question.question_text.substring(0, 120),
      type: "article"
    }
  }
}
```

### Sitemap (`app/sitemap.ts`)
```typescript
export default async function sitemap() {
  const baseUrl = "https://pyqbank.vercel.app";
  
  const exams = await getExams();
  const examRoutes = exams.map(exam => ({
    url: `${baseUrl}/exams/${exam.code}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8
  }));
  
  const subjects = await getSubjects();
  const subjectRoutes = subjects.map(subject => ({
    url: `${baseUrl}/subject/${subject.code}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8
  }));
  
  const questions = await getAllQuestions();
  const questionRoutes = questions.map(question => ({
    url: `${baseUrl}/question/${question.slug}`,
    lastModified: question.updated_at,
    changeFrequency: "monthly",
    priority: 0.6
  }));
  
  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/exams`, priority: 0.9 },
    { url: `${baseUrl}/subject`, priority: 0.9 },
    ...examRoutes,
    ...subjectRoutes,
    ...questionRoutes
  ];
}
```

### Robots Configuration (`app/robots.ts`)
```typescript
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: "https://pyqbank.vercel.app/sitemap.xml",
  };
}
```

### JSON-LD Schema (`lib/schema.js`)

**Organization Schema (HomePage):**
```javascript
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PYQBank",
  "url": "https://pyqbank.vercel.app",
  "description": "Previous Year Questions Bank for Competitive Exams"
}
```

**FAQPage Schema (For FAQ section if added):**
```javascript
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is PYQBank?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PYQBank is a comprehensive bank of previous year questions..."
      }
    }
  ]
}
```

**CreativeWork Schema (For Questions):**
```javascript
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "[Question Text]",
  "description": "[Question Details]",
  "author": {
    "@type": "Organization",
    "name": "PYQBank"
  }
}
```

### OG Meta Tags (No Image Generation)

All pages should include Open Graph meta tags for social sharing:

```html
<meta property="og:title" content="PYQBank" />
<meta property="og:description" content="Practice previous year questions" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://pyqbank.vercel.app" />
<meta property="og:site_name" content="PYQBank" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="PYQBank" />
<meta name="twitter:description" content="Practice previous year questions" />
```

---

## 🛠️ MISSING FEATURES & IMPLEMENTATION TASKS

### Priority 1: Core Pages (Critical)

#### Task 1.1: `/question/[slug]/page.tsx` - Individual Question Detail Page
**Status:** MISSING  
**Description:** Full-page view for a single question with complete details  
**Requirements:**
- Fetch question by slug from `getQuestion(slug)`
- Display question in both English and Hindi
- Show difficulty level, exam info, category, topic
- Display MCQ options (if MCQ) or Q&A format (if question-answer)
- Show explanation and answer with toggle
- Add to breadcrumb navigation
- Implement `generateMetadata()` for SEO
- Add "Next Question" and "Previous Question" navigation buttons
- Show related questions (same topic/difficulty)
- Add "Save" / "Bookmark" feature (optional)
- Display view count

**File Structure:**
```
app/question/[slug]/
├── page.tsx               # Main question detail component
└── layout.tsx             # Shared layout if needed
```

#### Task 1.2: `/subject/[subject]/[topic]/[subtopic]/page.tsx` - Subtopic Questions Page
**Status:** MISSING  
**Description:** Questions for a specific subtopic in subject hierarchy  
**Requirements:**
- Fetch subtopic details
- Fetch questions filtered by `subtopicId`
- Implement infinite scroll (20 questions per load)
- Display in both MCQ and Q&A modes
- Add breadcrumb: Subject > Topic > Subtopic
- Implement `generateMetadata()` for SEO
- Language toggle support
- Filter/sort options (difficulty, date added)
- Display question count

**File Structure:**
```
app/subject/[subject]/[topic]/[subtopic]/
├── page.tsx               # Main subtopic questions component
└── layout.tsx             # Shared layout if needed
```

---

### Priority 2: Navigation & UI Components (High)

#### Task 2.1: `components/Breadcrumb.tsx` - Breadcrumb Navigation Component
**Status:** MISSING  
**Description:** Reusable breadcrumb component for all listing pages  
**Requirements:**
- Accept dynamic breadcrumb items as props
- Display hierarchical path (e.g., Home > SSC CGL > General Awareness > 2023)
- Make each item clickable (link to parent page)
- Responsive design (collapse/truncate on mobile if needed)
- SEO: Include structured data (breadcrumbList schema)
- Styling: Match site design, clear separators (>, /)
- Handle up to 5+ levels deep

**Props:**
```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href: string;
    disabled?: boolean;
  }>;
  maxItems?: number;  // Optional: collapse after N items
}
```

**Usage Example:**
```jsx
<Breadcrumb items={[
  { label: "Home", href: "/" },
  { label: "SSC CGL", href: "/exams/ssc_cgl" },
  { label: "General Awareness", href: "/exams/ssc_cgl/general_awareness" },
  { label: "2023", href: "/exams/ssc_cgl/general_awareness/2023" }
]} />
```

---

### Priority 3: Metadata & SEO (High)

#### Task 3.1: OG Meta Tags Implementation
**Status:** PARTIALLY MISSING  
**Description:** Add Open Graph meta tags to all pages for social sharing  
**Requirements:**
- Add OG tags to `generateMetadata()` in all page files
- Include: title, description, type, url, site_name
- Add Twitter Card meta tags for Twitter sharing
- Ensure consistent branding across all shares
- No image generation needed (text-based)
- Test with social media debuggers (Facebook, Twitter, LinkedIn)

**Pages to Update:**
- `/page.tsx` (Homepage)
- `/exams/page.tsx`
- `/exams/[exam]/page.tsx`
- `/exams/[exam]/[category]/page.tsx`
- `/exams/[exam]/[category]/[year]/page.tsx`
- `/exams/[exam]/[category]/[year]/[date]/page.tsx`
- `/exams/[exam]/[category]/[year]/[date]/[shift]/page.tsx`
- `/subject/page.tsx`
- `/subject/[subject]/page.tsx`
- `/subject/[subject]/[topic]/page.tsx`
- `/subject/[subject]/[topic]/[subtopic]/page.tsx` (when created)
- `/question/[slug]/page.tsx` (when created)

---

### Priority 4: Database & Queries (Medium)

#### Task 4.1: Add Missing Query Functions
**Status:** PARTIALLY MISSING  
**Description:** Add utility functions to `lib/queries.js` for complete data access  
**New Functions Needed:**
```javascript
// Get single exam by code
getExam(examCode)

// Get single category by exam + category code
getCategory(examCode, categoryCode)

// Get single year
getYear(examId, year)

// Get single date
getDate(dateId)

// Get single shift
getShift(shiftId)

// Get single subject
getSubject(subjectCode)

// Get single topic
getTopic(subjectCode, topicCode)

// Get single subtopic
getSubtopic(topicCode, subtopicCode)

// Get all exams (with counts)
getExamsWithStats()

// Get all subjects (with counts)
getSubjectsWithStats()

// Get related questions
getRelatedQuestions(topicId, excludeQuestionId, limit = 5)

// Get trending/popular questions
getTrendingQuestions(limit = 10)

// Search questions (full-text search)
searchQuestions(searchTerm, limit = 20)
```

#### Task 4.2: Add Database Indexes
**Status:** UNKNOWN  
**Description:** Optimize database performance with proper indexing  
**Indexes to Add:**
```sql
-- Performance indexes
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_questions_slug ON questions(slug);
CREATE INDEX idx_categories_exam_id ON categories(exam_id);
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_subtopics_topic_id ON subtopics(topic_id);
CREATE INDEX idx_dates_exam_id ON dates(exam_id);
CREATE INDEX idx_shifts_date_id ON shifts(date_id);

-- Composite indexes for common queries
CREATE INDEX idx_questions_exam_category_year ON questions(exam_id, category_id, year_id);
CREATE INDEX idx_questions_subject_topic ON questions(subject_id, topic_id);
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Pages (Week 1-2)
- [ ] Create `/question/[slug]/page.tsx`
  - [ ] Fetch question by slug
  - [ ] Display in both languages
  - [ ] Generate metadata for SEO
  - [ ] Add breadcrumb
  - [ ] Add prev/next navigation
  - [ ] Add related questions
- [ ] Create `/subject/[subject]/[topic]/[subtopic]/page.tsx`
  - [ ] Fetch subtopic questions
  - [ ] Implement infinite scroll
  - [ ] Add breadcrumb
  - [ ] Generate metadata
- [ ] Update all existing pages to include breadcrumb component

### Phase 2: Components (Week 1)
- [ ] Create `Breadcrumb.tsx` component
  - [ ] Design responsive layout
  - [ ] Add schema.org breadcrumbList
  - [ ] Style and test
- [ ] Refactor/improve `QuestionCard.tsx`
- [ ] Enhance `QuestionList.tsx` with filters

### Phase 3: SEO & Metadata (Week 2)
- [ ] Add OG meta tags to all pages
- [ ] Test with social media debuggers
- [ ] Verify sitemap generation
- [ ] Verify robots.txt
- [ ] Test JSON-LD schema with structured data tools
- [ ] Setup analytics tracking (Google Analytics)

### Phase 4: Database & Queries (Week 1)
- [ ] Review existing `lib/queries.js`
- [ ] Add missing query functions
- [ ] Add database indexes
- [ ] Test all queries for performance
- [ ] Add error handling

### Phase 5: Additional Features (Week 3+)
- [ ] User bookmarks/saved questions
- [ ] Question statistics (views, difficulty)
- [ ] Advanced search and filtering
- [ ] User progress tracking
- [ ] Review mode (bookmark + review)
- [ ] Analytics dashboard
- [ ] Performance optimization
- [ ] Mobile responsiveness audit

---

## 🔐 ENVIRONMENT VARIABLES

Create `.env.local` file with the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://pyqbank.vercel.app
NEXT_PUBLIC_SITE_NAME=PYQBank

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# API Configuration
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
```

---

## 📊 PERFORMANCE OPTIMIZATION

### Frontend Optimization
- **Code Splitting:** Next.js App Router handles automatically
- **Image Optimization:** Use Next.js `Image` component (not needed heavily for this project)
- **CSS Optimization:** Implement CSS modules or Tailwind
- **Bundle Size:** Monitor with `npm run build`
- **Lazy Loading:** Implement for heavy components

### Backend Optimization
- **Database Indexing:** Add indexes on frequently queried columns (see Task 4.2)
- **Query Optimization:** Use efficient joins in `lib/queries.js`
- **Caching:** Implement Redis caching for frequently accessed data (exams, subjects, topics)
- **Pagination:** Implemented via infinite scroll (20 per load)
- **Connection Pooling:** Supabase handles this automatically

### Deployment
- **Vercel Optimization:** Enable Image Optimization, Function Memory allocation
- **CDN:** Vercel Edge Network automatically used
- **Database Connection:** Use Supabase's built-in pooling

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Test query functions in `lib/queries.js`
- Test utility functions in `lib/utils.js`
- Test components (Breadcrumb, QuestionList, LanguageToggle)

### Integration Tests
- Test page routing and page generation
- Test data flow from database to UI
- Test language switching across pages

### E2E Tests
- Test user journey: Homepage → Exams → Category → Questions → Question Detail
- Test user journey: Homepage → Subjects → Topic → Subtopic → Questions
- Test language toggle across all pages
- Test pagination/infinite scroll

### SEO Tests
- Verify metadata generation
- Test sitemap.xml structure
- Validate robots.txt
- Test JSON-LD schema with https://schema.org/validator/

### Performance Tests
- Lighthouse score: Target 90+
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Database query performance: < 100ms for most queries

---

## 📱 RESPONSIVE DESIGN REQUIREMENTS

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Mobile Considerations
- **Breadcrumb:** Collapse/truncate on mobile (show only last 2-3 items)
- **Navigation:** Hamburger menu or simplified navigation
- **Questions:** Full-width cards with appropriate padding
- **Options:** Stack MCQ options vertically, clear visual hierarchy
- **Touch:** Ensure buttons are at least 44x44px for touch targets

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Run `npm run build` locally and verify no errors
- [ ] Test all pages in production build (`npm run start`)
- [ ] Verify all environment variables set in Vercel dashboard
- [ ] Test with lighthouse audit
- [ ] Check mobile responsiveness
- [ ] Verify sitemap generation
- [ ] Test all major user journeys

### Deployment to Vercel
- [ ] Push code to GitHub
- [ ] Vercel automatically deploys main branch
- [ ] Verify deployment successful in Vercel dashboard
- [ ] Test deployed site in browser
- [ ] Monitor error logs for first hour

### Post-Deployment
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Setup Google Analytics
- [ ] Monitor Core Web Vitals
- [ ] Setup error tracking (Sentry optional)
- [ ] Monitor database performance

---

## 📚 UTILITY FUNCTIONS IN `lib/utils.js`

These helper functions should be available:

```javascript
// Slug generation
generateSlug(text)  // Convert text to URL-friendly slug

// Text formatting
truncateText(text, length)  // Truncate text with ellipsis
formatDate(date)  // Format date for display
formatDateTime(dateTime)  // Format datetime for display

// URL generation
getExamUrl(examCode)  // Generate exam URL
getCategoryUrl(examCode, categoryCode)  // Generate category URL
getQuestionUrl(slug)  // Generate question URL

// Language utilities
getTextInLanguage(text, textHi, language)  // Return text in selected language

// Question formatting
formatQuestion(question, language)  // Format question with all fields in language
formatMCQQuestion(question, language)  // Format MCQ with options in language

// Pagination
calculateOffset(page, pageSize)  // Calculate offset for pagination

// SEO
getMetaDescription(text, maxLength = 160)  // Generate meta description
generateOGImage(title)  // Optional: Generate OG image (if needed later)
```

---

## 🐛 KNOWN ISSUES & NOTES

1. **Language Persistence:** Ensure language choice persists across page reloads (use localStorage or context)
2. **Date Formatting:** Ensure consistent date formatting across all pages
3. **Slug Uniqueness:** Implement validation to ensure question slugs are unique
4. **Performance:** Monitor infinite scroll performance - may need pagination optimization if dataset grows very large
5. **Search:** Full-text search not implemented yet - consider adding with Supabase full-text search or Algolia
6. **Analytics:** Add view count tracking for each question when user views it
7. **Caching:** Implement caching strategy for frequently accessed data

---

## 📖 REFERENCES & DOCUMENTATION

- **Next.js 14 Documentation:** https://nextjs.org/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Vercel Deployment:** https://vercel.com/docs
- **Schema.org:** https://schema.org/
- **Google Search Console:** https://search.google.com/search-console
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse

---

## 📝 CONCLUSION

This plan provides a complete, 100% roadmap for PYQBank development. All critical missing features, components, and SEO requirements are documented with specific implementation details. Follow the priority order for optimal development flow:

1. **Priority 1:** Core missing pages (question detail, subtopic)
2. **Priority 2:** Navigation components (breadcrumb)
3. **Priority 3:** SEO metadata (OG tags, sitemap)
4. **Priority 4:** Database optimization and query functions
5. **Priority 5:** Additional features and enhancements

The project is well-structured with a solid foundation. Complete these tasks in order for a fully feature-complete, SEO-optimized PYQBank platform.

---

**Last Updated:** May 01, 2026  
**Status:** Complete & Ready for Development  
**Next Review:** Upon completion of Priority 1 tasks
