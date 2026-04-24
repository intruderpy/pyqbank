import Link from "next/link";
import { notFound } from "next/navigation";
import { getExamBySlug, getCategoriesByExam } from "@/lib/queries";
import type { Metadata } from "next";
import "@/styles/browse.css";

type Props = { params: Promise<{ exam: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam: slug } = await params;
  return {
    title: `${slug.toUpperCase()} PYQ — Browse Categories`,
    description: `Browse all ${slug.toUpperCase()} exam categories and practice previous year questions.`,
  };
}

export default async function ExamPage({ params }: Props) {
  const { exam: slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) notFound();

  const categories = await getCategoriesByExam(exam.id);

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
          <span>{exam.name}</span>
        </div>

        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "2.5rem" }}>{exam.icon}</span>
          <div>
            <h1><span className="gradient-text">{exam.name}</span> — Select Category</h1>
            <p style={{ marginTop: "4px" }}>{exam.description}</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state" style={{ marginTop: "40px" }}>
            <span>📭</span><p>No categories found for this exam.</p>
          </div>
        ) : (
          <div className="browse-grid" style={{ marginTop: "40px" }}>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/exams/${slug}/${cat.slug}`} className="browse-card card">
                <h3 className="browse-card-title">{cat.name}</h3>
                <p className="browse-card-desc" style={{ marginTop: "8px" }}>
                  {cat.description ?? `${exam.name} ${cat.name} Previous Year Questions`}
                </p>
                <div className="browse-card-footer">
                  <span className="btn btn-outline btn-sm">Browse Years →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
