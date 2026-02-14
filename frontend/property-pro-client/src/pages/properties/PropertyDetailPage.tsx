import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, BedDouble, Bath, DollarSign, Ruler, Pencil, Trash2, Users, Home } from 'lucide-react'
import { toast } from 'sonner'
import type { Property, Unit } from '@/types/property'
import { isMultiUnit } from '@/types/property'
import { getProperty, getUnits, createUnit, updateUnit, deleteUnit } from '@/api/propertyApi'
import UnitStatusBadge from '@/components/properties/UnitStatusBadge'
import UnitFormModal, { type UnitFormData } from '@/components/properties/UnitFormModal'
import ConfirmDialog from '@/components/common/ConfirmDialog'

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteUnitTarget, setDeleteUnitTarget] = useState<Unit | null>(null)
  const [deleting, setDeleting] = useState(false)

  const multiUnit = property ? isMultiUnit(property.propertyType) : false

  useEffect(() => {
    if (id) fetchData(parseInt(id))
  }, [id])

  const fetchData = async (propertyId: number) => {
    try {
      setLoading(true)
      const [prop, unitList] = await Promise.all([
        getProperty(propertyId),
        getUnits(propertyId)
      ])
      setProperty(prop)
      setUnits(unitList)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: UnitFormData) => {
    if (!id) return
    setSaving(true)
    try {
      if (editingUnit) {
        const updated = await updateUnit(parseInt(id), editingUnit.unitId, data)
        setUnits(prev => prev.map(u => u.unitId === updated.unitId ? updated : u))
        toast.success('Unit updated successfully')
      } else {
        const created = await createUnit(parseInt(id), data)
        setUnits(prev => [...prev, created])
        toast.success('Unit added successfully')
      }
      setModalOpen(false)
      setEditingUnit(null)
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

  const handleDeleteUnit = async () => {
    if (!id || !deleteUnitTarget) return
    setDeleting(true)
    try {
      await deleteUnit(parseInt(id), deleteUnitTarget.unitId)
      setUnits(prev => prev.filter(u => u.unitId !== deleteUnitTarget.unitId))
      toast.success(`Unit ${deleteUnitTarget.unitNumber} deleted`)
      setDeleteUnitTarget(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; title?: string } }; message?: string }
      toast.error(e?.response?.data?.message ?? e?.response?.data?.title ?? e?.message ?? 'Failed to delete unit.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-32 bg-white rounded-xl border border-slate-200" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white rounded-xl border border-slate-200" />)}
        </div>
      </div>
    )
  }

  if (!property) return (
    <div className="text-center py-20 text-slate-400">Property not found.</div>
  )

  // For single-unit types, get the auto-created "Main" unit
  const mainUnit = !multiUnit ? units[0] : null

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/properties')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition">
          <ArrowLeft size={16} /> Back to Properties
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{property.name}</h1>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                {property.propertyType}
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {property.address}, {property.city}, {property.province} {property.postalCode}
            </p>
          </div>
          {multiUnit && (
            <button
              onClick={() => { setEditingUnit(null); setModalOpen(true) }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Plus size={16} /> Add Unit
            </button>
          )}
        </div>
      </div>

      {/* Multi-unit: Summary Cards + Units Grid */}
      {multiUnit ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Units', value: property.totalUnits, color: 'slate' },
              { label: 'Available', value: property.availableUnits, color: 'green' },
              { label: 'Occupied', value: property.occupiedUnits, color: 'blue' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
                <p className={`text-3xl font-bold text-${s.color}-600`}>{s.value}</p>
                <p className="text-slate-500 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-3">Units ({units.length})</h2>
            {units.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <p className="text-slate-400 text-sm">No units yet. Add your first unit.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {units.map(u => (
                  <div key={u.unitId}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-800 text-lg">Unit {u.unitNumber}</span>
                      <div className="flex items-center gap-2">
                        <UnitStatusBadge status={u.status} />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => { setEditingUnit(u); setModalOpen(true) }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition">
                            <Pencil size={13} />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setDeleteUnitTarget(u) }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <BedDouble size={14} className="text-slate-400" />
                        <span>{u.bedrooms} bed{u.bedrooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath size={14} className="text-slate-400" />
                        <span>{u.bathrooms} bath{u.bathrooms !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={14} className="text-slate-400" />
                        <span>${u.rentAmount.toLocaleString()}/mo</span>
                      </div>
                      {u.squareFeet && (
                        <div className="flex items-center gap-1.5">
                          <Ruler size={14} className="text-slate-400" />
                          <span>{u.squareFeet.toLocaleString()} sq ft</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Single-unit: show property details directly */
        <div className="space-y-4">
          {/* Property Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Property Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mainUnit && mainUnit.rentAmount > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={16} className="text-green-600" /></div>
                  <div>
                    <p className="text-xs text-slate-400">Rent</p>
                    <p className="text-sm text-slate-800 font-medium">${mainUnit.rentAmount.toLocaleString()}/mo</p>
                  </div>
                </div>
              )}
              {mainUnit && mainUnit.bedrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><BedDouble size={16} className="text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-400">Bedrooms</p>
                    <p className="text-sm text-slate-800 font-medium">{mainUnit.bedrooms}</p>
                  </div>
                </div>
              )}
              {mainUnit && mainUnit.bathrooms > 0 && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg"><Bath size={16} className="text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-slate-400">Bathrooms</p>
                    <p className="text-sm text-slate-800 font-medium">{mainUnit.bathrooms}</p>
                  </div>
                </div>
              )}
              {mainUnit?.squareFeet && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg"><Ruler size={16} className="text-slate-500" /></div>
                  <div>
                    <p className="text-xs text-slate-400">Size</p>
                    <p className="text-sm text-slate-800 font-medium">{mainUnit.squareFeet.toLocaleString()} sq ft</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg"><Home size={16} className="text-slate-500" /></div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="text-sm text-slate-800 font-medium">{mainUnit?.status ?? 'Available'}</p>
                </div>
              </div>
            </div>
            {mainUnit && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setEditingUnit(mainUnit); setModalOpen(true) }}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition">
                  <Pencil size={14} /> Edit Property Details
                </button>
              </div>
            )}
          </div>

          {/* Tenant Assignment for single-unit */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Tenant</h2>
            {mainUnit?.status === 'Occupied' ? (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg"><Users size={16} className="text-green-600" /></div>
                <div>
                  <p className="text-sm text-slate-800 font-medium">Unit is occupied</p>
                  <button onClick={() => navigate('/tenants')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    View in Tenants
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">No tenant assigned yet.</p>
                <button onClick={() => navigate('/tenants')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition">
                  Assign from Tenants
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {multiUnit && (
        <UnitFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingUnit(null) }}
          onSubmit={handleSubmit}
          initial={editingUnit}
          loading={saving}
        />
      )}
      {!multiUnit && mainUnit && (
        <UnitFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingUnit(null) }}
          onSubmit={handleSubmit}
          initial={editingUnit}
          loading={saving}
        />
      )}

      <ConfirmDialog
        open={!!deleteUnitTarget}
        title="Delete Unit"
        message={`Are you sure you want to delete Unit ${deleteUnitTarget?.unitNumber}?`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteUnit}
        onCancel={() => setDeleteUnitTarget(null)}
      />
    </div>
  )
}
