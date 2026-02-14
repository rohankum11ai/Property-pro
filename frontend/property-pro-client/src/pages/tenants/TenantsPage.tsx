import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Mail, Phone, Home, Pencil, Trash2 } from 'lucide-react'
import type { Tenant } from '@/types/tenant'
import { getTenants, createTenant, updateTenant, deleteTenant } from '@/api/tenantApi'
import TenantFormModal from '@/components/tenants/TenantFormModal'

export default function TenantsPage() {
  const navigate = useNavigate()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Tenant | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTenants = async (q?: string) => {
    try {
      setLoading(true)
      const data = await getTenants(q)
      setTenants(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTenants() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchTenants(search || undefined), 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSubmit = async (data: Parameters<typeof createTenant>[0]) => {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        const updated = await updateTenant(editing.tenantId, data)
        setTenants(prev => prev.map(t => t.tenantId === updated.tenantId ? updated : t))
      } else {
        const created = await createTenant(data)
        setTenants(prev => [created, ...prev])
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
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (tenant: Tenant, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Delete ${tenant.firstName} ${tenant.lastName}?`)) return
    await deleteTenant(tenant.tenantId)
    setTenants(prev => prev.filter(t => t.tenantId !== tenant.tenantId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tenants</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tenants.length} tenant{tenants.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Add Tenant
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
        />
      </div>

      {/* Tenant List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            {search ? 'No tenants match your search.' : 'No tenants yet. Add your first tenant.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenants.map(t => (
            <div
              key={t.tenantId}
              onClick={() => navigate(`/tenants/${t.tenantId}`)}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {t.firstName[0]}{t.lastName[0]}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-800">{t.firstName} {t.lastName}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Mail size={11} /> {t.email}</span>
                      <span className="flex items-center gap-1"><Phone size={11} /> {t.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {t.propertyName && t.unitNumber ? (
                    <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
                      <Home size={11} /> {t.propertyName} — Unit {t.unitNumber}
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Unassigned</span>
                  )}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={(e) => { e.stopPropagation(); setEditing(t); setModalOpen(true) }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(t, e)}
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

      <TenantFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={saving}
      />
    </div>
  )
}
