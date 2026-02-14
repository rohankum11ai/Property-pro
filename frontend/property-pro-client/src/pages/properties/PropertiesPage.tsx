import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, MapPin, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import type { Property } from '@/types/property'
import { getProperties, createProperty, updateProperty, deleteProperty } from '@/api/propertyApi'
import PropertyFormModal from '@/components/properties/PropertyFormModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'

const typeIcon: Record<string, string> = {
  Apartment: '🏢', House: '🏠', Condo: '🏙️', Commercial: '🏬'
}

export default function PropertiesPage() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchProperties() }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await getProperties()
      setProperties(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: Omit<Property, 'propertyId' | 'createdAt' | 'totalUnits' | 'availableUnits' | 'occupiedUnits'>) => {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateProperty(editing.propertyId, data)
        setProperties(prev => prev.map(p => p.propertyId === updated.propertyId ? updated : p))
        toast.success('Property updated successfully')
      } else {
        const created = await createProperty(data)
        setProperties(prev => [created, ...prev])
        toast.success('Property added successfully')
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProperty(deleteTarget.propertyId)
      setProperties(prev => prev.filter(p => p.propertyId !== deleteTarget.propertyId))
      toast.success(`${deleteTarget.name} deleted`)
      setDeleteTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; title?: string } }; message?: string }
      toast.error(e?.response?.data?.message ?? e?.response?.data?.title ?? e?.message ?? 'Failed to delete property.')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (p: Property, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(p)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Properties</h1>
          <p className="text-slate-500 text-sm mt-1">{properties.length} propert{properties.length === 1 ? 'y' : 'ies'}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-44" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && properties.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No properties yet</p>
          <p className="text-slate-400 text-sm mt-1">Add your first property to get started</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Plus size={16} /> Add Property
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map(p => (
            <div
              key={p.propertyId}
              onClick={() => navigate(`/properties/${p.propertyId}`)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer group"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeIcon[p.propertyType] ?? '🏠'}</span>
                  <div>
                    <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition">{p.name}</h3>
                    <span className="text-xs text-slate-400">{p.propertyType}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={e => handleEdit(p, e)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteTarget(p) }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-1.5 text-slate-500 text-sm mb-4">
                <MapPin size={14} className="shrink-0 mt-0.5" />
                <span>{p.address}, {p.city}, {p.province} {p.postalCode}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800">{p.totalUnits}</p>
                  <p className="text-xs text-slate-400">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{p.availableUnits}</p>
                  <p className="text-xs text-slate-400">Available</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{p.occupiedUnits}</p>
                  <p className="text-xs text-slate-400">Occupied</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PropertyFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Property"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all its units.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
