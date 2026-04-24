import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = { title: 'Admin Dashboard | PYQBank' }

export default async function AdminDashboard() {
    const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true })
    const { count: eCount } = await supabase.from('exams').select('*', { count: 'exact', head: true })
    const { count: sCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true })

    return (
        <div className="admin-container">
            <div className="admin-header">
                <div>
                    <h1>⚙️ Admin Dashboard</h1>
                    <p>Database Connected 🟢</p>
                </div>
                <Link href="/" className="admin-btn admin-btn-outline">
                    ← View Website
                </Link>
            </div>

            {/* Stats */}
            <div className="admin-grid-cols-4 mb-4">
                <div className="admin-card">
                    <div className="admin-label">Total Questions</div>
                    <div className="text-orange" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{qCount || 0}</div>
                </div>
                <div className="admin-card">
                    <div className="admin-label">Total Exams</div>
                    <div className="text-blue" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{eCount || 0}</div>
                </div>
                <div className="admin-card">
                    <div className="admin-label">Total Subjects</div>
                    <div className="text-purple" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sCount || 0}</div>
                </div>
            </div>

            {/* Modules */}
            <div className="admin-card-header mt-4">Manage Platform</div>
            <div className="admin-grid-cols-3">
                <div className="admin-card">
                    <h3 className="text-white mb-4" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📝 Questions</h3>
                    <p className="text-muted mb-4">Add, edit or delete bilingual PYQs for any exam session or subject.</p>
                    <Link href="/admin/add" className="admin-btn admin-btn-primary admin-btn-lg">
                        ➕ Manage Questions
                    </Link>
                </div>
                <div className="admin-card">
                    <h3 className="text-white mb-4" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>🏛️ Exams</h3>
                    <p className="text-muted mb-4">Manage Exams → Categories → Sessions (Year, Date, Shift).</p>
                    <Link href="/admin/exams" className="admin-btn admin-btn-blue admin-btn-lg">
                        ⚙️ Manage Exams
                    </Link>
                </div>
                <div className="admin-card">
                    <h3 className="text-white mb-4" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>📚 Subjects</h3>
                    <p className="text-muted mb-4">Manage Subjects → Topics → Subtopics hierarchy.</p>
                    <Link href="/admin/subjects" className="admin-btn admin-btn-purple admin-btn-lg">
                        ⚙️ Manage Subjects
                    </Link>
                </div>
            </div>
        </div>
    )
}