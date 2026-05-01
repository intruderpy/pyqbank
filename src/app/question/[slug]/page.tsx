import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SITE_URL } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getQuestionBySlug } from "@/lib/queries";
import Breadcrumb from "@/components/Breadcrumb";
import QuestionActions from "@/components/questions/QuestionActions";
import "@/styles/questions.css";
import "@/styles/browse.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase.from("questions").select("slug").not("slug", "is", null);
  return (data as { slug: string }[] | null)?.map((q) => ({ slug: q.slug })) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);

  if (!question) {
    return { title: "Question Not Found" };
  }

  const qText = question.question_text_hi || question.question_text_en;
  const optA = question.option_a_hi || question.option_a_en;
  const optB = question.option_b_hi || question.option_b_en;
  const optC = question.option_c_hi || question.option_c_en;
  const optD = question.option_d_hi || question.option_d_en;

  const desc = `A. ${optA}  B. ${optB}  C. ${optC}  D. ${optD}`;

  let examContext = "";
  if (question.exam_sessions) {
    const session = question.exam_sessions;
    const cat = session.categories;
    const exam = cat?.exams;
    examContext = `${exam?.name} ${cat?.name} ${session.year}`;
  }
  const topicContext = question.topics?.name ?? "";

  return {
    title: qText.length > 60 ? qText.substring(0, 60) + "..." : qText,
    description: desc,
    openGraph: {
      title: qText,
      description: `${examContext} — ${topicContext}\n\n${desc}`,
      url: `${SITE_URL}/question/${slug}`,
      siteName: "PYQBank",
      type: "article",
    },
    twitter: {
      card: "summary",
      title: qText,
      description: desc,
    },
  };
}

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params;
  const question = await getQuestionBySlug(slug);

  if (!question) {
    notFound();
  }

  // Build Breadcrumbs
  const breadcrumbItems = [{ label: "Home", href: "/" }];

  if (question.topics?.subjects) {
    const subject = question.topics.subjects;
    breadcrumbItems.push({ label: "Subjects", href: "/subjects" });
    breadcrumbItems.push({ label: subject.name, href: `/subjects/${subject.slug}` });
    
    if (question.topics) {
      breadcrumbItems.push({ label: question.topics.name, href: `/subjects/${subject.slug}/${question.topics.slug}` });
    }
  } else if (question.exam_sessions?.categories?.exams) {
    // Fallback to Exam flow if no subject (shouldn't happen but safe)
    const exam = question.exam_sessions.categories.exams;
    const cat = question.exam_sessions.categories;
    const year = question.exam_sessions.year;
    breadcrumbItems.push({ label: "Exams", href: "/exams" });
    breadcrumbItems.push({ label: exam.name, href: `/exams/${exam.slug}` });
    breadcrumbItems.push({ label: cat.name, href: `/exams/${exam.slug}/${cat.slug}` });
    breadcrumbItems.push({ label: year.toString(), href: `/exams/${exam.slug}/${cat.slug}/${year}` });
  }

  // Add the current page as text only
  breadcrumbItems.push({ label: "Question", href: "" });

  const isCorrect = (opt: string) => question.correct_option === opt;

  return (
    <main>
      {/* CreativeWork JSON-LD Schema (D12) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: question.question_text_en?.substring(0, 100) || "PYQ Question",
            description: question.explanation_en || question.question_text_en,
            inLanguage: ["en", "hi"],
            educationalLevel: question.difficulty || "Intermediate",
            learningResourceType: "Practice Question",
            isAccessibleForFree: true,
            url: `${SITE_URL}/question/${question.slug}`,
            publisher: {
              "@type": "Organization",
              name: "PYQBank",
              url: SITE_URL,
            },
            ...(question.exam_sessions?.categories?.exams?.name && {
              about: {
                "@type": "Thing",
                name: `${question.exam_sessions.categories.exams.name} ${question.exam_sessions.categories.name} ${question.exam_sessions.year}`,
              },
            }),
          }),
        }}
      />

      <div className="container" style={{ padding: "32px 24px", maxWidth: "800px" }}>
        <Breadcrumb items={breadcrumbItems} />

        <div className="question-card" style={{ marginTop: "32px" }}>
          <div className="question-header" style={{ marginBottom: "16px" }}>
            <span className="badge badge-primary">
              {question.difficulty ? question.difficulty.toUpperCase() : "PYQ"}
            </span>
            {question.exam_sessions && (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                {question.exam_sessions.categories?.exams?.name} {question.exam_sessions.categories?.name} {question.exam_sessions.year}
                {question.exam_sessions.exam_date ? ` — ${new Date(question.exam_sessions.exam_date).toLocaleDateString()}` : ""}
                {question.exam_sessions.shift ? ` (${question.exam_sessions.shift} Shift)` : ""}
              </span>
            )}
          </div>

          <div className="question-text" style={{ fontSize: "1.2rem", marginBottom: "24px", fontWeight: "600" }}>
            {question.question_text_hi || question.question_text_en}
            {question.question_text_hi && question.question_text_en && (
              <div style={{ fontSize: "1rem", color: "var(--text-muted)", marginTop: "8px", fontWeight: "400" }}>
                {question.question_text_en}
              </div>
            )}
          </div>

          <div className="options-grid">
            {["a", "b", "c", "d"].map((opt) => {
              const hiKey = `option_${opt}_hi` as keyof typeof question;
              const enKey = `option_${opt}_en` as keyof typeof question;
              const textHi = question[hiKey] as string | null;
              const textEn = question[enKey] as string;
              const correct = isCorrect(opt);

              return (
                <div
                  key={opt}
                  className={`option-btn ${correct ? "correct" : ""}`}
                  style={{
                    cursor: "default",
                    transform: "none",
                    borderColor: correct ? "var(--success-color)" : "var(--border-default)",
                    backgroundColor: correct ? "rgba(34, 197, 94, 0.1)" : "transparent",
                  }}
                >
                  <span className="option-label">{opt.toUpperCase()}</span>
                  <div className="option-content">
                    {textHi || textEn}
                    {textHi && textEn && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        {textEn}
                      </div>
                    )}
                  </div>
                  {correct && <span style={{ marginLeft: "auto" }}>✅</span>}
                </div>
              );
            })}
          </div>

          {(question.explanation_hi || question.explanation_en) && (
            <div className="explanation-box" style={{ marginTop: "32px", display: "block" }}>
              <h4>Explanation / Solution</h4>
              <p>{question.explanation_hi || question.explanation_en}</p>
              {question.explanation_hi && question.explanation_en && (
                <p style={{ marginTop: "12px", color: "var(--text-muted)" }}>{question.explanation_en}</p>
              )}
            </div>
          )}
          
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border-subtle)" }}>
            <QuestionActions questionId={question.id} slug={question.slug} />
          </div>
        </div>
      </div>
    </main>
  );
}
