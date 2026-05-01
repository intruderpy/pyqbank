import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubjectBySlug, getTopicsBySubject, getSubtopicBySlug, getQuestionsByTopicAdvanced } from "@/lib/queries";
import Breadcrumb from "@/components/Breadcrumb";
import SubtopicClientView from "./SubtopicClientView";
import "@/styles/browse.css";

interface Props {
  params: Promise<{ subject: string; topic: string; subtopic: string }>;
}

export default async function SubtopicPage({ params }: Props) {
  const { subject: subjectSlug, topic: topicSlug, subtopic: subtopicSlug } = await params;

  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) notFound();

  const topics = await getTopicsBySubject(subject.id);
  const topic = topics.find((t) => t.slug === topicSlug);
  if (!topic) notFound();

  const subtopic = await getSubtopicBySlug(topic.id, subtopicSlug);
  if (!subtopic) notFound();

  // Fetch initial questions for SEO
  const initialQuestions = await getQuestionsByTopicAdvanced(topic.id, subtopic.id, 0, 20);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Subjects", href: "/subjects" },
    { label: subject.name, href: `/subjects/${subject.slug}` },
    { label: topic.name, href: `/subjects/${subject.slug}/${topic.slug}` },
    { label: subtopic.name, href: "" }, // Current page
  ];

  return (
    <main>
      

      <div className="container" style={{ padding: "32px 24px" }}>
        <Breadcrumb items={breadcrumbs} />

        <h1 style={{ marginTop: "16px", marginBottom: "32px" }}>
          <span className="gradient-text">{subtopic.name}</span> Questions
        </h1>

        {initialQuestions.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No questions found for this subtopic.</p>
          </div>
        ) : (
          <SubtopicClientView
            initialQuestions={initialQuestions}
            topicId={topic.id}
            subtopicId={subtopic.id}
            sessionLabel={`${subtopic.name} — All Questions`}
            hideLangToggle={subjectSlug === "english"}
          />
        )}
      </div>
    </main>
  );
}
