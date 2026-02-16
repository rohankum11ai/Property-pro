import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, AlertTriangle } from 'lucide-react'
import type { Tenant } from '@/types/tenant'
import type { Lease } from '@/types/lease'
import { getLeases } from '@/api/leaseApi'

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Required'),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  notes: z.string().optional(),
  unitId: z.preprocess(
    v => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().optional()
  ),
})

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
  unitId?: number
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  initial?: Tenant | null
  loading?: boolean
}

export default function TenantFormModal({ open, onClose, onSubmit, initial, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  })

  const [tenantLease, setTenantLease] = useState<Lease | null>(null)

  useEffect(() => {
    if (open && initial) {
      // Check if this tenant has any lease
      getLeases().then(leases => {
        const lease = leases.find(l => l.tenantId === initial.tenantId)
        setTenantLease(lease ?? null)
      }).catch(() => {})
    } else {
      setTenantLease(null)
    }
  }, [open, initial])

  useEffect(() => {
    if (initial) {
      reset({
        firstName: initial.firstName,
        lastName: initial.lastName,
        email: initial.email,
        phone: initial.phone,
        emergencyContact: initial.emergencyContact ?? '',
        emergencyPhone: initial.emergencyPhone ?? '',
        notes: initial.notes ?? '',
        unitId: initial.unitId ?? undefined,
      })
    } else {
      reset({ firstName: '', lastName: '', email: '', phone: '', emergencyContact: '', emergencyPhone: '', notes: '', unitId: undefined })
    }
  }, [initial, open, reset])

  if (!open) return null

  const isEditing = !!initial

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditing ? 'Edit Tenant' : 'Add Tenant'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Lease warning when editing */}
          {isEditing && tenantLease && (
            <div className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
              tenantLease.status === 'Active' ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : tenantLease.status === 'Pending' ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : tenantLease.status === 'Terminated' ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-slate-50 border border-slate-200 text-slate-600'
            }`}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">This tenant has a lease ({tenantLease.status})</p>
                <p className="text-xs mt-0.5 opacity-80">
                  {tenantLease.propertyName} — Unit {tenantLease.unitNumber} &middot; ${tenantLease.monthlyRent.toLocaleString()}/mo
                  {tenantLease.status === 'Active' && ' · Unit assignment is managed by the lease.'}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input {...register('firstName')} placeholder="John"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input {...register('lastName')} placeholder="Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input {...register('email')} type="email" placeholder="john.doe@email.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input {...register('phone')} type="tel" placeholder="(416) 555-0123"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
              <input {...register('emergencyContact')} placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Phone</label>
              <input {...register('emergencyPhone')} type="tel" placeholder="(416) 555-0199"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>

          {/* Unit Assignment - only shown when editing, always readonly */}
          {isEditing && initial?.propertyName && initial?.unitNumber && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Unit Assignment</p>
              <div className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                {initial.propertyName} — Unit {initial.unitNumber}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">Unit assignment is managed through leases.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={2} placeholder="Any relevant notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
