import Link from "next/link";
import { getAllSubjects } from "@/lib/queries";
import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import "@/styles/browse.css";

export const metadata: Metadata = {
  title: "Browse by Subject — Maths, English, GK, Reasoning PYQ",
  description: "Browse previous year questions by subject. Choose Maths, English, GK, Reasoning and more.",
};

export default async function SubjectsPage() {
  const subjects = await getAllSubjects();

  // I3: Fetch question counts per subject
  const { data: countData } = await supabase
    .from("questions")
    .select("subject_id")
    .not("subject_id", "is", null);
  
  const subjectCounts: Record<number, number> = {};
  if (countData) {
    for (const q of countData as { subject_id: number | null }[]) {
      const sid = q.subject_id;
      if (sid) subjectCounts[sid] = (subjectCounts[sid] || 0) + 1;
    }
  }

  return (
    <main>
      

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
              <span className="badge badge-primary" style={{ marginTop: "8px" }}>{subjectCounts[subject.id] || 0} Questions</span>
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
