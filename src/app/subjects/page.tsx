import Link from "next/link";
import { getAllSubjects } from "@/lib/queries";
import type { Metadata } from "next";
import "@/styles/browse.css";

export const metadata: Metadata = {
  title: "Browse by Subject — Maths, English, GK, Reasoning PYQ",
  description: "Browse previous year questions by subject. Choose Maths, English, GK, Reasoning and more.",
};

export default async function SubjectsPage() {
  const subjects = await getAllSubjects();

  return (
    <main>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span>📚</span><span className="gradient-text">PYQBank</span>
          </Link>
          <div className="navbar-links">
            <Link href="/exams" className="nav-link">Exams</Link>
            <Link href="/subjects" className="nav-link active">Subjects</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: "48px 24px" }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link><span>›</span><span>Subjects</span>
        </div>

        <h1 style={{ marginTop: "16px" }}>
          Browse by <span className="gradient-text">Subject</span>
        </h1>
        <p style={{ marginTop: "8px", marginBottom: "40px" }}>
          Select a subject to explore topics and subtopics
        </p>

        <div className="browse-grid">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.slug}`} className="browse-card card" style={{ textAlign: "center" }}>
              <span style={{ fontSize: "3rem", display: "block" }}>{subject.icon ?? "📚"}</span>
              <h3 className="browse-card-title" style={{ marginTop: "12px" }}>{subject.name}</h3>
              <div className="browse-card-footer">
                <span className="btn btn-outline btn-sm">Browse Topics →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
