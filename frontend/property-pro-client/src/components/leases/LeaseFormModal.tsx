import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import type { Lease } from '@/types/lease'
import type { Property, Unit } from '@/types/property'
import type { Tenant } from '@/types/tenant'
import { getProperties, getUnits } from '@/api/propertyApi'
import { getTenants } from '@/api/tenantApi'

const statusColors: Record<string, string> = {
  Active: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  'Month-to-Month': 'bg-purple-50 text-purple-700',
  Terminated: 'bg-red-50 text-red-700',
}

const schema = z.object({
  tenantId: z.preprocess(v => Number(v), z.number().min(1, 'Required')),
  unitId: z.preprocess(v => Number(v), z.number().min(1, 'Required')),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  monthlyRent: z.preprocess(v => Number(v), z.number().positive('Must be positive')),
  securityDeposit: z.preprocess(v => Number(v), z.number().min(0)),
  paymentFrequency: z.string().default('Monthly'),
  notes: z.string().optional(),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type FormData = {
  tenantId: number
  unitId: number
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  paymentFrequency: string
  notes?: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  initial?: Lease | null
  loading?: boolean
}

export default function LeaseFormModal({ open, onClose, onSubmit, initial, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  })

  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | ''>('')

  useEffect(() => {
    if (open) {
      getProperties().then(setProperties).catch(() => {})
      getTenants().then(setTenants).catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (initial) {
      reset({
        tenantId: initial.tenantId,
        unitId: initial.unitId,
        startDate: initial.startDate.split('T')[0],
        endDate: initial.endDate.split('T')[0],
        monthlyRent: initial.monthlyRent,
        securityDeposit: initial.securityDeposit,
        paymentFrequency: initial.paymentFrequency,
        notes: initial.notes ?? '',
      })
      if (initial.propertyId) {
        setSelectedPropertyId(initial.propertyId)
        getUnits(initial.propertyId).then(setUnits).catch(() => {})
      }
    } else {
      reset({
        tenantId: 0, unitId: 0, startDate: '', endDate: '',
        monthlyRent: 0, securityDeposit: 0, paymentFrequency: 'Monthly',
        notes: '',
      })
      setSelectedPropertyId('')
      setUnits([])
    }
  }, [initial, open, reset])

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedPropertyId(val ? parseInt(val) : '')
    setUnits([])
    if (val) {
      getUnits(parseInt(val)).then(setUnits).catch(() => {})
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">
              {initial ? 'Edit Lease' : 'Create Lease'}
            </h2>
            {initial && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[initial.status] ?? 'bg-slate-100 text-slate-500'}`}>
                {initial.status}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Tenant */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tenant</label>
            <select {...register('tenantId')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
              <option value={0}>— Select Tenant —</option>
              {tenants.map(t => (
                <option key={t.tenantId} value={t.tenantId}>{t.firstName} {t.lastName}</option>
              ))}
            </select>
            {errors.tenantId && <p className="text-red-500 text-xs mt-1">{errors.tenantId.message}</p>}
          </div>

          {/* Property / Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Property</label>
              <select value={selectedPropertyId} onChange={handlePropertyChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value="">— Select —</option>
                {properties.map(p => (
                  <option key={p.propertyId} value={p.propertyId}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <select {...register('unitId')} disabled={!selectedPropertyId}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white disabled:bg-slate-50 disabled:text-slate-400">
                <option value={0}>— Select —</option>
                {units.map(u => (
                  <option key={u.unitId} value={u.unitId}>
                    Unit {u.unitNumber} {u.status !== 'Available' && initial?.unitId !== u.unitId ? `(${u.status})` : ''}
                  </option>
                ))}
              </select>
              {errors.unitId && <p className="text-red-500 text-xs mt-1">{errors.unitId.message}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input {...register('startDate')} type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input {...register('endDate')} type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Rent & Deposit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent ($)</label>
              <input {...register('monthlyRent')} type="number" step="0.01" placeholder="1500.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.monthlyRent && <p className="text-red-500 text-xs mt-1">{errors.monthlyRent.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Security Deposit ($)</label>
              <input {...register('securityDeposit')} type="number" step="0.01" placeholder="1500.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>

          {/* Notes */}
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
              {initial ? 'Save Changes' : 'Create Lease'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
