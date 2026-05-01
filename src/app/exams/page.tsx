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

  return (
    <main>
      {/* Navbar */}
      

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
              return (
                <Link key={exam.id} href={`/exams/${exam.slug}`} className="browse-card card">
                  <div className="browse-card-top">
                    <span className="browse-icon">{exam.icon ?? "📋"}</span>
                    <div>
                      <h2 className="browse-card-title">{exam.name}</h2>
                      <p className="browse-card-desc">{exam.description}</p>
                    </div>
                    <span className="badge badge-primary">{exam.question_count || 0} Qs</span>
                  </div>
                  <div className="exam-tags" style={{ marginTop: "16px" }}>
                    {exam.tags && exam.tags.length > 0 ? (
                      exam.tags.map((t) => (
                        <span key={t} className="exam-tag">{t}</span>
                      ))
                    ) : (
                      <span className="exam-tag">Multiple Categories</span>
                    )}
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
