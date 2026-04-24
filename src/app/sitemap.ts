import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import type { Exam, Category, ExamSession, Subject, Topic } from '@/types/database'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pyqbank.vercel.app';
  
  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/exams`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/subjects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // Fetch Exams
  const { data: exams }: { data: Exam[] | null } = await supabase.from('exams').select('*');
  if (exams) {
    for (const exam of exams) {
      entries.push({ url: `${baseUrl}/exams/${exam.slug}`, changeFrequency: 'weekly', priority: 0.8 });
    }
  }

  // Fetch Categories & Years
  const { data: allCats }: { data: Category[] | null } = await supabase.from('categories').select('*');
  if (allCats && exams) {
    const examMap = new Map(exams.map(e => [e.id, e.slug]));
    for (const cat of allCats) {
      const examSlug = examMap.get(cat.exam_id);
      if (examSlug) {
        entries.push({ url: `${baseUrl}/exams/${examSlug}/${cat.slug}`, changeFrequency: 'weekly', priority: 0.8 });

        const { data: sessions }: { data: ExamSession[] | null } = await supabase.from('exam_sessions').select('*').eq('category_id', cat.id);
        if (sessions) {
          const years = Array.from(new Set(sessions.map(s => s.year)));
          for (const year of years) {
            entries.push({ url: `${baseUrl}/exams/${examSlug}/${cat.slug}/${year}`, changeFrequency: 'weekly', priority: 0.7 });
          }
        }
      }
    }
  }

  // Fetch Subjects
  const { data: subjects }: { data: Subject[] | null } = await supabase.from('subjects').select('*');
  if (subjects) {
    for (const sub of subjects) {
      entries.push({ url: `${baseUrl}/subjects/${sub.slug}`, changeFrequency: 'weekly', priority: 0.8 });
    }

    // Fetch Topics
    const { data: topics }: { data: Topic[] | null } = await supabase.from('topics').select('*');
    if (topics) {
      const subjectMap = new Map(subjects.map(s => [s.id, s.slug]));
      for (const topic of topics) {
        const subSlug = subjectMap.get(topic.subject_id);
        if (subSlug) {
          entries.push({ url: `${baseUrl}/subjects/${subSlug}/${topic.slug}`, changeFrequency: 'weekly', priority: 0.7 });
        }
      }
    }
  }

  return entries;
}
