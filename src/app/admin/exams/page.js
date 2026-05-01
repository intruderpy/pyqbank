"use client";
import { useState, useEffect, useCallback } from "react";
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

    const fetchAll = useCallback(async () => {
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
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);



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
        const res = await fetch('/api/admin/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'insert', table: 'exams', payload: [payload] })
        });
        const { data, error } = await res.json();
        if (error) return notify("error", error);
        setExams([...exams, data[0]]);
        setNewExam({ name: "", slug: "", icon: "", description: "" });
        notify("success", "Exam added!");
    };

    const addCategory = async (e) => {
        e.preventDefault();
        if (!newCat.exam_id) return notify("error", "Select an exam");
        if (!newCat.name.trim()) return notify("error", "Category name required");
        const payload = { exam_id: newCat.exam_id, name: newCat.name.trim(), slug: newCat.slug || slug(newCat.name) };
        const res = await fetch('/api/admin/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'insert', table: 'categories', payload: [payload], select: '*, exams(name)' })
        });
        const { data, error } = await res.json();
        if (error) return notify("error", error);
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
        const res = await fetch('/api/admin/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'insert', table: 'exam_sessions', payload: [payload], select: '*, categories(name, exams(name))' })
        });
        const { data, error } = await res.json();
        if (error) return notify("error", error);
        setSessions([data[0], ...sessions]);
        setNewSession({ category_id: newSession.category_id, year: new Date().getFullYear(), exam_date: "", shift: "" });
        notify("success", "Session added!");
    };

    // ── EDIT & DELETE ─────────────────────────────────────────

    const startEdit = (item) => { setEditingId(item.id); setEditData({ ...item }); };
    const cancelEdit = () => { setEditingId(null); setEditData({}); };

    const saveExamEdit = async (id) => {
        const payload = {
            name: editData.name, slug: editData.slug || slug(editData.name),
            icon: editData.icon, description: editData.description
        };
        const res = await fetch('/api/admin/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', table: 'exams', payload, match: { id } })
        });
        const { error } = await res.json();
        if (error) return notify("error", error);
        setExams(exams.map(e => e.id === id ? { ...e, ...editData } : e));
        cancelEdit(); notify("success", "Updated!");
    };

    const saveCatEdit = async (id) => {
        const payload = {
            name: editData.name, slug: editData.slug || slug(editData.name), exam_id: parseInt(editData.exam_id)
        };
        const res = await fetch('/api/admin/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', table: 'categories', payload, match: { id } })
        });
        const { error } = await res.json();
        if (error) return notify("error", error);
        await fetchAll();
        cancelEdit(); notify("success", "Updated!");
    };

    const saveSessionEdit = async (id) => {
        const payload = {
            year: parseInt(editData.year),
            exam_date: editData.exam_date || null,
            shift: editData.shift || null,
            category_id: parseInt(editData.category_id)
        };
        const res = await fetch('/api/admin/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', table: 'exam_sessions', payload, match: { id } })
        });
        const { error } = await res.json();
        if (error) return notify("error", error);
        await fetchAll();
        cancelEdit(); notify("success", "Updated!");
    };

    const handleDelete = async (table, id, setter, list) => {
        if (!window.confirm("Delete? Related questions may be affected.")) return;
        const res = await fetch('/api/admin/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', table, match: { id } })
        });
        const { error } = await res.json();
        if (error) return notify("error", error);
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
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1>🏛️ Exam Manager</h1>
                    <p>Exams → Categories → Sessions (Year / Date / Shift)</p>
                </div>
                <Link href="/admin" className="admin-btn admin-btn-outline">
                    ← Dashboard
                </Link>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`admin-alert ${notification.type}`}>
                    {notification.type === "error" ? "⚠️ " : "✅ "}{notification.msg}
                </div>
            )}

            {/* Tabs */}
            <div className="admin-tabs">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => { setActiveTab(t.id); cancelEdit(); }}
                        className={`admin-tab ${activeTab === t.id ? "active blue" : ""}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── EXAMS TAB ── */}
            {activeTab === "exams" && (
                <div className="space-y-4">
                    <form onSubmit={addExam} className="admin-card">
                        <div className="admin-card-header">Add New Exam</div>
                        <div className="admin-grid-cols-4">
                            <div className="col-span-2">
                                <input className="admin-input blue"
                                    placeholder="Exam Name (e.g. SSC)" value={newExam.name}
                                    onChange={e => setNewExam({ ...newExam, name: e.target.value })} />
                            </div>
                            <input className="admin-input blue"
                                placeholder="Icon emoji (e.g. 🏛️)" value={newExam.icon}
                                onChange={e => setNewExam({ ...newExam, icon: e.target.value })} />
                            <button className="admin-btn admin-btn-blue">Add Exam</button>
                        </div>
                        <input className="admin-input mt-4"
                            placeholder="Description (optional)" value={newExam.description}
                            onChange={e => setNewExam({ ...newExam, description: e.target.value })} />
                    </form>

                    <div className="space-y-2">
                        {exams.map(item => (
                            <div key={item.id} className="admin-card">
                                {editingId === item.id ? (
                                    <div className="admin-grid-cols-4">
                                        <div className="col-span-2">
                                            <input className="admin-input"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                        </div>
                                        <input className="admin-input"
                                            value={editData.icon || ""} placeholder="Icon"
                                            onChange={e => setEditData({ ...editData, icon: e.target.value })} />
                                        <div className="flex-gap-2">
                                            <button onClick={() => saveExamEdit(item.id)} className="admin-btn admin-btn-green">Save</button>
                                            <button onClick={cancelEdit} className="admin-btn admin-btn-outline">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-between">
                                        <div>
                                            <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                            <span className="text-muted" style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>/{item.slug}</span>
                                            {item.description && <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{item.description}</p>}
                                        </div>
                                        <div className="flex-gap-4">
                                            <button onClick={() => startEdit(item)} className="admin-btn" style={{ color: '#60a5fa', padding: 0 }}>Edit</button>
                                            <button onClick={() => handleDelete("exams", item.id, setExams, exams)} className="admin-btn" style={{ color: '#f87171', padding: 0 }}>Delete</button>
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
                    <form onSubmit={addCategory} className="admin-card">
                        <div className="admin-card-header text-green" style={{ color: '#4ade80' }}>Add Category (e.g. CGL under SSC)</div>
                        <div className="admin-grid-cols-4">
                            <select className="admin-input"
                                value={newCat.exam_id} onChange={e => setNewCat({ ...newCat, exam_id: e.target.value })}>
                                <option value="">-- Select Exam --</option>
                                {exams.map(e => <option key={e.id} value={e.id}>{e.icon} {e.name}</option>)}
                            </select>
                            <div className="col-span-2">
                                <input className="admin-input green"
                                    placeholder="Category name (e.g. CGL, NTPC)" value={newCat.name}
                                    onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
                            </div>
                            <button className="admin-btn admin-btn-green">Add</button>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {categories.map(item => (
                            <div key={item.id} className="admin-card">
                                {editingId === item.id ? (
                                    <div className="admin-grid-cols-4">
                                        <select className="admin-input"
                                            value={editData.exam_id} onChange={e => setEditData({ ...editData, exam_id: e.target.value })}>
                                            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                        </select>
                                        <div className="col-span-2">
                                            <input className="admin-input"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                        </div>
                                        <div className="flex-gap-2">
                                            <button onClick={() => saveCatEdit(item.id)} className="admin-btn admin-btn-green">Save</button>
                                            <button onClick={cancelEdit} className="admin-btn admin-btn-outline">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-between">
                                        <div>
                                            <span className="admin-badge blue">{item.exams?.name}</span>
                                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                            <span className="text-muted" style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>/{item.slug}</span>
                                        </div>
                                        <div className="flex-gap-4">
                                            <button onClick={() => startEdit(item)} className="admin-btn" style={{ color: '#60a5fa', padding: 0 }}>Edit</button>
                                            <button onClick={() => handleDelete("categories", item.id, setCategories, categories)} className="admin-btn" style={{ color: '#f87171', padding: 0 }}>Delete</button>
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
                    <form onSubmit={addSession} className="admin-card">
                        <div className="admin-card-header text-orange" style={{ color: '#fb923c' }}>Add Exam Session (Year + Date + Shift)</div>
                        <div className="admin-grid-cols-4">
                            <div className="col-span-2">
                                <select className="admin-input"
                                    value={newSession.category_id} onChange={e => setNewSession({ ...newSession, category_id: e.target.value })}>
                                    <option value="">-- Select Category --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.exams?.name} — {c.name}</option>)}
                                </select>
                            </div>
                            <input type="number" className="admin-input"
                                placeholder="Year" value={newSession.year}
                                onChange={e => setNewSession({ ...newSession, year: e.target.value })} />
                            <select className="admin-input"
                                value={newSession.shift} onChange={e => setNewSession({ ...newSession, shift: e.target.value })}>
                                <option value="">-- Shift (optional) --</option>
                                <option value="Morning">Morning</option>
                                <option value="Afternoon">Afternoon</option>
                                <option value="Evening">Evening</option>
                            </select>
                            <div className="col-span-2">
                                <input type="date" className="admin-input"
                                    value={newSession.exam_date} onChange={e => setNewSession({ ...newSession, exam_date: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <button className="admin-btn admin-btn-primary" style={{ width: '100%' }}>Add Session</button>
                            </div>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {sessions.map(item => (
                            <div key={item.id} className="admin-card">
                                {editingId === item.id ? (
                                    <div className="admin-grid-cols-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                                        <div className="col-span-2">
                                            <select className="admin-input"
                                                value={editData.category_id} onChange={e => setEditData({ ...editData, category_id: e.target.value })}>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.exams?.name} — {c.name}</option>)}
                                            </select>
                                        </div>
                                        <input type="number" className="admin-input"
                                            value={editData.year} onChange={e => setEditData({ ...editData, year: e.target.value })} />
                                        <input type="date" className="admin-input"
                                            value={editData.exam_date || ""} onChange={e => setEditData({ ...editData, exam_date: e.target.value })} />
                                        <div className="flex-gap-2">
                                            <button onClick={() => saveSessionEdit(item.id)} className="admin-btn admin-btn-green" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                                            <button onClick={cancelEdit} className="admin-btn admin-btn-outline" style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-between flex-wrap" style={{ gap: '0.5rem' }}>
                                        <div className="flex-gap-2 flex-wrap" style={{ alignItems: 'center' }}>
                                            <span className="admin-badge blue">
                                                {item.categories?.exams?.name} — {item.categories?.name}
                                            </span>
                                            <span className="text-orange" style={{ fontWeight: 'bold' }}>{item.year}</span>
                                            {item.exam_date && <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(item.exam_date).toLocaleDateString('en-IN')}</span>}
                                            {item.shift && <span className="admin-badge green">{item.shift}</span>}
                                        </div>
                                        <div className="flex-gap-4">
                                            <button onClick={() => startEdit(item)} className="admin-btn" style={{ color: '#60a5fa', padding: 0 }}>Edit</button>
                                            <button onClick={() => handleDelete("exam_sessions", item.id, setSessions, sessions)} className="admin-btn" style={{ color: '#f87171', padding: 0 }}>Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}