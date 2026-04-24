"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SubjectManagerPage() {
    const [subjects, setSubjects] = useState([]);
    const [topics, setTopics] = useState([]);
    const [subtopics, setSubtopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("subjects");
    const [notification, setNotification] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const [newSubject, setNewSubject] = useState({ name: "", slug: "", icon: "" });
    const [newTopic, setNewTopic] = useState({ subject_id: "", name: "", slug: "" });
    const [newSubtopic, setNewSubtopic] = useState({ topic_id: "", name: "", slug: "" });

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        const [subRes, topRes, stRes] = await Promise.all([
            supabase.from("subjects").select("*").order("name"),
            supabase.from("topics").select("*, subjects(name)").order("name"),
            supabase.from("subtopics").select("*, topics(name, subjects(name))").order("name"),
        ]);
        if (subRes.data) setSubjects(subRes.data);
        if (topRes.data) setTopics(topRes.data);
        if (stRes.data) setSubtopics(stRes.data);
        setLoading(false);
    };

    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 4000);
    };

    const makeSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // ── ADD HANDLERS ──────────────────────────────────────────

    const addSubject = async (e) => {
        e.preventDefault();
        if (!newSubject.name.trim()) return notify("error", "Subject name required");
        const payload = { name: newSubject.name.trim(), slug: newSubject.slug || makeSlug(newSubject.name), icon: newSubject.icon || null };
        const { data, error } = await supabase.from("subjects").insert([payload]).select();
        if (error) return notify("error", error.message);
        setSubjects([...subjects, data[0]]);
        setNewSubject({ name: "", slug: "", icon: "" });
        notify("success", "Subject added!");
    };

    const addTopic = async (e) => {
        e.preventDefault();
        if (!newTopic.subject_id) return notify("error", "Select a subject");
        if (!newTopic.name.trim()) return notify("error", "Topic name required");
        const payload = { subject_id: parseInt(newTopic.subject_id), name: newTopic.name.trim(), slug: newTopic.slug || makeSlug(newTopic.name) };
        const { data, error } = await supabase.from("topics").insert([payload]).select("*, subjects(name)");
        if (error) return notify("error", error.message);
        setTopics([...topics, data[0]]);
        setNewTopic({ ...newTopic, name: "", slug: "" });
        notify("success", "Topic added!");
    };

    const addSubtopic = async (e) => {
        e.preventDefault();
        if (!newSubtopic.topic_id) return notify("error", "Select a topic");
        if (!newSubtopic.name.trim()) return notify("error", "Subtopic name required");
        const payload = { topic_id: parseInt(newSubtopic.topic_id), name: newSubtopic.name.trim(), slug: newSubtopic.slug || makeSlug(newSubtopic.name) };
        const { data, error } = await supabase.from("subtopics").insert([payload]).select("*, topics(name, subjects(name))");
        if (error) return notify("error", error.message);
        setSubtopics([...subtopics, data[0]]);
        setNewSubtopic({ ...newSubtopic, name: "", slug: "" });
        notify("success", "Subtopic added!");
    };

    // ── EDIT & DELETE ─────────────────────────────────────────

    const startEdit = (item) => { setEditingId(item.id); setEditData({ ...item }); };
    const cancelEdit = () => { setEditingId(null); setEditData({}); };

    const saveEdit = async (table, id, payload, setter, list) => {
        const finalPayload = { ...payload, slug: payload.slug || makeSlug(payload.name) };
        const { error } = await supabase.from(table).update(finalPayload).eq("id", id);
        if (error) return notify("error", error.message);
        await fetchAll();
        cancelEdit();
        notify("success", "Updated!");
    };

    const handleDelete = async (table, id) => {
        if (!window.confirm("Delete? Child items (topics/subtopics/questions links) may be affected.")) return;
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) return notify("error", error.message);
        await fetchAll();
        notify("success", "Deleted!");
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;

    const tabs = [
        { id: "subjects", label: `Subjects (${subjects.length})`, color: "orange" },
        { id: "topics", label: `Topics (${topics.length})`, color: "blue" },
        { id: "subtopics", label: `Subtopics (${subtopics.length})`, color: "purple" },
    ];

    const tabColors = { orange: "border-orange-500 text-orange-400", blue: "border-blue-500 text-blue-400", purple: "border-purple-500 text-purple-400" };
    const activeColor = tabs.find(t => t.id === activeTab)?.color;

    return (
        <div className="min-h-screen bg-[#0F1117] text-slate-200 p-4 md:p-6 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-[#2A2D3A] pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">📚 Subject Manager</h1>
                        <p className="text-sm text-slate-400 mt-1">Subjects → Topics → Subtopics hierarchy</p>
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
                <div className="flex gap-2 mb-6 border-b border-[#2A2D3A]">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => { setActiveTab(t.id); cancelEdit(); }}
                            className={`px-5 py-2 text-sm font-bold transition-colors border-b-2 ${activeTab === t.id ? tabColors[t.color] : "border-transparent text-slate-400 hover:text-white"
                                }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ── SUBJECTS TAB ── */}
                {activeTab === "subjects" && (
                    <div className="space-y-4">
                        <form onSubmit={addSubject} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                            <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">Add New Subject</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none focus:border-orange-500"
                                    placeholder="Subject name (e.g. Mathematics)" value={newSubject.name}
                                    onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />
                                <input className="bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none"
                                    placeholder="Icon emoji (e.g. ➗)" value={newSubject.icon}
                                    onChange={e => setNewSubject({ ...newSubject, icon: e.target.value })} />
                                <button className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded font-bold text-sm transition">Add Subject</button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            {subjects.map(item => (
                                <div key={item.id} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                                    {editingId === item.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                            <input className="bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.icon || ""} placeholder="Icon"
                                                onChange={e => setEditData({ ...editData, icon: e.target.value })} />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveEdit("subjects", item.id, { name: editData.name, slug: editData.slug, icon: editData.icon })} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                                                <button onClick={cancelEdit} className="text-slate-400 px-3 py-1 text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="mr-2">{item.icon}</span>
                                                <span className="font-bold text-slate-200">{item.name}</span>
                                                <span className="ml-2 text-xs text-slate-500 font-mono">/{item.slug}</span>
                                                <span className="ml-3 text-xs text-slate-600">
                                                    {topics.filter(t => t.subject_id === item.id).length} topics
                                                </span>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => startEdit(item)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                                                <button onClick={() => handleDelete("subjects", item.id)} className="text-red-400 text-sm hover:text-red-300">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── TOPICS TAB ── */}
                {activeTab === "topics" && (
                    <div className="space-y-4">
                        <form onSubmit={addTopic} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Add Topic under a Subject</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <select className="bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none text-slate-200"
                                    value={newTopic.subject_id} onChange={e => setNewTopic({ ...newTopic, subject_id: e.target.value })}>
                                    <option value="">-- Select Subject --</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                                </select>
                                <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    placeholder="Topic name (e.g. Polity, Algebra)" value={newTopic.name}
                                    onChange={e => setNewTopic({ ...newTopic, name: e.target.value })} />
                                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm transition">Add Topic</button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            {topics.map(item => (
                                <div key={item.id} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                                    {editingId === item.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <select className="bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none text-slate-200"
                                                value={editData.subject_id} onChange={e => setEditData({ ...editData, subject_id: e.target.value })}>
                                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveEdit("topics", item.id, { name: editData.name, slug: editData.slug, subject_id: parseInt(editData.subject_id) })} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                                                <button onClick={cancelEdit} className="text-slate-400 px-3 py-1 text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-orange-400 text-xs font-bold px-2 py-0.5 bg-orange-500/10 rounded mr-2">
                                                    {item.subjects?.name}
                                                </span>
                                                <span className="font-bold text-slate-200">{item.name}</span>
                                                <span className="ml-2 text-xs text-slate-500 font-mono">/{item.slug}</span>
                                                <span className="ml-3 text-xs text-slate-600">
                                                    {subtopics.filter(s => s.topic_id === item.id).length} subtopics
                                                </span>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => startEdit(item)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                                                <button onClick={() => handleDelete("topics", item.id)} className="text-red-400 text-sm hover:text-red-300">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SUBTOPICS TAB ── */}
                {activeTab === "subtopics" && (
                    <div className="space-y-4">
                        <form onSubmit={addSubtopic} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Add Subtopic under a Topic</div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <select className="bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none text-slate-200"
                                    value={newSubtopic.topic_id} onChange={e => setNewSubtopic({ ...newSubtopic, topic_id: e.target.value })}>
                                    <option value="">-- Select Topic --</option>
                                    {topics.map(t => <option key={t.id} value={t.id}>{t.subjects?.name} › {t.name}</option>)}
                                </select>
                                <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-3 py-2 text-sm outline-none focus:border-purple-500"
                                    placeholder="Subtopic name (e.g. President, LCM-HCF)" value={newSubtopic.name}
                                    onChange={e => setNewSubtopic({ ...newSubtopic, name: e.target.value })} />
                                <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded font-bold text-sm transition">Add Subtopic</button>
                            </div>
                        </form>

                        <div className="space-y-2">
                            {subtopics.map(item => (
                                <div key={item.id} className="bg-[#1A1D27] p-4 rounded-xl border border-[#2A2D3A]">
                                    {editingId === item.id ? (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                            <select className="bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none text-slate-200"
                                                value={editData.topic_id} onChange={e => setEditData({ ...editData, topic_id: e.target.value })}>
                                                {topics.map(t => <option key={t.id} value={t.id}>{t.subjects?.name} › {t.name}</option>)}
                                            </select>
                                            <input className="col-span-2 bg-[#0F1117] border border-[#2A2D3A] rounded px-2 py-1 text-sm outline-none"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveEdit("subtopics", item.id, { name: editData.name, slug: editData.slug, topic_id: parseInt(editData.topic_id) })} className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">Save</button>
                                                <button onClick={cancelEdit} className="text-slate-400 px-3 py-1 text-sm">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-blue-400 text-xs font-bold px-2 py-0.5 bg-blue-500/10 rounded mr-1">
                                                    {item.topics?.subjects?.name}
                                                </span>
                                                <span className="text-slate-500 text-xs mr-1">›</span>
                                                <span className="text-orange-400 text-xs font-bold px-2 py-0.5 bg-orange-500/10 rounded mr-2">
                                                    {item.topics?.name}
                                                </span>
                                                <span className="font-bold text-slate-200">{item.name}</span>
                                                <span className="ml-2 text-xs text-slate-500 font-mono">/{item.slug}</span>
                                            </div>
                                            <div className="flex gap-4">
                                                <button onClick={() => startEdit(item)} className="text-blue-400 text-sm hover:text-blue-300">Edit</button>
                                                <button onClick={() => handleDelete("subtopics", item.id)} className="text-red-400 text-sm hover:text-red-300">Delete</button>
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