import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import type { Payment } from '@/types/payment'
import { PAYMENT_METHODS, PAYMENT_STATUSES, MONTHS } from '@/types/payment'
import type { Lease } from '@/types/lease'
import { getLeases } from '@/api/leaseApi'

const schema = z.object({
  leaseId: z.preprocess(v => Number(v), z.number().min(1, 'Required')),
  amountPaid: z.preprocess(v => Number(v), z.number().positive('Must be positive')),
  paymentDate: z.string().min(1, 'Required'),
  paymentMethod: z.string().min(1, 'Required'),
  status: z.string().min(1, 'Required'),
  periodMonth: z.preprocess(v => Number(v), z.number().min(1).max(12)),
  periodYear: z.preprocess(v => Number(v), z.number().min(2020).max(2100)),
  lateFee: z.preprocess(v => Number(v), z.number().min(0)),
  notes: z.string().optional(),
})

type FormData = {
  leaseId: number
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  status: string
  periodMonth: number
  periodYear: number
  lateFee: number
  notes?: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: FormData) => Promise<void>
  initial?: Payment | null
  loading?: boolean
  preselectedLeaseId?: number
}

export default function PaymentFormModal({ open, onClose, onSubmit, initial, loading, preselectedLeaseId }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<FormData>,
  })

  const [leases, setLeases] = useState<Lease[]>([])
  const now = new Date()

  useEffect(() => {
    if (open && !preselectedLeaseId) {
      getLeases(undefined, 'Active').then(setLeases).catch(() => {})
    }
  }, [open, preselectedLeaseId])

  useEffect(() => {
    if (initial) {
      reset({
        leaseId: initial.leaseId,
        amountPaid: initial.amountPaid,
        paymentDate: initial.paymentDate.split('T')[0],
        paymentMethod: initial.paymentMethod,
        status: initial.status,
        periodMonth: initial.periodMonth,
        periodYear: initial.periodYear,
        lateFee: initial.lateFee,
        notes: initial.notes ?? '',
      })
    } else {
      reset({
        leaseId: preselectedLeaseId ?? 0,
        amountPaid: 0,
        paymentDate: now.toISOString().split('T')[0],
        paymentMethod: 'E-Transfer',
        status: 'Paid',
        periodMonth: now.getMonth() + 1,
        periodYear: now.getFullYear(),
        lateFee: 0,
        notes: '',
      })
    }
  }, [initial, open, reset, preselectedLeaseId])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {initial ? 'Edit Payment' : 'Record Payment'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Lease selector (hidden if preselected) */}
          {!preselectedLeaseId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lease</label>
              <select {...register('leaseId')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value={0}>— Select Lease —</option>
                {leases.map(l => (
                  <option key={l.leaseId} value={l.leaseId}>
                    {l.tenantFirstName} {l.tenantLastName} — {l.propertyName} Unit {l.unitNumber}
                  </option>
                ))}
              </select>
              {errors.leaseId && <p className="text-red-500 text-xs mt-1">{errors.leaseId.message}</p>}
            </div>
          )}

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid ($)</label>
              <input {...register('amountPaid')} type="number" step="0.01" placeholder="1500.00"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.amountPaid && <p className="text-red-500 text-xs mt-1">{errors.amountPaid.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
              <input {...register('paymentDate')} type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate.message}</p>}
            </div>
          </div>

          {/* Method & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select {...register('paymentMethod')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                {PAYMENT_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Period */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Period Month</label>
              <select {...register('periodMonth')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                {MONTHS.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Period Year</label>
              <input {...register('periodYear')} type="number" placeholder="2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.periodYear && <p className="text-red-500 text-xs mt-1">{errors.periodYear.message}</p>}
            </div>
          </div>

          {/* Late Fee */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Late Fee ($)</label>
            <input {...register('lateFee')} type="number" step="0.01" placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
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
              {initial ? 'Save Changes' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
