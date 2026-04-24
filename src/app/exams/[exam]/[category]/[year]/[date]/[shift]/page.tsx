import { notFound } from "next/navigation";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { getExamBySlug, getCategoryBySlug, getQuestionsByAdvancedFilter } from "@/lib/queries";
import { SITE_URL } from "@/lib/config";
import Breadcrumb from "@/components/Breadcrumb";
import ExamClientView from "../ExamClientView";
import "@/styles/browse.css";

interface Props {
  params: Promise<{ exam: string; category: string; year: string; date: string; shift: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase.from("exam_sessions").select("exam_date, shift, categories(slug, exams(slug)), year");
  
  return (data as any[])?.filter(s => s.exam_date && s.shift).map((s) => ({
    exam: s.categories?.exams?.slug,
    category: s.categories?.slug,
    year: s.year.toString(),
    date: s.exam_date,
    shift: s.shift,
  })) ?? [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam: examSlug, category: categorySlug, year, date, shift } = await params;
  
  const exam = await getExamBySlug(examSlug);
  if (!exam) return { title: "Not Found" };
  const category = await getCategoryBySlug(exam.id, categorySlug);
  if (!category) return { title: "Not Found" };

  const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const title = `${category.name} ${year} Questions (${formattedDate} - ${shift} Shift) | ${exam.name}`;
  const desc = `Practice all questions asked in ${category.name} ${year} on ${formattedDate} during the ${shift} shift.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${SITE_URL}/exams/${examSlug}/${categorySlug}/${year}/${date}/${shift}`,
      siteName: "PYQBank",
    },
  };
}

export default async function ShiftPage({ params }: Props) {
  const { exam: examSlug, category: categorySlug, year, date, shift } = await params;

  const exam = await getExamBySlug(examSlug);
  if (!exam) notFound();
  const category = await getCategoryBySlug(exam.id, categorySlug);
  if (!category) notFound();

  const numYear = parseInt(year);
  const initialQuestions = await getQuestionsByAdvancedFilter(category.id, numYear, date, shift, null, 0, 20);

  const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Exams", href: "/exams" },
    { label: exam.name, href: `/exams/${exam.slug}` },
    { label: category.name, href: `/exams/${exam.slug}/${category.slug}` },
    { label: year, href: `/exams/${exam.slug}/${category.slug}/${year}` },
    { label: formattedDate, href: `/exams/${exam.slug}/${category.slug}/${year}/${date}` },
    { label: `${shift} Shift`, href: "" },
  ];

  return (
    <main>
      <nav className="navbar">
        <div className="container navbar-inner">
          <a href="/" className="navbar-logo">
            <span>📚</span><span className="gradient-text">PYQBank</span>
          </a>
        </div>
      </nav>

      <div className="container" style={{ padding: "32px 24px" }}>
        <Breadcrumb items={breadcrumbs} />

        <h1 style={{ marginTop: "16px", marginBottom: "32px" }}>
          <span className="gradient-text">{category.name} {year}</span> — {formattedDate} ({shift} Shift)
        </h1>

        {initialQuestions.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>No questions found for this shift.</p>
          </div>
        ) : (
          <ExamClientView
            initialQuestions={initialQuestions}
            categoryId={category.id}
            year={numYear}
            date={date}
            shift={shift}
            sessionLabel={`${shift} Shift — ${formattedDate}`}
          />
        )}
      </div>
    </main>
  );
}
