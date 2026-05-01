import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/config'
import type { Exam, Category, ExamSession, Subject, Topic, Subtopic } from '@/types/database'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/exams`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/subjects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // 1. Fetch Questions (Priority 1)
  const { data: questions } = await supabase.from('questions').select('slug, created_at').not('slug', 'is', null);
  const safeQuestions = questions as { slug: string, created_at: string }[] | null;
  if (safeQuestions) {
    for (const q of safeQuestions) {
      entries.push({
        url: `${SITE_URL}/question/${q.slug}`,
        lastModified: new Date(q.created_at),
        changeFrequency: 'monthly',
        priority: 0.9
      });
    }
  }

  // 2. Fetch Exams & Categories & Sessions (Dates & Shifts)
  const { data: examsData } = await supabase.from('exams').select('*');
  const exams = examsData as Exam[] | null;

  const { data: allCatsData } = await supabase.from('categories').select('*');
  const allCats = allCatsData as Category[] | null;

  const { data: sessionsData } = await supabase.from('exam_sessions').select('*');
  const sessions = sessionsData as ExamSession[] | null;

  if (exams && allCats && sessions) {
    const examMap = new Map(exams.map(e => [e.id, e.slug]));
    const catMap = new Map(allCats.map(c => [c.id, { slug: c.slug, examId: c.exam_id }]));

    for (const exam of exams) {
      entries.push({ url: `${SITE_URL}/exams/${exam.slug}`, changeFrequency: 'weekly', priority: 0.8 });
    }

    for (const cat of allCats) {
      const examSlug = examMap.get(cat.exam_id);
      if (examSlug) {
        entries.push({ url: `${SITE_URL}/exams/${examSlug}/${cat.slug}`, changeFrequency: 'weekly', priority: 0.8 });
      }
    }

    for (const session of sessions) {
      const cat = catMap.get(session.category_id);
      if (cat) {
        const examSlug = examMap.get(cat.examId);
        if (examSlug) {
          const yearUrl = `${SITE_URL}/exams/${examSlug}/${cat.slug}/${session.year}`;
          if (!entries.some(e => e.url === yearUrl)) {
            entries.push({ url: yearUrl, changeFrequency: 'weekly', priority: 0.7 });
          }

          if (session.exam_date) {
            const dateUrl = `${yearUrl}/${session.exam_date}`;
            if (!entries.some(e => e.url === dateUrl)) {
              entries.push({ url: dateUrl, changeFrequency: 'weekly', priority: 0.6 });
            }

            if (session.shift) {
              const shiftUrl = `${dateUrl}/${session.shift}`;
              if (!entries.some(e => e.url === shiftUrl)) {
                entries.push({ url: shiftUrl, changeFrequency: 'weekly', priority: 0.6 });
              }
            }
          }
        }
      }
    }
  }

  // 3. Fetch Subjects & Topics & Subtopics
  const { data: subjectsData } = await supabase.from('subjects').select('*');
  const subjects = subjectsData as Subject[] | null;

  const { data: topicsData } = await supabase.from('topics').select('*');
  const topics = topicsData as Topic[] | null;

  const { data: subtopicsData } = await supabase.from('subtopics').select('*');
  const subtopics = subtopicsData as Subtopic[] | null;

  if (subjects && topics) {
    const subjectMap = new Map(subjects.map(s => [s.id, s.slug]));
    const topicMap = new Map(topics.map(t => [t.id, { slug: t.slug, subSlug: subjectMap.get(t.subject_id) }]));

    for (const sub of subjects) {
      entries.push({ url: `${SITE_URL}/subjects/${sub.slug}`, changeFrequency: 'weekly', priority: 0.8 });
    }

    for (const topic of topics) {
      const subSlug = subjectMap.get(topic.subject_id);
      if (subSlug) {
        entries.push({ url: `${SITE_URL}/subjects/${subSlug}/${topic.slug}`, changeFrequency: 'weekly', priority: 0.7 });
      }
    }

    if (subtopics) {
      for (const subtopic of subtopics) {
        const topic = topicMap.get(subtopic.topic_id);
        if (topic && topic.subSlug) {
          entries.push({ url: `${SITE_URL}/subjects/${topic.subSlug}/${topic.slug}/${subtopic.slug}`, changeFrequency: 'weekly', priority: 0.6 });
        }
      }
    }
  }

  return entries;
}
