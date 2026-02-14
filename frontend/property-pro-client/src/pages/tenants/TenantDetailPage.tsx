import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, AlertTriangle, Home, Pencil, FileText } from 'lucide-react'
import type { Tenant } from '@/types/tenant'
import { getTenant, updateTenant } from '@/api/tenantApi'
import TenantFormModal from '@/components/tenants/TenantFormModal'

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchTenant(parseInt(id))
  }, [id])

  const fetchTenant = async (tenantId: number) => {
    try {
      setLoading(true)
      const data = await getTenant(tenantId)
      setTenant(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Parameters<typeof updateTenant>[1]) => {
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      const updated = await updateTenant(parseInt(id), data)
      setTenant(updated)
      setModalOpen(false)
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

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-48 bg-white rounded-xl border border-slate-200" />
      </div>
    )
  }

  if (!tenant) return (
    <div className="text-center py-20 text-slate-400">Tenant not found.</div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4 font-bold">✕</button>
        </div>
      )}

      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/tenants')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition">
          <ArrowLeft size={16} /> Back to Tenants
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {tenant.firstName[0]}{tenant.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{tenant.firstName} {tenant.lastName}</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Added {new Date(tenant.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Pencil size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Mail size={16} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm text-slate-800 font-medium">{tenant.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Phone size={16} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm text-slate-800 font-medium">{tenant.phone}</p>
            </div>
          </div>
          {tenant.emergencyContact && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg"><AlertTriangle size={16} className="text-orange-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Emergency Contact</p>
                <p className="text-sm text-slate-800 font-medium">{tenant.emergencyContact}</p>
              </div>
            </div>
          )}
          {tenant.emergencyPhone && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg"><Phone size={16} className="text-orange-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Emergency Phone</p>
                <p className="text-sm text-slate-800 font-medium">{tenant.emergencyPhone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unit Assignment */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Unit Assignment</h2>
        {tenant.propertyName && tenant.unitNumber ? (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><Home size={16} className="text-green-600" /></div>
            <div>
              <p className="text-sm text-slate-800 font-medium">{tenant.propertyName} — Unit {tenant.unitNumber}</p>
              <p className="text-xs text-slate-400">Currently assigned</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Not currently assigned to any unit.</p>
        )}
      </div>

      {/* Notes */}
      {tenant.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 rounded-lg"><FileText size={16} className="text-slate-500" /></div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{tenant.notes}</p>
          </div>
        </div>
      )}

      <TenantFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={tenant}
        loading={saving}
      />
    </div>
  )
}
