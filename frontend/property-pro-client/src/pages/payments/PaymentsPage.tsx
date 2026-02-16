import { useState, useEffect } from 'react'
import { Plus, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import type { Payment } from '@/types/payment'
import { PAYMENT_STATUSES, MONTHS } from '@/types/payment'
import { getPayments, createPayment, updatePayment, deletePayment } from '@/api/paymentApi'
import PaymentFormModal from '@/components/payments/PaymentFormModal'

const statusColors: Record<string, string> = {
  Paid: 'bg-green-50 text-green-700',
  Partial: 'bg-amber-50 text-amber-700',
  Late: 'bg-red-50 text-red-700',
  Pending: 'bg-slate-100 text-slate-500',
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Payment | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchPayments = async (status?: string) => {
    try {
      setLoading(true)
      const data = await getPayments(status ? { status } : undefined)
      setPayments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPayments() }, [])

  useEffect(() => {
    fetchPayments(statusFilter || undefined)
  }, [statusFilter])

  const handleSubmit = async (data: Parameters<typeof createPayment>[0]) => {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updatePayment(editing.paymentId, data)
        setPayments(prev => prev.map(p => p.paymentId === updated.paymentId ? updated : p))
      } else {
        const created = await createPayment(data)
        setPayments(prev => [created, ...prev])
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

  const handleDelete = async (payment: Payment) => {
    if (!confirm(`Delete payment ${payment.receiptNumber}?`)) return
    await deletePayment(payment.paymentId)
    setPayments(prev => prev.filter(p => p.paymentId !== payment.paymentId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">{payments.length} payment{payments.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition">
          <option value="">All Statuses</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400 text-sm">
            {statusFilter ? 'No payments match your filter.' : 'No payments recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
                <th className="px-6 py-3">Receipt</th>
                <th className="px-6 py-3">Tenant</th>
                <th className="px-6 py-3">Property / Unit</th>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.paymentId} className="border-b border-slate-50 hover:bg-slate-50 transition">
                  <td className="px-6 py-3 font-mono text-xs text-slate-600">{p.receiptNumber}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">{p.tenantFirstName} {p.tenantLastName}</td>
                  <td className="px-6 py-3 text-slate-500">{p.propertyName} — Unit {p.unitNumber}</td>
                  <td className="px-6 py-3 flex items-center gap-1"><Calendar size={12} className="text-slate-400" /> {MONTHS[p.periodMonth - 1]} {p.periodYear}</td>
                  <td className="px-6 py-3 font-medium flex items-center gap-1">
                    <DollarSign size={12} className="text-slate-400" />
                    {p.amountPaid.toLocaleString()}
                    {p.lateFee > 0 && <span className="text-red-500 text-xs ml-1">(+${p.lateFee})</span>}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{p.paymentMethod}</td>
                  <td className="px-6 py-3 text-slate-500">{new Date(p.paymentDate).toLocaleDateString('en-CA')}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] ?? ''}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(p); setModalOpen(true) }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={() => handleDelete(p)}
                        className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PaymentFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={saving}
      />
    </div>
  )
}
