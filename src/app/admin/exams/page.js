"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ExamManagerPage() {
    const [exams, setExams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("exams");
    const [notification, setNotification] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    // Add form states
    const [newExam, setNewExam] = useState({ name: "", slug: "", icon: "", description: "" });
    const [newCat, setNewCat] = useState({ exam_id: "", name: "", slug: "" });
    const [newSession, setNewSession] = useState({ category_id: "", year: new Date().getFullYear(), exam_date: "", shift: "" });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        const [exRes, catRes, sesRes] = await Promise.all([
            supabase.from("exams").select("*").order("name"),
            supabase.from("categories").select("*, exams(name)").order("name"),
            supabase.from("exam_sessions").select("*, categories(name, exams(name))").order("year", { ascending: false }),
        ]);
        if (exRes.data) setExams(exRes.data);
        if (catRes.data) setCategories(catRes.data);
        if (sesRes.data) setSessions(sesRes.data);
        setLoading(false);
    };

    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 4000);
    };

    const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // ── ADD HANDLERS ──────────────────────────────────────────

    const addExam = async (e) => {
        e.preventDefault();
        if (!newExam.name.trim()) return notify("error", "Exam name required");
        const payload = { ...newExam, name: newExam.name.trim(), slug: newExam.slug || slug(newExam.name) };
        const { data, error } = await supabase.from("exams").insert([payload]).select();
        if (error) return notify("error", error.message);
        setExams([...exams, data[0]]);
        setNewExam({ name: "", slug: "", icon: "", description: "" });
        notify("success", "Exam added!");
    };

    const addCategory = async (e) => {
        e.preventDefault();
        if (!newCat.exam_id) return notify("error", "Select an exam");
        if (!newCat.name.trim()) return notify("error", "Category name required");
        const payload = { exam_id: newCat.exam_id, name: newCat.name.trim(), slug: newCat.slug || slug(newCat.name) };
        const { data, error } = await supabase.from("categories").insert([payload]).select("*, exams(name)");
        if (error) return notify("error", error.message);
        setCategories([...categories, data[0]]);
        setNewCat({ exam_id: newCat.exam_id, name: "", slug: "" });
        notify("success", "Category added!");
    };

    const addSession = async (e) => {
        e.preventDefault();
        if (!newSession.category_id) return notify("error", "Select a category");
        if (!newSession.year) return notify("error", "Year required");
        const payload = {
            category_id: parseInt(newSession.category_id),
            year: parseInt(newSession.year),
            exam_date: newSession.exam_date || null,
            shift: newSession.shift || null,
        };
        const { data, error } = await supabase.from("exam_sessions").insert([payload]).select("*, categories(name, exams(name))");
        if (error) return notify("error", error.message);
        setSessions([data[0], ...sessions]);
        setNewSession({ category_id: newSession.category_id, year: new Date().getFullYear(), exam_date: "", shift: "" });
        notify("success", "Session added!");
    };

    // ── EDIT & DELETE ─────────────────────────────────────────

    const startEdit = (item) => { setEditingId(item.id); setEditData({ ...item }); };
    const cancelEdit = () => { setEditingId(null); setEditData({}); };

    const saveExamEdit = async (id) => {
        const { error } = await supabase.from("exams").update({
            name: editData.name, slug: editData.slug || slug(editData.name),
            icon: editData.icon, description: editData.description
        }).eq("id", id);
        if (error) return notify("error", error.message);
        setExams(exams.map(e => e.id === id ? { ...e, ...editData } : e));
        cancelEdit(); notify("success", "Updated!");
    };

    const saveCatEdit = async (id) => {
        const { error } = await supabase.from("categories").update({
            name: editData.name, slug: editData.slug || slug(editData.name), exam_id: parseInt(editData.exam_id)
        }).eq("id", id);
        if (error) return notify("error", error.message);
        await fetchAll();
        cancelEdit(); notify("success", "Updated!");
    };

    const saveSessionEdit = async (id) => {
        const { error } = await supabase.from("exam_sessions").update({
            year: parseInt(editData.year),
            exam_date: editData.exam_date || null,
            shift: editData.shift || null,
            category_id: parseInt(editData.category_id)
        }).eq("id", id);
        if (error) return notify("error", error.message);
        await fetchAll();
        cancelEdit(); notify("success", "Updated!");
    };

    const handleDelete = async (table, id, setter, list) => {
        if (!window.confirm("Delete? Related questions may be affected.")) return;
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) return notify("error", error.message);
        setter(list.filter(i => i.id !== id));
        notify("success", "Deleted!");
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;

    const tabs = [
        { id: "exams", label: `Main Exams (${exams.length})` },
        { id: "categories", label: `Categories (${categories.length})` },
        { id: "sessions", label: `Exam Sessions (${sessions.length})` },
    ];

    return (
        <div className="min-h-screen bg-[#0F1117] text-slate-200 p-4 md:p-6 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-[#2A2D3A] pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">🏛️ Exam Manager</h1>
                        <p className="text-sm text-slate-400 mt-1">Exams → Categories → Sessions (Year / Date / Shift)</p>
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

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-[#2A2D3A] pb-0">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => { setActiveTab(t.id); cancelEdit(); }}
                            className={`px-5 py-2 text-sm font-bold transition-colors border-b-2 ${activeTab === t.id ? "border-blue-500 text-blue-400" : "border-transparent text-slate-400 hover:text-white"
                                }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── EXAMS TAB ── */}
                {activeTab === "exams" && (
                    <div className="space-y-4">
                        <form onSubmit={addExam} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Add New Exam</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    placeholder="Exam Name (e.g. SSC)" value={newExam.name}
                                    onChange={e => setNewExam({ ...newExam, name: e.target.value })} />
                                <input className="bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    placeholder="Icon emoji (e.g. 🏛️)" value={newExam.icon}
                                    onChange={e => setNewExam({ ...newExam, icon: e.target.value })} />
                                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm transition">Add Exam</button>
                            </div>
                            <input className="mt-2 w-full bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none"
                                placeholder="Description (optional)" value={newExam.description}
                                onChange={e => setNewExam({ ...newExam, description: e.target.value })} />
                        </form>

                        <div className="space-y-2">
                            {exams.map(item => (
                                <div key={item.id} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                                    {editingId === item.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                            <input className="bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.icon || ""} placeholder="Icon"
                                                onChange={e => setEditData({ ...editData, icon: e.target.value })} />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveExamEdit(item.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                                                <button onClick={cancelEdit} className="text-slate-400 px-3 py-1 text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="mr-2">{item.icon}</span>
                                                <span className="font-bold text-slate-200">{item.name}</span>
                                                <span className="ml-2 text-xs text-slate-500 font-mono">/{item.slug}</span>
                                                {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => startEdit(item)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                                                <button onClick={() => handleDelete("exams", item.id, setExams, exams)} className="text-red-400 text-sm hover:text-red-300">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CATEGORIES TAB ── */}
                {activeTab === "categories" && (
                    <div className="space-y-4">
                        <form onSubmit={addCategory} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                            <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">Add Category (e.g. CGL under SSC)</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <select className="bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none text-slate-200"
                                    value={newCat.exam_id} onChange={e => setNewCat({ ...newCat, exam_id: e.target.value })}>
                                    <option value="">-- Select Exam --</option>
                                    {exams.map(e => <option key={e.id} value={e.id}>{e.icon} {e.name}</option>)}
                                </select>
                                <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none focus:border-green-500"
                                    placeholder="Category name (e.g. CGL, NTPC)" value={newCat.name}
                                    onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
                                <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold text-sm transition">Add</button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            {categories.map(item => (
                                <div key={item.id} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                                    {editingId === item.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <select className="bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none text-slate-200"
                                                value={editData.exam_id} onChange={e => setEditData({ ...editData, exam_id: e.target.value })}>
                                                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                            </select>
                                            <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveCatEdit(item.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                                                <button onClick={cancelEdit} className="text-slate-400 px-3 py-1 text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-blue-400 text-xs font-bold px-2 py-0.5 bg-blue-500/10 rounded mr-2">
                                                    {item.exams?.name}
                                                </span>
                                                <span className="font-bold text-slate-200">{item.name}</span>
                                                <span className="ml-2 text-xs text-slate-500 font-mono">/{item.slug}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => startEdit(item)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                                                <button onClick={() => handleDelete("categories", item.id, setCategories, categories)} className="text-red-400 text-sm hover:text-red-300">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SESSIONS TAB ── */}
                {activeTab === "sessions" && (
                    <div className="space-y-4">
                        <form onSubmit={addSession} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Add Exam Session (Year + Date + Shift)</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <select className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none text-slate-200"
                                    value={newSession.category_id} onChange={e => setNewSession({ ...newSession, category_id: e.target.value })}>
                                    <option value="">-- Select Category --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.exams?.name} — {c.name}</option>)}
                                </select>
                                <input type="number" className="bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none"
                                    placeholder="Year" value={newSession.year}
                                    onChange={e => setNewSession({ ...newSession, year: e.target.value })} />
                                <select className="bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none text-slate-200"
                                    value={newSession.shift} onChange={e => setNewSession({ ...newSession, shift: e.target.value })}>
                                    <option value="">-- Shift (optional) --</option>
                                    <option value="Morning">Morning</option>
                                    <option value="Afternoon">Afternoon</option>
                                    <option value="Evening">Evening</option>
                                </select>
                                <input type="date" className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none"
                                    value={newSession.exam_date} onChange={e => setNewSession({ ...newSession, exam_date: e.target.value })} />
                                <button className="col-span-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-bold text-sm transition">Add Session</button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            {sessions.map(item => (
                                <div key={item.id} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                                    {editingId === item.id ? (
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            <select className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none text-slate-200"
                                                value={editData.category_id} onChange={e => setEditData({ ...editData, category_id: e.target.value })}>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.exams?.name} — {c.name}</option>)}
                                            </select>
                                            <input type="number" className="bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.year} onChange={e => setEditData({ ...editData, year: e.target.value })} />
                                            <input type="date" className="bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.exam_date || ""} onChange={e => setEditData({ ...editData, exam_date: e.target.value })} />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveSessionEdit(item.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                                                <button onClick={cancelEdit} className="text-slate-400 px-3 py-1 text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-blue-400 text-xs font-bold px-2 py-0.5 bg-blue-500/10 rounded">
                                                    {item.categories?.exams?.name} — {item.categories?.name}
                                                </span>
                                                <span className="text-orange-400 font-bold">{item.year}</span>
                                                {item.exam_date && <span className="text-slate-400 text-xs">{new Date(item.exam_date).toLocaleDateString('en-IN')}</span>}
                                                {item.shift && <span className="text-green-400 text-xs px-2 py-0.5 bg-green-500/10 rounded">{item.shift}</span>}
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => startEdit(item)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                                                <button onClick={() => handleDelete("exam_sessions", item.id, setSessions, sessions)} className="text-red-400 text-sm hover:text-red-300">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}