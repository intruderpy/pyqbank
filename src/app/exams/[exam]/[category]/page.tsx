import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamBySlug, getCategoryBySlug, getSessionsByCategory } from "@/lib/queries";
import type { Metadata } from "next";
import "@/styles/browse.css";

type Props = { params: Promise<{ exam: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam, category } = await params;
  return {
    title: `${category.toUpperCase()} PYQ — Select Year`,
    description: `Browse ${exam.toUpperCase()} ${category.toUpperCase()} previous year questions by year and shift.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { exam: examSlug, category: catSlug } = await params;

  const exam = await getExamBySlug(examSlug);
  if (!exam) notFound();

  const category = await getCategoryBySlug(exam.id, catSlug);
  if (!category) notFound();

  const sessions = await getSessionsByCategory(category.id);

  // Group sessions by year
  const byYear = sessions.reduce<Record<number, typeof sessions>>((acc, s) => {
    if (!acc[s.year]) acc[s.year] = [];
    acc[s.year].push(s);
    return acc;
  }, {});

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  return (
    <main>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">
            <span>📚</span><span className="gradient-text">PYQBank</span>
          </Link>
          <div className="navbar-links">
            <Link href="/exams" className="nav-link active">Exams</Link>
            <Link href="/subjects" className="nav-link">Subjects</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: "48px 24px" }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link><span>›</span>
          <Link href="/exams">Exams</Link><span>›</span>
          <Link href={`/exams/${examSlug}`}>{exam.name}</Link><span>›</span>
          <span>{category.name}</span>
        </div>

        <h1 style={{ marginTop: "16px" }}>
          {exam.icon} {exam.name}{" "}
          <span className="gradient-text">{category.name}</span> — Select Year
        </h1>
        <p style={{ marginTop: "8px", marginBottom: "40px" }}>
          Choose a year to browse questions by date and shift
        </p>

        {years.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No exam sessions found yet. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {years.map((year) => (
              <div key={year} className="year-section">
                <h2 className="year-heading">{year}</h2>
                <div className="session-grid">
                  {byYear[year].map((session) => {
                    const dateStr = session.exam_date
                      ? new Date(session.exam_date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "long", year: "numeric",
                        })
                      : "Date TBA";

                    return (
                      <Link
                        key={session.id}
                        href={`/exams/${examSlug}/${catSlug}/${session.id}`}
                        className="session-card card"
                      >
                        <div className="session-date">📅 {dateStr}</div>
                        {session.shift && (
                          <div className="session-shift">
                            <span className={`badge badge-${
                              session.shift === "Morning" ? "info" :
                              session.shift === "Evening" ? "warning" : "primary"
                            }`}>
                              {session.shift === "Morning" ? "🌅" :
                               session.shift === "Evening" ? "🌆" : "☀️"}{" "}
                              {session.shift} Shift
                            </span>
                          </div>
                        )}
                        <div style={{ marginTop: "16px" }}>
                          <span className="btn btn-primary btn-sm">Practice Questions →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
