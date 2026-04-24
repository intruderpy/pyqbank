import Link from "next/link";
import { getAllExams } from "@/lib/queries";
import type { Metadata } from "next";
import "@/styles/browse.css";

export const metadata: Metadata = {
  title: "Browse by Exam — SSC, Railway, Banking PYQ",
  description: "Browse previous year questions by exam. Choose SSC, Railway, or Banking and filter by year, date and shift.",
};

export default async function ExamsPage() {
  const exams = await getAllExams();

  const EXAM_META: Record<string, { color: string; tags: string[] }> = {
    ssc:     { color: "#4F46E5", tags: ["CGL", "CHSL", "MTS", "GD", "CPO"] },
    railway: { color: "#7C3AED", tags: ["NTPC", "Group D", "ALP", "JE", "RPF"] },
    banking: { color: "#0891B2", tags: ["IBPS PO", "SBI PO", "IBPS Clerk", "RBI"] },
  };

  return (
    <main>
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span>📚</span>
            <span className="gradient-text">PYQBank</span>
          </Link>
          <div className="navbar-links">
            <Link href="/exams" className="nav-link active">Exams</Link>
            <Link href="/subjects" className="nav-link">Subjects</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: "48px 24px" }}>
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span>Exams</span>
        </div>

        <h1 style={{ marginTop: "16px" }}>
          Browse by <span className="gradient-text">Exam</span>
        </h1>
        <p style={{ marginTop: "8px", marginBottom: "40px" }}>
          Select your exam to filter questions by year, date &amp; shift
        </p>

        {exams.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No exams found. Please check your database.</p>
          </div>
        ) : (
          <div className="browse-grid">
            {exams.map((exam) => {
              const meta = EXAM_META[exam.slug] ?? { color: "#4F46E5", tags: [] };
              return (
                <Link key={exam.id} href={`/exams/${exam.slug}`} className="browse-card card">
                  <div className="browse-card-top">
                    <span className="browse-icon">{exam.icon ?? "📋"}</span>
                    <div>
                      <h2 className="browse-card-title">{exam.name}</h2>
                      <p className="browse-card-desc">{exam.description}</p>
                    </div>
                  </div>
                  <div className="exam-tags" style={{ marginTop: "16px" }}>
                    {meta.tags.map((t) => (
                      <span key={t} className="exam-tag">{t}</span>
                    ))}
                  </div>
                  <div className="browse-card-footer">
                    <span className="btn btn-outline btn-sm">View Categories →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
