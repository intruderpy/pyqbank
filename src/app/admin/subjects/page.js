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
        <div className="admin-container">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1>📚 Subject Manager</h1>
                    <p>Subjects → Topics → Subtopics hierarchy</p>
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
                        className={`admin-tab ${activeTab === t.id ? `active ${t.color}` : ""}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── SUBJECTS TAB ── */}
            {activeTab === "subjects" && (
                <div className="space-y-4">
                    <form onSubmit={addSubject} className="admin-card">
                        <div className="admin-card-header text-orange" style={{ color: '#fb923c' }}>Add New Subject</div>
                        <div className="admin-grid-cols-4">
                            <div className="col-span-2">
                                <input className="admin-input orange"
                                    placeholder="Subject name (e.g. Mathematics)" value={newSubject.name}
                                    onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />
                            </div>
                            <input className="admin-input"
                                placeholder="Icon emoji (e.g. ➗)" value={newSubject.icon}
                                onChange={e => setNewSubject({ ...newSubject, icon: e.target.value })} />
                            <button className="admin-btn admin-btn-primary">Add Subject</button>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {subjects.map(item => (
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
                                            <button onClick={() => saveEdit("subjects", item.id, { name: editData.name, slug: editData.slug, icon: editData.icon })} className="admin-btn admin-btn-green">Save</button>
                                            <button onClick={cancelEdit} className="admin-btn admin-btn-outline">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-between">
                                        <div>
                                            <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
                                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                            <span className="text-muted" style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>/{item.slug}</span>
                                            <span className="text-muted" style={{ marginLeft: '0.75rem', fontSize: '0.75rem' }}>
                                                {topics.filter(t => t.subject_id === item.id).length} topics
                                            </span>
                                        </div>
                                        <div className="flex-gap-4">
                                            <button onClick={() => startEdit(item)} className="admin-btn" style={{ color: '#60a5fa', padding: 0 }}>Edit</button>
                                            <button onClick={() => handleDelete("subjects", item.id)} className="admin-btn" style={{ color: '#f87171', padding: 0 }}>Delete</button>
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
                    <form onSubmit={addTopic} className="admin-card">
                        <div className="admin-card-header text-blue" style={{ color: '#60a5fa' }}>Add Topic under a Subject</div>
                        <div className="admin-grid-cols-4">
                            <select className="admin-input"
                                value={newTopic.subject_id} onChange={e => setNewTopic({ ...newTopic, subject_id: e.target.value })}>
                                <option value="">-- Select Subject --</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                            </select>
                            <div className="col-span-2">
                                <input className="admin-input blue"
                                    placeholder="Topic name (e.g. Polity, Algebra)" value={newTopic.name}
                                    onChange={e => setNewTopic({ ...newTopic, name: e.target.value })} />
                            </div>
                            <button className="admin-btn admin-btn-blue">Add Topic</button>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {topics.map(item => (
                            <div key={item.id} className="admin-card">
                                {editingId === item.id ? (
                                    <div className="admin-grid-cols-4">
                                        <select className="admin-input"
                                            value={editData.subject_id} onChange={e => setEditData({ ...editData, subject_id: e.target.value })}>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                        <div className="col-span-2">
                                            <input className="admin-input"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                        </div>
                                        <div className="flex-gap-2">
                                            <button onClick={() => saveEdit("topics", item.id, { name: editData.name, slug: editData.slug, subject_id: parseInt(editData.subject_id) })} className="admin-btn admin-btn-green">Save</button>
                                            <button onClick={cancelEdit} className="admin-btn admin-btn-outline">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-between">
                                        <div>
                                            <span className="admin-badge orange">
                                                {item.subjects?.name}
                                            </span>
                                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                            <span className="text-muted" style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>/{item.slug}</span>
                                            <span className="text-muted" style={{ marginLeft: '0.75rem', fontSize: '0.75rem' }}>
                                                {subtopics.filter(s => s.topic_id === item.id).length} subtopics
                                            </span>
                                        </div>
                                        <div className="flex-gap-4">
                                            <button onClick={() => startEdit(item)} className="admin-btn" style={{ color: '#60a5fa', padding: 0 }}>Edit</button>
                                            <button onClick={() => handleDelete("topics", item.id)} className="admin-btn" style={{ color: '#f87171', padding: 0 }}>Delete</button>
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
                    <form onSubmit={addSubtopic} className="admin-card">
                        <div className="admin-card-header text-purple" style={{ color: '#c084fc' }}>Add Subtopic under a Topic</div>
                        <div className="admin-grid-cols-4">
                            <select className="admin-input"
                                value={newSubtopic.topic_id} onChange={e => setNewSubtopic({ ...newSubtopic, topic_id: e.target.value })}>
                                <option value="">-- Select Topic --</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.subjects?.name} › {t.name}</option>)}
                            </select>
                            <div className="col-span-2">
                                <input className="admin-input purple"
                                    placeholder="Subtopic name (e.g. President, LCM-HCF)" value={newSubtopic.name}
                                    onChange={e => setNewSubtopic({ ...newSubtopic, name: e.target.value })} />
                            </div>
                            <button className="admin-btn admin-btn-purple">Add Subtopic</button>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {subtopics.map(item => (
                            <div key={item.id} className="admin-card">
                                {editingId === item.id ? (
                                    <div className="admin-grid-cols-4">
                                        <select className="admin-input"
                                            value={editData.topic_id} onChange={e => setEditData({ ...editData, topic_id: e.target.value })}>
                                            {topics.map(t => <option key={t.id} value={t.id}>{t.subjects?.name} › {t.name}</option>)}
                                        </select>
                                        <div className="col-span-2">
                                            <input className="admin-input"
                                                value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                        </div>
                                        <div className="flex-gap-2">
                                            <button onClick={() => saveEdit("subtopics", item.id, { name: editData.name, slug: editData.slug, topic_id: parseInt(editData.topic_id) })} className="admin-btn admin-btn-green">Save</button>
                                            <button onClick={cancelEdit} className="admin-btn admin-btn-outline">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-between">
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                            <span className="admin-badge blue" style={{ marginRight: '0.25rem' }}>
                                                {item.topics?.subjects?.name}
                                            </span>
                                            <span className="text-muted" style={{ fontSize: '0.75rem', marginRight: '0.25rem' }}>›</span>
                                            <span className="admin-badge orange" style={{ marginRight: '0.5rem' }}>
                                                {item.topics?.name}
                                            </span>
                                            <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                            <span className="text-muted" style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>/{item.slug}</span>
                                        </div>
                                        <div className="flex-gap-4">
                                            <button onClick={() => startEdit(item)} className="admin-btn" style={{ color: '#60a5fa', padding: 0 }}>Edit</button>
                                            <button onClick={() => handleDelete("subtopics", item.id)} className="admin-btn" style={{ color: '#f87171', padding: 0 }}>Delete</button>
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