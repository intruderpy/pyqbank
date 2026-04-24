import Link from "next/link";
import type { Metadata } from "next";
import "@/styles/home.css";

export const metadata: Metadata = {
  title: "PYQBank — Free Previous Year Questions for SSC, Railway & Banking",
};

const EXAM_CATEGORIES = [
  {
    id: "ssc",
    name: "SSC",
    fullName: "Staff Selection Commission",
    icon: "🏛️",
    exams: ["CGL", "CHSL", "MTS", "GD", "CPO", "Steno"],
    questions: "50,000+",
  },
  {
    id: "railway",
    name: "Railway",
    fullName: "Indian Railways Recruitment",
    icon: "🚂",
    exams: ["NTPC", "Group D", "ALP", "JE", "RPF"],
    questions: "35,000+",
  },
  {
    id: "banking",
    name: "Banking",
    fullName: "Banking Sector Exams",
    icon: "🏦",
    exams: ["IBPS PO", "IBPS Clerk", "SBI PO", "SBI Clerk", "RBI"],
    questions: "40,000+",
  },
];

const SUBJECTS = [
  { name: "Mathematics", icon: "➗", slug: "mathematics", count: "28k Questions" },
  { name: "English", icon: "📝", slug: "english", count: "22k Questions" },
  { name: "General Knowledge", icon: "🌍", slug: "general-knowledge", count: "35k Questions" },
  { name: "Reasoning", icon: "🧩", slug: "reasoning", count: "18k Questions" },
  { name: "Computer", icon: "💻", slug: "computer", count: "8k Questions" },
  { name: "Hindi", icon: "🔤", slug: "hindi", count: "12k Questions" },
];

const STATS = [
  { value: "1,25,000+", label: "Total Questions" },
  { value: "15+", label: "Exams Covered" },
  { value: "50+", label: "Subjects & Topics" },
  { value: "10+ Years", label: "Question History" },
];

export default function HomePage() {
  return (
    <main>
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span className="logo-icon">📚</span>
            <span className="gradient-text">PYQBank</span>
          </Link>

          <div className="navbar-links">
            <Link href="/exams" className="nav-link">Exams</Link>
            <Link href="/subjects" className="nav-link">Subjects</Link>
            <Link href="/quiz" className="nav-link">Quiz Mode</Link>
          </div>

          <button className="lang-toggle" id="lang-toggle-btn" type="button">
            🇮🇳 हिंदी
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero section">
        <div className="hero-bg-glow" />
        <div className="container hero-content">
          <span className="badge badge-primary hero-badge animate-fade-in">
            🎯 Free Forever — No Login Required
          </span>

          <h1 className="hero-title animate-fade-in">
            Master Competitive Exams with{" "}
            <span className="gradient-text">Previous Year Questions</span>
          </h1>

          <p className="hero-subtitle animate-fade-in">
            Practice 1,25,000+ questions from SSC, Railway, and Banking exams.
            Filter by year, date, shift — or browse by subject and topic.
            Hindi &amp; English support.
          </p>

          <div className="hero-actions animate-fade-in">
            <Link href="/exams" className="btn btn-primary btn-lg">
              Browse by Exam →
            </Link>
            <Link href="/subjects" className="btn btn-outline btn-lg">
              Browse by Subject
            </Link>
          </div>

          {/* Stats */}
          <div className="stats-row animate-fade-in">
            {STATS.map((stat) => (
              <div key={stat.label} className="stat-item">
                <span className="stat-value gradient-text">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Exam Categories ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Browse by <span className="gradient-text">Exam</span></h2>
            <p>Select your target exam and filter questions by year, date &amp; shift</p>
          </div>

          <div className="exam-grid">
            {EXAM_CATEGORIES.map((exam) => (
              <Link key={exam.id} href={`/exams/${exam.id}`} className="exam-card card">
                <div className="exam-card-header">
                  <span className="exam-icon">{exam.icon}</span>
                  <div className="exam-header-text">
                    <h3>{exam.name}</h3>
                    <p>{exam.fullName}</p>
                  </div>
                  <span className="badge badge-primary">{exam.questions}</span>
                </div>

                <div className="exam-tags">
                  {exam.exams.map((e) => (
                    <span key={e} className="exam-tag">{e}</span>
                  ))}
                </div>

                <div className="exam-card-footer">
                  <span className="btn btn-outline btn-sm">Explore Exams →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects Grid ───────────────────────────────────── */}
      <section className="section subjects-bg">
        <div className="container">
          <div className="section-header">
            <h2>Browse by <span className="gradient-text">Subject</span></h2>
            <p>Dive deep into specific topics and subtopics across all exams</p>
          </div>

          <div className="grid-3" style={{ marginTop: "40px" }}>
            {SUBJECTS.map((subject) => (
              <Link
                key={subject.slug}
                href={`/subjects/${subject.slug}`}
                className="subject-card card"
              >
                <span className="subject-icon">{subject.icon}</span>
                <h4>{subject.name}</h4>
                <p>{subject.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Practice Modes ──────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Two Powerful <span className="gradient-text">Practice Modes</span></h2>
          </div>

          <div className="modes-grid">
            <div className="mode-card card">
              <span className="mode-icon">📖</span>
              <h3>Q&amp;A Mode</h3>
              <p>
                Read questions naturally. Click to reveal answers and detailed
                explanations. Ideal for focused reading and revision.
              </p>
              <ul className="feature-list">
                <li>✓ Hidden answers — reveal when ready</li>
                <li>✓ Full explanation with every answer</li>
                <li>✓ Infinite scroll — 20 questions per load</li>
              </ul>
            </div>

            <div className="mode-card card">
              <span className="mode-icon">🎯</span>
              <h3>MCQ Quiz Mode</h3>
              <p>
                Attempt questions as a real exam. Get instant feedback, track
                your score, and improve over time.
              </p>
              <ul className="feature-list">
                <li>✓ 4-option multiple choice format</li>
                <li>✓ Instant correct/wrong feedback</li>
                <li>✓ Score tracker per session</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="navbar-logo" style={{ marginBottom: "12px", display: "inline-flex" }}>
                <span className="logo-icon">📚</span>
                <span className="gradient-text" style={{ fontSize: "1.25rem" }}>PYQBank</span>
              </Link>
              <p>
                Free Previous Year Questions for SSC, Railway, and Banking exams.
                Hindi &amp; English supported.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-col">
                <h5>Exams</h5>
                <Link href="/exams/ssc">SSC</Link>
                <Link href="/exams/railway">Railway</Link>
                <Link href="/exams/banking">Banking</Link>
              </div>
              <div className="footer-col">
                <h5>Subjects</h5>
                <Link href="/subjects/mathematics">Maths</Link>
                <Link href="/subjects/english">English</Link>
                <Link href="/subjects/general-knowledge">GK</Link>
              </div>
            </div>
          </div>

          <div className="divider" />
          <p className="footer-copy">
            © 2024 PYQBank. Built with ❤️ for competitive exam aspirants across India.
          </p>
        </div>
      </footer>
    </main>
  );
}
