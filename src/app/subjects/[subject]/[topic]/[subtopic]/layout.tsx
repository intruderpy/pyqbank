import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { getSubjectBySlug, getTopicsBySubject, getSubtopicBySlug } from "@/lib/queries";
import { SITE_URL } from "@/lib/config";

interface Props {
  params: Promise<{ subject: string; topic: string; subtopic: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  const { data } = await supabase.from("subtopics").select("slug, topics(slug, subjects(slug))");
  return data?.map((s: any) => ({
    subject: s.topics?.subjects?.slug,
    topic: s.topics?.slug,
    subtopic: s.slug,
  })) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: subjectSlug, topic: topicSlug, subtopic: subtopicSlug } = await params;

  const subject = await getSubjectBySlug(subjectSlug);
  if (!subject) return { title: "Not Found" };

  const topics = await getTopicsBySubject(subject.id);
  const topic = topics.find((t) => t.slug === topicSlug);
  if (!topic) return { title: "Not Found" };

  const subtopic = await getSubtopicBySlug(topic.id, subtopicSlug);
  if (!subtopic) return { title: "Not Found" };

  const title = `${subtopic.name} Questions | ${topic.name} - ${subject.name}`;
  const desc = `Practice Previous Year Questions (PYQs) for ${subtopic.name} under ${topic.name} in ${subject.name}.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/subjects/${subjectSlug}/${topicSlug}/${subtopicSlug}`,
      siteName: "PYQBank",
    },
  };
}

export default function SubtopicLayout({ children }: Props) {
  return <>{children}</>;
}
