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
    description: `Browse ${exam.toUpperCase()} ${category.toUpperCase()} previous year questions by year.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { exam: examSlug, category: catSlug } = await params;

  const exam = await getExamBySlug(examSlug);
  if (!exam) notFound();

  const category = await getCategoryBySlug(exam.id, catSlug);
  if (!category) notFound();

  const sessions = await getSessionsByCategory(category.id);

  // Get unique years
  const years = Array.from(new Set(sessions.map((s) => s.year))).sort((a, b) => b - a);

  return (
    <main>
      

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
          Choose a year to browse all questions, dates, and shifts for {category.name}
        </p>

        {years.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No questions found for this category yet. Check back soon!</p>
          </div>
        ) : (
          <div className="browse-grid">
            {years.map((year) => (
              <Link
                key={year}
                href={`/exams/${examSlug}/${catSlug}/${year}`}
                className="browse-card card"
                style={{ alignItems: "center", textAlign: "center", padding: "32px 16px" }}
              >
                <span style={{ fontSize: "3rem", fontWeight: "800", color: "var(--text-primary)" }}>
                  {year}
                </span>
                <div className="browse-card-footer" style={{ marginTop: "16px", paddingTop: 0 }}>
                  <span className="btn btn-outline btn-sm">Browse Questions →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
