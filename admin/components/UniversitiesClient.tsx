'use client'

import { useState } from 'react'
import { addUniversity, deleteUniversity, toggleUniversity } from '@/app/actions/universities'
import { Building2, Plus, Trash2, Loader2, X, PowerOff, Power } from 'lucide-react'

interface Domain {
  id: string
  domain: string
  university_name: string
  created_at: string
  is_active: boolean
}

export default function UniversitiesClient({ initialDomains }: { initialDomains: Domain[] }) {
  const [domains,   setDomains]   = useState<Domain[]>(initialDomains)
  const [showModal, setShowModal] = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [toggling,  setToggling]  = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null)
  const [search,    setSearch]    = useState('')

  const filtered = domains.filter(d =>
    d.university_name.toLowerCase().includes(search.toLowerCase()) ||
    d.domain.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id: string) {
    setDeleting(id)
    setDeleteError(null)
    const { error } = await deleteUniversity(id)
    if (error) {
      setDeleteError({ id, message: error })
    } else {
      setDomains(prev => prev.filter(d => d.id !== id))
    }
    setDeleting(null)
  }

  async function handleToggle(id: string, current: boolean) {
    setToggling(id)
    const { error } = await toggleUniversity(id, !current)
    if (!error) {
      setDomains(prev => prev.map(d => d.id === id ? { ...d, is_active: !current } : d))
    }
    setToggling(null)
  }

  function handleAdded(domain: Domain) {
    setDomains(prev => [domain, ...prev])
    setShowModal(false)
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search universities or domains..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
        >
          <Plus size={16} />
          Add University
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">
            Allowed Domains
            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold text-sm">No universities found</p>
            <p className="text-gray-400 text-xs mt-1">
              {search ? 'Try a different search term.' : 'Add your first university to get started.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">University</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Domain</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Added</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(d => (
                <>
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${d.is_active ? 'bg-blue-50' : 'bg-gray-100'}`}>
                          <Building2 size={14} className={d.is_active ? 'text-blue-600' : 'text-gray-400'} />
                        </div>
                        <span className={`font-semibold ${d.is_active ? 'text-gray-900' : 'text-gray-400'}`}>
                          {d.university_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">@{d.domain}</span>
                    </td>
                    <td className="px-6 py-4">
                      {d.is_active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 font-semibold px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(d.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Disable / Enable toggle */}
                        <button
                          onClick={() => handleToggle(d.id, d.is_active)}
                          disabled={toggling === d.id}
                          title={d.is_active ? 'Disable university' : 'Enable university'}
                          className={`p-2 rounded-lg transition disabled:opacity-40 ${
                            d.is_active
                              ? 'text-gray-400 hover:bg-yellow-50 hover:text-yellow-600'
                              : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                          }`}
                        >
                          {toggling === d.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : d.is_active ? <PowerOff size={15} /> : <Power size={15} />
                          }
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(d.id)}
                          disabled={deleting === d.id}
                          title="Delete university"
                          className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-40"
                        >
                          {deleting === d.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Inline error row */}
                  {deleteError?.id === d.id && (
                    <tr key={`${d.id}-error`}>
                      <td colSpan={5} className="px-6 py-3 bg-red-50">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-red-600 font-medium">{deleteError.message}</p>
                          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 ml-4">
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <AddDomainModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
      )}
    </>
  )
}

function AddDomainModal({ onClose, onAdded }: { onClose: () => void; onAdded: (domain: Domain) => void }) {
  const [universityName, setUniversityName] = useState('')
  const [domain,         setDomain]         = useState('')
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await addUniversity(universityName, domain)
    if (error) { setError(error); setLoading(false); return }
    onAdded(data)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-black text-gray-900">Add University</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">University Name</label>
            <input
              type="text"
              value={universityName}
              onChange={e => setUniversityName(e.target.value)}
              placeholder="e.g. Cebu Institute of Technology University"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Domain</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">@</span>
              <input
                type="text"
                value={domain}
                onChange={e => setDomain(e.target.value)}
                placeholder="cit.edu"
                required
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Students with this email domain will be able to register.</p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Adding...' : 'Add University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
