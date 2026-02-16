import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Calendar, DollarSign, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Lease } from '@/types/lease'
import { LEASE_STATUSES } from '@/types/lease'
import { getLeases, createLease, updateLease, deleteLease } from '@/api/leaseApi'
import LeaseFormModal from '@/components/leases/LeaseFormModal'

const statusColors: Record<string, string> = {
  Active: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  'Month-to-Month': 'bg-purple-50 text-purple-700',
  Terminated: 'bg-red-50 text-red-700',
}

export default function LeasesPage() {
  const navigate = useNavigate()
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Lease | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchLeases = async (q?: string, status?: string) => {
    try {
      setLoading(true)
      const data = await getLeases(q, status)
      setLeases(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLeases() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchLeases(search || undefined, statusFilter || undefined), 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter])

  const handleSubmit = async (data: Parameters<typeof createLease>[0]) => {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateLease(editing.leaseId, data)
        setLeases(prev => prev.map(l => l.leaseId === updated.leaseId ? updated : l))
      } else {
        const created = await createLease(data)
        setLeases(prev => [created, ...prev])
      }
      setModalOpen(false)
      setEditing(null)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string; title?: string } }; message?: string }
      const msg = e?.response?.data?.message
        ?? e?.response?.data?.title
        ?? (e?.response?.status ? `Server error (${e.response.status})` : null)
        ?? e?.message
        ?? 'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (lease: Lease, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete lease for ${lease.tenantFirstName} ${lease.tenantLastName}?`)) return
    await deleteLease(lease.leaseId)
    setLeases(prev => prev.filter(l => l.leaseId !== lease.leaseId))
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Leases</h1>
          <p className="text-slate-500 text-sm mt-0.5">{leases.length} lease{leases.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Create Lease
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by tenant, unit, or property..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition">
          <option value="">All Statuses</option>
          {LEASE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Lease List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : leases.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            {search || statusFilter ? 'No leases match your filters.' : 'No leases yet. Create your first lease.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leases.map(l => (
            <div
              key={l.leaseId}
              onClick={() => navigate(`/leases/${l.leaseId}`)}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {l.tenantFirstName[0]}{l.tenantLastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{l.tenantFirstName} {l.tenantLastName}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">{l.propertyName} — Unit {l.unitNumber}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(l.startDate)} — {formatDate(l.endDate)}</span>
                      <span className="flex items-center gap-1"><DollarSign size={11} /> ${l.monthlyRent.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[l.status] ?? 'bg-slate-100 text-slate-500'}`}>
                    {l.status}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); setEditing(l); setModalOpen(true) }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(l, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <LeaseFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={saving}
      />
    </div>
  )
}
