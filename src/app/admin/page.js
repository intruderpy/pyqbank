import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export const metadata = { title: 'Admin Dashboard | PYQBank' }

export default async function AdminDashboard() {
    const { count: qCount } = await supabase.from('questions').select('*', { count: 'exact', head: true })
    const { count: eCount } = await supabase.from('exams').select('*', { count: 'exact', head: true })
    const { count: sCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true })

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
            <div className="max-w-5xl mx-auto mt-8">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold text-white">⚙️ Admin Dashboard</h1>
                    <Link href="/" className="text-slate-400 hover:text-white border border-slate-700 px-4 py-2 rounded-lg">
                        ← View Website
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <div className="text-slate-400 mb-1 text-sm">Total Questions</div>
                        <div className="text-4xl font-bold text-orange-500">{qCount || 0}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <div className="text-slate-400 mb-1 text-sm">Total Exams</div>
                        <div className="text-4xl font-bold text-blue-500">{eCount || 0}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <div className="text-slate-400 mb-1 text-sm">Total Subjects</div>
                        <div className="text-4xl font-bold text-purple-500">{sCount || 0}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                        <div className="text-slate-400 mb-1 text-sm">Database Status</div>
                        <div className="text-2xl font-bold text-green-500 mt-2">Connected 🟢</div>
                    </div>
                </div>

                {/* Modules */}
                <h2 className="text-xl font-bold mb-6 border-b border-slate-800 pb-3">Manage Platform</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-orange-500/50 transition duration-300">
                        <h3 className="text-xl font-bold text-white mb-2">📝 Questions</h3>
                        <p className="text-sm text-slate-400 mb-6">Add, edit or delete bilingual PYQs for any exam session or subject.</p>
                        <Link href="/admin/add" className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold w-full text-center transition">
                            ➕ Manage Questions
                        </Link>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-blue-500/50 transition duration-300">
                        <h3 className="text-xl font-bold text-white mb-2">🏛️ Exams</h3>
                        <p className="text-sm text-slate-400 mb-6">Manage Exams → Categories → Sessions (Year, Date, Shift).</p>
                        <Link href="/admin/exams" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold w-full text-center transition">
                            ⚙️ Manage Exams
                        </Link>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition duration-300">
                        <h3 className="text-xl font-bold text-white mb-2">📚 Subjects</h3>
                        <p className="text-sm text-slate-400 mb-6">Manage Subjects → Topics → Subtopics hierarchy.</p>
                        <Link href="/admin/subjects" className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold w-full text-center transition">
                            ⚙️ Manage Subjects
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}