const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const generateSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const SUBJECT_MAP = {
  "General Intelligence & Reasoning": 10, // Reasoning
  "General Awareness": 8, // GS
  "Quantitative Aptitude": 7, // Quantitative Aptitude
  "English Comprehension": 11, // English
  "English Language": 11, // English
};

async function run() {
  try {
    const rawData = fs.readFileSync('SSC_CGL_2025_12Sept_Shift1.json');
    const data = JSON.parse(rawData);

    console.log(`Parsed JSON for exam: ${data.exam}, date: ${data.date}`);

    // 1. Get or Create Exam Session
    // We know exam_id = 9 (SSC), category_id = 9 (CGL)
    const categoryId = 9;
    const year = 2025;
    const examDate = "2025-09-12";
    const shiftMap = {
      "Shift 1": "Morning",
      "Shift 2": "Afternoon",
      "Shift 3": "Evening"
    };
    const shift = shiftMap[data.shift] || data.shift;

    let { data: sessionData, error: sessionErr } = await supabase
      .from('exam_sessions')
      .select('id')
      .eq('category_id', categoryId)
      .eq('year', year)
      .eq('exam_date', examDate)
      .eq('shift', shift)
      .single();

    let sessionId;
    if (sessionData) {
      sessionId = sessionData.id;
      console.log(`Found existing session: ${sessionId}`);
    } else {
      const { data: newSession, error: newSessionErr } = await supabase
        .from('exam_sessions')
        .insert({
          category_id: categoryId,
          year: year,
          exam_date: examDate,
          shift: shift
        })
        .select()
        .single();
      if (newSessionErr) throw newSessionErr;
      sessionId = newSession.id;
      console.log(`Created new session: ${sessionId}`);
    }

    // 2. Process Questions
    let successCount = 0;
    
    // Fetch existing topics and subtopics to minimize DB calls
    const { data: existingTopics } = await supabase.from('topics').select('*');
    const { data: existingSubtopics } = await supabase.from('subtopics').select('*');
    
    let topics = existingTopics || [];
    let subtopics = existingSubtopics || [];

    for (const q of data.questions) {
      const subjectId = SUBJECT_MAP[q.section];
      if (!subjectId) {
        console.warn(`Warning: Unknown section '${q.section}' for q_no ${q.q_no}`);
        continue;
      }

      // Topic logic
      const topicName = q.type || "Miscellaneous";
      const topicSlug = generateSlug(topicName);
      let topic = topics.find(t => t.slug === topicSlug && t.subject_id === subjectId);
      
      if (!topic) {
        const { data: newTopic, error: topicErr } = await supabase
          .from('topics')
          .insert({ subject_id: subjectId, name: topicName, slug: topicSlug })
          .select()
          .single();
        if (topicErr) {
          console.error(`Error creating topic: ${topicErr.message}`);
          continue;
        }
        topic = newTopic;
        topics.push(topic);
      }

      // Subtopic logic
      const subtopicName = "Miscellaneous";
      const subtopicSlug = "misc";
      let subtopic = subtopics.find(st => st.slug === subtopicSlug && st.topic_id === topic.id);
      
      if (!subtopic) {
        const { data: newSubtopic, error: stErr } = await supabase
          .from('subtopics')
          .insert({ topic_id: topic.id, name: subtopicName, slug: subtopicSlug })
          .select()
          .single();
        if (stErr) {
          console.error(`Error creating subtopic: ${stErr.message}`);
          continue;
        }
        subtopic = newSubtopic;
        subtopics.push(subtopic);
      }

      // Options logic - Split by " / "
      const parseOption = (text) => {
        if (!text) return { en: null, hi: null };
        const parts = text.split(' / ');
        if (parts.length > 1) {
          return { en: parts[0].trim(), hi: parts[1].trim() };
        }
        return { en: text.trim(), hi: null };
      };

      const optA = parseOption(q.options.A);
      const optB = parseOption(q.options.B);
      const optC = parseOption(q.options.C);
      const optD = parseOption(q.options.D);

      const qSlug = generateSlug(`${topicSlug}-${sessionId}-${q.q_no}-${Date.now().toString().slice(-4)}`);

      const questionData = {
        exam_session_id: sessionId,
        subject_id: subjectId,
        topic_id: topic.id,
        subtopic_id: subtopic.id,
        question_text_en: q.question_en,
        question_text_hi: q.question_hi || null,
        option_a_en: optA.en,
        option_a_hi: optA.hi,
        option_b_en: optB.en,
        option_b_hi: optB.hi,
        option_c_en: optC.en,
        option_c_hi: optC.hi,
        option_d_en: optD.en,
        option_d_hi: optD.hi,
        correct_option: q.correct_answer.toLowerCase(),
        explanation_en: q.explanation_en || null,
        explanation_hi: q.explanation_hi || null,
        difficulty: 'medium',
        slug: qSlug
      };

      const { error: insertErr } = await supabase.from('questions').insert(questionData);
      
      if (insertErr) {
        console.error(`Error inserting Q${q.q_no}:`, insertErr.message);
      } else {
        successCount++;
        process.stdout.write(`\rInserted ${successCount}/${data.questions.length}`);
      }
    }
    
    console.log(`\n\n✅ Done! Successfully inserted ${successCount} questions.`);
  } catch (e) {
    console.error("Fatal Error:", e);
  }
}

run();
