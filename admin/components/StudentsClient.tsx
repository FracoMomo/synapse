'use client'

import { useState } from 'react'
import { Users, GraduationCap } from 'lucide-react'

interface Student {
  id: string
  full_name: string | null
  course: string | null
  year_level: string | null
  created_at: string | null
  email: string | null
  university_name: string | null
  domain: string | null
}

interface University {
  university_name: string
  domain: string
}

export default function StudentsClient({
  students,
  universities,
}: {
  students: Student[]
  universities: University[]
}) {
  const [activeUni, setActiveUni] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = students.filter(s => {
    const matchesUni = activeUni === null || s.university_name === activeUni
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.course?.toLowerCase().includes(q)
    return matchesUni && matchesSearch
  })

  return (
    <>
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <button
          onClick={() => setActiveUni(null)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
            activeUni === null
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
          }`}
        >
          All Schools
        </button>
        {universities.map(u => (
          <button
            key={u.university_name}
            onClick={() => setActiveUni(activeUni === u.university_name ? null : u.university_name)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${
              activeUni === u.university_name
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
            }`}
          >
            {u.university_name}
          </button>
        ))}
      </div>

      {/* Search + count row */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <span className="text-sm text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            {activeUni ?? 'All Universities'}
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold text-sm">No students found</p>
            <p className="text-gray-400 text-xs mt-1">
              {search || activeUni ? 'Try adjusting your filters.' : 'Students will appear here once they sign up.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Course</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Year</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">University</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => {
                const initials = (s.full_name ?? s.email ?? 'U')
                  .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-blue-700 text-xs font-bold">{initials}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{s.full_name ?? '—'}</div>
                          {s.email && <div className="text-xs text-gray-400">{s.email}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{s.course ?? '—'}</td>
                    <td className="px-6 py-4">
                      {s.year_level ? (
                        <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full">
                          {s.year_level}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {s.university_name ? (
                        <div>
                          <div className="text-gray-700 font-medium text-xs">{s.university_name}</div>
                          <div className="text-gray-400 font-mono text-xs mt-0.5">@{s.domain}</div>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {s.created_at
                        ? new Date(s.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
