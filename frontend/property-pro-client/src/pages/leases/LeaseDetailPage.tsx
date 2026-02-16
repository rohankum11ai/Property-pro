import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, DollarSign, Home, Pencil, FileText, CreditCard, CheckCircle, XCircle, RotateCcw, Clock } from 'lucide-react'
import { toast } from 'sonner'
import type { Lease } from '@/types/lease'
import type { Payment } from '@/types/payment'
import { MONTHS } from '@/types/payment'
import { getLease, updateLease, changeLeaseStatus, getLeasePayments } from '@/api/leaseApi'
import { createPayment, updatePayment, deletePayment } from '@/api/paymentApi'
import LeaseFormModal from '@/components/leases/LeaseFormModal'
import PaymentFormModal from '@/components/payments/PaymentFormModal'

const statusColors: Record<string, string> = {
  Active: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  'Month-to-Month': 'bg-purple-50 text-purple-700',
  Terminated: 'bg-red-50 text-red-700',
}

const paymentStatusColors: Record<string, string> = {
  Paid: 'bg-green-50 text-green-700',
  Partial: 'bg-amber-50 text-amber-700',
  Late: 'bg-red-50 text-red-700',
  Pending: 'bg-slate-100 text-slate-500',
}

export default function LeaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lease, setLease] = useState<Lease | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id) {
      fetchLease(parseInt(id))
      fetchPayments(parseInt(id))
    }
  }, [id])

  const fetchLease = async (leaseId: number) => {
    try {
      setLoading(true)
      const data = await getLease(leaseId)
      setLease(data)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async (leaseId: number) => {
    try {
      const data = await getLeasePayments(leaseId)
      setPayments(data)
    } catch { /* ignore */ }
  }

  const handleSubmit = async (data: Parameters<typeof updateLease>[1]) => {
    if (!id) return
    setSaving(true)
    try {
      const updated = await updateLease(parseInt(id), data)
      setLease(updated)
      setModalOpen(false)
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

  const handleStatusChange = async (newStatus: string, confirmMsg: string) => {
    if (!id || !confirm(confirmMsg)) return
    try {
      const updated = await changeLeaseStatus(parseInt(id), newStatus)
      setLease(updated)
      toast.success(`Lease status changed to ${newStatus}.`)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Failed to change lease status.')
    }
  }

  const handlePaymentSubmit = async (data: Parameters<typeof createPayment>[0]) => {
    setSaving(true)
    try {
      if (editingPayment) {
        const updated = await updatePayment(editingPayment.paymentId, data)
        setPayments(prev => prev.map(p => p.paymentId === updated.paymentId ? updated : p))
      } else {
        const created = await createPayment(data)
        setPayments(prev => [created, ...prev])
      }
      setPaymentModalOpen(false)
      setEditingPayment(null)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; title?: string } }; message?: string }
      toast.error(e?.response?.data?.message ?? e?.response?.data?.title ?? e?.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePayment = async (payment: Payment) => {
    if (!confirm(`Delete payment ${payment.receiptNumber}?`)) return
    await deletePayment(payment.paymentId)
    setPayments(prev => prev.filter(p => p.paymentId !== payment.paymentId))
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatDateTime = (d: string) => new Date(d).toLocaleString('en-CA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-48 bg-white rounded-xl border border-slate-200" />
      </div>
    )
  }

  if (!lease) return (
    <div className="text-center py-20 text-slate-400">Lease not found.</div>
  )

  const canRecordPayment = lease.status === 'Active' || lease.status === 'Month-to-Month'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/leases')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition">
          <ArrowLeft size={16} /> Back to Leases
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">
              {lease.tenantFirstName[0]}{lease.tenantLastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{lease.tenantFirstName} {lease.tenantLastName}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[lease.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {lease.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                {lease.propertyName} — Unit {lease.unitNumber}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Status action buttons */}
            {lease.status === 'Pending' && (
              <button onClick={() => handleStatusChange('Active', 'Activate this lease? The unit will be marked as Occupied.')}
                className="flex items-center gap-2 border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-xl text-sm font-medium transition">
                <CheckCircle size={14} /> Activate Lease
              </button>
            )}
            {(lease.status === 'Active' || lease.status === 'Month-to-Month') && (
              <button onClick={() => handleStatusChange('Terminated', 'Terminate this lease? The unit will be marked as Available.')}
                className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-medium transition">
                <XCircle size={14} /> Terminate Lease
              </button>
            )}
            {lease.status === 'Terminated' && (
              <>
                <button onClick={() => handleStatusChange('Active', 'Reactivate this lease? The unit will be marked as Occupied.')}
                  className="flex items-center gap-2 border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-xl text-sm font-medium transition">
                  <RotateCcw size={14} /> Reactivate
                </button>
                <button onClick={() => handleStatusChange('Pending', 'Reset this lease to Pending?')}
                  className="flex items-center gap-2 border border-amber-200 text-amber-700 hover:bg-amber-50 px-4 py-2 rounded-xl text-sm font-medium transition">
                  <Clock size={14} /> Reset to Pending
                </button>
              </>
            )}
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Pencil size={14} /> Edit
            </button>
          </div>
        </div>
      </div>

      {/* Lease Details */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Lease Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Calendar size={16} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-400">Start Date</p>
              <p className="text-sm text-slate-800 font-medium">{formatDate(lease.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Calendar size={16} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-400">End Date</p>
              <p className="text-sm text-slate-800 font-medium">{formatDate(lease.endDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={16} className="text-green-600" /></div>
            <div>
              <p className="text-xs text-slate-400">Monthly Rent</p>
              <p className="text-sm text-slate-800 font-medium">${lease.monthlyRent.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><DollarSign size={16} className="text-green-600" /></div>
            <div>
              <p className="text-xs text-slate-400">Security Deposit</p>
              <p className="text-sm text-slate-800 font-medium">${lease.securityDeposit.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant & Unit Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Tenant</h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-800">{lease.tenantFirstName} {lease.tenantLastName}</p>
            <p className="text-sm text-slate-500">{lease.tenantEmail}</p>
            <button onClick={() => navigate(`/tenants/${lease.tenantId}`)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">View Tenant →</button>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Unit</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Home size={14} className="text-slate-400" />
              <p className="text-sm font-medium text-slate-800">{lease.propertyName} — Unit {lease.unitNumber}</p>
            </div>
            <button onClick={() => navigate(`/properties/${lease.propertyId}`)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">View Property →</button>
          </div>
        </div>
      </div>

      {/* Notes */}
      {lease.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 rounded-lg"><FileText size={16} className="text-slate-500" /></div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{lease.notes}</p>
          </div>
        </div>
      )}

      {/* Lease Activity Timeline */}
      {lease.activities && lease.activities.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Lease Activity</h2>
          <div className="space-y-3">
            {lease.activities.map(a => (
              <div key={a.leaseActivityId} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <div className="flex-1 flex items-center justify-between">
                  <p className="text-sm text-slate-700">
                    {a.oldStatus === '—' ? (
                      <>Lease created as <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.newStatus] ?? ''}`}>{a.newStatus}</span></>
                    ) : (
                      <>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.oldStatus] ?? ''}`}>{a.oldStatus}</span>
                        {' → '}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[a.newStatus] ?? ''}`}>{a.newStatus}</span>
                      </>
                    )}
                  </p>
                  <span className="text-xs text-slate-400">{formatDateTime(a.changedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <CreditCard size={16} /> Payment History
          </h2>
          {canRecordPayment && (
            <button onClick={() => { setEditingPayment(null); setPaymentModalOpen(true) }}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition">
              Record Payment
            </button>
          )}
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400 uppercase tracking-wide">
                  <th className="px-6 py-3">Receipt</th>
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
                    <td className="px-6 py-3">{MONTHS[p.periodMonth - 1]} {p.periodYear}</td>
                    <td className="px-6 py-3 font-medium">${p.amountPaid.toLocaleString()}{p.lateFee > 0 && <span className="text-red-500 text-xs ml-1">(+${p.lateFee} fee)</span>}</td>
                    <td className="px-6 py-3 text-slate-500">{p.paymentMethod}</td>
                    <td className="px-6 py-3 text-slate-500">{new Date(p.paymentDate).toLocaleDateString('en-CA')}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusColors[p.status] ?? ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingPayment(p); setPaymentModalOpen(true) }}
                          className="p-1 text-slate-400 hover:text-blue-600 transition"><Pencil size={13} /></button>
                        <button onClick={() => handleDeletePayment(p)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"><span className="text-xs font-bold">&#x2715;</span></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeaseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={lease}
        loading={saving}
      />

      <PaymentFormModal
        open={paymentModalOpen}
        onClose={() => { setPaymentModalOpen(false); setEditingPayment(null) }}
        onSubmit={handlePaymentSubmit}
        initial={editingPayment}
        loading={saving}
        preselectedLeaseId={lease.leaseId}
      />
    </div>
  )
}
