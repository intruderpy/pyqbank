import Link from "next/link";
import { notFound } from "next/navigation";
import { getSubjectBySlug, getTopicsBySubject } from "@/lib/queries";
import type { Metadata } from "next";
import "@/styles/browse.css";

type Props = { params: Promise<{ subject: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} PYQ — Browse Topics`,
    description: `Practice previous year questions for ${slug.replace(/-/g, " ")} — browse by topic and subtopic.`,
  };
}

export default async function SubjectPage({ params }: Props) {
  const { subject: slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

  const topics = await getTopicsBySubject(subject.id);

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
          <Link href="/">Home</Link><span>›</span>
          <Link href="/subjects">Subjects</Link><span>›</span>
          <span>{subject.name}</span>
        </div>

        <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "2.5rem" }}>{subject.icon}</span>
          <div>
            <h1><span className="gradient-text">{subject.name}</span> — Select Topic</h1>
            <p style={{ marginTop: "4px" }}>Choose a topic to browse questions</p>
          </div>
        </div>

        {/* All Questions link */}
        <div style={{ marginTop: "24px" }}>
          <Link
            href={`/subjects/${slug}/questions`}
            className="btn btn-primary"
          >
            📚 All {subject.name} Questions →
          </Link>
        </div>

        {topics.length === 0 ? (
          <div className="empty-state" style={{ marginTop: "40px" }}>
            <span>📭</span><p>No topics found yet. Check back soon!</p>
          </div>
        ) : (
          <div className="browse-grid" style={{ marginTop: "32px" }}>
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/subjects/${slug}/${topic.slug}`}
                className="browse-card card"
              >
                <h3 className="browse-card-title">{topic.name}</h3>
                <div className="browse-card-footer">
                  <span className="btn btn-outline btn-sm">Practice Questions →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
