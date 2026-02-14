import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import type { Unit, UnitStatus } from '@/types/property'

export type UnitFormData = {
  unitNumber: string
  bedrooms: number
  bathrooms: number
  rentAmount: number
  squareFeet?: number
  status: UnitStatus
}

const schema = z.object({
  unitNumber: z.string().min(1, 'Required'),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  rentAmount: z.number().min(0),
  squareFeet: z.preprocess(
    v => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? undefined : Number(v)),
    z.number().min(1).optional()
  ),
  status: z.enum(['Available', 'Occupied', 'UnderMaintenance']).default('Available'),
})

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: UnitFormData) => Promise<void>
  initial?: Unit | null
  loading?: boolean
}

export default function UnitFormModal({ open, onClose, onSubmit, initial, loading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnitFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as unknown as Resolver<UnitFormData>,
  })

  useEffect(() => {
    if (initial) {
      reset({
        unitNumber: initial.unitNumber,
        bedrooms: initial.bedrooms,
        bathrooms: initial.bathrooms,
        rentAmount: initial.rentAmount,
        squareFeet: initial.squareFeet ?? undefined,
        status: initial.status,
      })
    } else {
      reset({ unitNumber: '', bedrooms: 1, bathrooms: 1, rentAmount: 0, status: 'Available' })
    }
  }, [initial, open, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {initial ? 'Edit Unit' : 'Add Unit'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Unit Number</label>
            <input {...register('unitNumber')} placeholder="101"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            {errors.unitNumber && <p className="text-red-500 text-xs mt-1">{errors.unitNumber.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
              <input {...register('bedrooms', { valueAsNumber: true })} type="number" min={0} max={20}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
              <input {...register('bathrooms', { valueAsNumber: true })} type="number" min={0} max={10} step={0.5}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent ($)</label>
              <input {...register('rentAmount', { valueAsNumber: true })} type="number" min={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
              {errors.rentAmount && <p className="text-red-500 text-xs mt-1">{errors.rentAmount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sq Ft (optional)</label>
              <input {...register('squareFeet')} type="number" min={0} placeholder="800"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>

          {initial && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="UnderMaintenance">Under Maintenance</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {initial ? 'Save Changes' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
