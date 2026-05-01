import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { getExamBySlug, getCategoryBySlug, getQuestionsByAdvancedFilter } from "@/lib/queries";
import { SITE_URL } from "@/lib/config";
import Breadcrumb from "@/components/Breadcrumb";
import ExamClientView from "./ExamClientView";
import "@/styles/browse.css";

interface Props {
  params: Promise<{ exam: string; category: string; year: string; date: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase.from("exam_sessions").select("exam_date, categories(slug, exams(slug)), year");
  
  return (data as any[])?.filter(s => s.exam_date).map((s) => ({
    exam: s.categories?.exams?.slug,
    category: s.categories?.slug,
    year: s.year.toString(),
    date: s.exam_date,
  })) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam: examSlug, category: categorySlug, year, date } = await params;
  
  const exam = await getExamBySlug(examSlug);
  if (!exam) return { title: "Not Found" };
  const category = await getCategoryBySlug(exam.id, categorySlug);
  if (!category) return { title: "Not Found" };

  const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const title = `${category.name} ${year} Questions (${formattedDate}) | ${exam.name}`;
  const desc = `Practice all questions asked in ${category.name} ${year} on ${formattedDate}.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/exams/${examSlug}/${categorySlug}/${year}/${date}`,
      siteName: "PYQBank",
    },
  };
}

export default async function DatePage({ params }: Props) {
  const { exam: examSlug, category: categorySlug, year, date } = await params;

  const exam = await getExamBySlug(examSlug);
  if (!exam) notFound();
  const category = await getCategoryBySlug(exam.id, categorySlug);
  if (!category) notFound();

  const numYear = parseInt(year);
  const initialQuestions = await getQuestionsByAdvancedFilter(category.id, numYear, date, null, null, 0, 20);

  const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Exams", href: "/exams" },
    { label: exam.name, href: `/exams/${exam.slug}` },
    { label: category.name, href: `/exams/${exam.slug}/${category.slug}` },
    { label: year, href: `/exams/${exam.slug}/${category.slug}/${year}` },
    { label: formattedDate, href: "" },
  ];

  return (
    <main>
      

      <div className="container" style={{ padding: "32px 24px" }}>
        <Breadcrumb items={breadcrumbs} />

        <h1 style={{ marginTop: "16px", marginBottom: "32px" }}>
          <span className="gradient-text">{category.name} {year}</span> — {formattedDate}
        </h1>

        {initialQuestions.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No questions found for this date.</p>
          </div>
        ) : (
          <ExamClientView
            initialQuestions={initialQuestions}
            categoryId={category.id}
            year={numYear}
            date={date}
            shift={null}
            sessionLabel={`All Questions — ${formattedDate}`}
          />
        )}
      </div>
    </main>
  );
}
