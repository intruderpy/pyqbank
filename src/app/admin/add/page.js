"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const INITIAL_FORM = {
    id: null, slug: "",
    question_text_en: "", question_text_hi: "",
    option_a_en: "", option_b_en: "", option_c_en: "", option_d_en: "",
    option_a_hi: "", option_b_hi: "", option_c_hi: "", option_d_hi: "",
    correct_option: "a",
    explanation_en: "", explanation_hi: "",
    exam_session_id: "", subject_id: "", topic_id: "", subtopic_id: "",
    difficulty: "medium",
};

export default function QuestionManagerPage() {
    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [subtopics, setSubtopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState(null);

    // Dependent dropdown state
    const [selectedExamId, setSelectedExamId] = useState("");
    const [selectedCatId, setSelectedCatId] = useState("");

    useEffect(() => { fetchLookups(); fetchQuestions(); }, []);

    const fetchLookups = async () => {
        const [exRes, catRes, sesRes, subRes, topRes, stRes] = await Promise.all([
            supabase.from("exams").select("*").order("name"),
            supabase.from("categories").select("*").order("name"),
            supabase.from("exam_sessions").select("*, categories(name, exams(name))").order("year", { ascending: false }),
            supabase.from("subjects").select("*").order("name"),
            supabase.from("topics").select("*").order("name"),
            supabase.from("subtopics").select("*").order("name"),
        ]);
        if (exRes.data) setExams(exRes.data);
        if (catRes.data) setCategories(catRes.data);
        if (sesRes.data) setSessions(sesRes.data);
        if (subRes.data) setSubjects(subRes.data);
        if (topRes.data) setTopics(topRes.data);
        if (stRes.data) setSubtopics(stRes.data);
    };

    const fetchQuestions = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("questions")
            .select("*, exam_sessions(year, shift, categories(name, exams(name))), subjects(name), topics(name), subtopics(name)")
            .order("created_at", { ascending: false })
            .limit(50);
        if (data) setQuestions(data);
        setLoading(false);
    };

    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Dependent dropdowns
    const filteredCats = categories.filter(c => c.exam_id === parseInt(selectedExamId));
    const filteredSessions = sessions.filter(s => s.category_id === parseInt(selectedCatId));
    const filteredTopics = topics.filter(t => t.subject_id === parseInt(formData.subject_id));
    const filteredSubtopics = subtopics.filter(s => s.topic_id === parseInt(formData.topic_id));

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.question_text_en?.trim()) return notify("error", "English question is required!");
        if (!formData.option_a_en || !formData.option_b_en || !formData.option_c_en || !formData.option_d_en)
            return notify("error", "All 4 English options are required!");

        const autoSlug = (formData.question_text_hi || formData.question_text_en)
            .toLowerCase().replace(/[^a-z0-9\u0900-\u097f]+/gi, '-').replace(/(^-|-$)/g, '').substring(0, 60)
            + '-' + Date.now().toString().slice(-5);
        const payload = {
            slug: formData.slug || autoSlug,
            question_text_en: formData.question_text_en.trim(),
            question_text_hi: formData.question_text_hi?.trim() || null,
            option_a_en: formData.option_a_en, option_b_en: formData.option_b_en,
            option_c_en: formData.option_c_en, option_d_en: formData.option_d_en,
            option_a_hi: formData.option_a_hi || null, option_b_hi: formData.option_b_hi || null,
            option_c_hi: formData.option_c_hi || null, option_d_hi: formData.option_d_hi || null,
            correct_option: formData.correct_option,
            explanation_en: formData.explanation_en?.trim() || null,
            explanation_hi: formData.explanation_hi?.trim() || null,
            exam_session_id: formData.exam_session_id ? parseInt(formData.exam_session_id) : null,
            subject_id: formData.subject_id ? parseInt(formData.subject_id) : null,
            topic_id: formData.topic_id ? parseInt(formData.topic_id) : null,
            subtopic_id: formData.subtopic_id ? parseInt(formData.subtopic_id) : null,
            difficulty: formData.difficulty,
        };

        if (isEditing) {
            const { error } = await supabase.from("questions").update(payload).eq("id", formData.id);
            if (error) return notify("error", error.message);
            notify("success", "Question updated!");
        } else {
            const { data, error } = await supabase.from("questions").insert([payload]).select();
            if (error) return notify("error", error.message);
            if (data) setQuestions([data[0], ...questions]);
            notify("success", "Question added!");
        }
        resetForm();
        fetchQuestions();
    };

    const startEdit = (q) => {
        setIsEditing(true);
        setFormData({
            ...INITIAL_FORM, ...q,
            exam_session_id: q.exam_session_id || "",
            subject_id: q.subject_id || "",
            topic_id: q.topic_id || "",
            subtopic_id: q.subtopic_id || "",
        });
        // Set dependent dropdowns
        const session = sessions.find(s => s.id === q.exam_session_id);
        if (session) {
            setSelectedCatId(String(session.category_id));
            const cat = categories.find(c => c.id === session.category_id);
            if (cat) setSelectedExamId(String(cat.exam_id));
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this question permanently?")) return;
        const { error } = await supabase.from("questions").delete().eq("id", id);
        if (error) return notify("error", error.message);
        setQuestions(questions.filter(q => q.id !== id));
        notify("success", "Deleted!");
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormData(INITIAL_FORM);
        setSelectedExamId(""); setSelectedCatId("");
    };

    return (
        <div className="min-h-screen bg-[#0F1117] text-slate-200 p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-[#2A2D3A] pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">📝 Question Manager</h1>
                        <p className="text-sm text-slate-400 mt-1">Add or edit bilingual PYQs with full hierarchy.</p>
                    </div>
                    <Link href="/admin" className="text-sm bg-[#1A1D27] border border-[#2A2D3A] px-4 py-2 rounded hover:text-white transition">
                        ← Dashboard
                    </Link>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`mb-4 p-3 rounded-lg border text-sm font-bold ${notification.type === "error" ? "bg-red-500/10 border-red-500/40 text-red-400" : "bg-green-500/10 border-green-500/40 text-green-400"
                        }`}>
                        {notification.type === "error" ? "⚠️ " : "✅ "}{notification.msg}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT: FORM ── */}
                    <div className="lg:col-span-2 space-y-5">
                        <form onSubmit={handleSave} className="bg-[#13161E] border border-[#2A2D3A] rounded-xl p-5 md:p-7">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-orange-500">{isEditing ? "✏️ Edit Question" : "➕ Add New Question"}</h2>
                                {isEditing && <button type="button" onClick={resetForm} className="text-sm text-slate-400 hover:text-white underline">Cancel Edit</button>}
                            </div>

                            {/* 1. QUESTION CONTENT */}
                            <div className="bg-[#1A1D27] p-4 rounded-lg border border-[#2A2D3A] mb-5">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-[#2A2D3A] pb-2">
                                    1. Question Content
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Hindi */}
                                    <div>
                                        <label className="block text-xs text-orange-400 mb-1 font-bold">Hindi (Optional)</label>
                                        <textarea name="question_text_hi" value={formData.question_text_hi} onChange={handleChange}
                                            rows="3" placeholder="Question in Hindi..."
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none focus:border-orange-500" />
                                        <div className="space-y-2 mt-2">
                                            {["a", "b", "c", "d"].map(opt => (
                                                <input key={`hi-${opt}`} type="text" name={`option_${opt}_hi`}
                                                    value={formData[`option_${opt}_hi`]} onChange={handleChange}
                                                    placeholder={`Option ${opt.toUpperCase()} (Hindi)`}
                                                    className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none focus:border-orange-500" />
                                            ))}
                                        </div>
                                    </div>
                                    {/* English */}
                                    <div>
                                        <label className="block text-xs text-blue-400 mb-1 font-bold">English (Required)</label>
                                        <textarea name="question_text_en" value={formData.question_text_en} onChange={handleChange}
                                            rows="3" required placeholder="Question in English..."
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none focus:border-blue-500" />
                                        <div className="space-y-2 mt-2">
                                            {["a", "b", "c", "d"].map(opt => (
                                                <input key={`en-${opt}`} type="text" name={`option_${opt}_en`}
                                                    value={formData[`option_${opt}_en`]} onChange={handleChange}
                                                    required placeholder={`Option ${opt.toUpperCase()} (English)`}
                                                    className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none focus:border-blue-500" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Answer + Explanation */}
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-green-400 mb-1 font-bold">Correct Option</label>
                                        <select name="correct_option" value={formData.correct_option} onChange={handleChange} required
                                            className="w-full bg-[#0F1117] border border-green-500/50 rounded p-2 text-sm outline-none text-green-400 font-bold">
                                            <option value="a">A</option><option value="b">B</option>
                                            <option value="c">C</option><option value="d">D</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 font-bold">Explanation (Hindi)</label>
                                        <textarea name="explanation_hi" value={formData.explanation_hi} onChange={handleChange}
                                            rows="3" placeholder="Explanation in Hindi..."
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1 font-bold">Explanation (English)</label>
                                        <textarea name="explanation_en" value={formData.explanation_en} onChange={handleChange}
                                            rows="3" placeholder="Explanation in English..."
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* 2. EXAM SESSION — 3 dependent dropdowns */}
                            <div className="bg-[#1A1D27] p-4 rounded-lg border border-[#2A2D3A] mb-5">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-[#2A2D3A] pb-2">
                                    2. Exam Session (optional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Exam */}
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Exam</label>
                                        <select value={selectedExamId}
                                            onChange={e => { setSelectedExamId(e.target.value); setSelectedCatId(""); setFormData({ ...formData, exam_session_id: "" }); }}
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none">
                                            <option value="">-- None --</option>
                                            {exams.map(e => <option key={e.id} value={e.id}>{e.icon} {e.name}</option>)}
                                        </select>
                                    </div>
                                    {/* Category */}
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Category</label>
                                        <select value={selectedCatId}
                                            onChange={e => { setSelectedCatId(e.target.value); setFormData({ ...formData, exam_session_id: "" }); }}
                                            disabled={!selectedExamId}
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none disabled:opacity-40">
                                            <option value="">-- None --</option>
                                            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    {/* Session */}
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Session (Year / Date / Shift)</label>
                                        <select name="exam_session_id" value={formData.exam_session_id} onChange={handleChange}
                                            disabled={!selectedCatId}
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none disabled:opacity-40">
                                            <option value="">-- None --</option>
                                            {filteredSessions.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.year}{s.exam_date ? ` — ${new Date(s.exam_date).toLocaleDateString('en-IN')}` : ""}{s.shift ? ` (${s.shift})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 3. SUBJECT HIERARCHY */}
                            <div className="bg-[#1A1D27] p-4 rounded-lg border border-[#2A2D3A] mb-5">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-[#2A2D3A] pb-2">
                                    3. Subject Hierarchy (optional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Subject</label>
                                        <select name="subject_id" value={formData.subject_id}
                                            onChange={e => setFormData({ ...formData, subject_id: e.target.value, topic_id: "", subtopic_id: "" })}
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none">
                                            <option value="">-- None --</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Topic</label>
                                        <select name="topic_id" value={formData.topic_id}
                                            onChange={e => setFormData({ ...formData, topic_id: e.target.value, subtopic_id: "" })}
                                            disabled={!formData.subject_id}
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none disabled:opacity-40">
                                            <option value="">-- None --</option>
                                            {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Subtopic</label>
                                        <select name="subtopic_id" value={formData.subtopic_id} onChange={handleChange}
                                            disabled={!formData.topic_id}
                                            className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none disabled:opacity-40">
                                            <option value="">-- None --</option>
                                            {filteredSubtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 4. META */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Difficulty</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}
                                        className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-500 mb-1">Custom SEO Slug (leave blank = auto)</label>
                                    <input type="text" name="slug" value={formData.slug} onChange={handleChange}
                                        placeholder="e.g. bharat-ka-pratham-pm"
                                        className="w-full bg-[#0F1117] border border-[#2A2D3A] rounded p-2 text-sm outline-none font-mono text-slate-400" />
                                </div>
                            </div>

                            <button type="submit"
                                className={`w-full font-bold py-3 rounded-lg transition text-white ${isEditing ? "bg-blue-600 hover:bg-blue-500" : "bg-orange-600 hover:bg-orange-500"}`}>
                                {isEditing ? "Update Question" : "Save New Question"}
                            </button>
                        </form>
                    </div>

                    {/* ── RIGHT: RECENT QUESTIONS ── */}
                    <div className="bg-[#13161E] border border-[#2A2D3A] rounded-xl p-5 max-h-[90vh] overflow-y-auto sticky top-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-[#2A2D3A] pb-2">
                            Recent Questions ({questions.length})
                        </h2>
                        {loading ? (
                            <div className="text-center text-sm text-slate-500 py-10">Loading...</div>
                        ) : (
                            <div className="space-y-3">
                                {questions.map(q => (
                                    <div key={q.id} className="bg-[#1A1D27] p-3 rounded-lg border border-[#2A2D3A]">
                                        <div className="text-xs text-slate-500 mb-1 flex justify-between flex-wrap gap-1">
                                            <span className="text-blue-400">
                                                {q.exam_sessions?.categories?.exams?.name} {q.exam_sessions?.categories?.name} {q.exam_sessions?.year}
                                            </span>
                                            <span className="text-green-400 font-bold uppercase">{q.correct_option}</span>
                                        </div>
                                        {q.subjects && (
                                            <div className="text-xs text-orange-400 mb-1">
                                                {q.subjects?.name}{q.topics ? ` › ${q.topics.name}` : ""}
                                            </div>
                                        )}
                                        <p className="text-sm text-slate-200 line-clamp-2 mb-3 leading-snug">
                                            {q.question_text_hi || q.question_text_en}
                                        </p>
                                        <div className="flex gap-4 border-t border-[#2A2D3A] pt-2">
                                            <button onClick={() => startEdit(q)} className="text-xs font-bold text-blue-400 hover:text-blue-300">Edit</button>
                                            <button onClick={() => handleDelete(q.id)} className="text-xs font-bold text-red-400 hover:text-red-300">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}