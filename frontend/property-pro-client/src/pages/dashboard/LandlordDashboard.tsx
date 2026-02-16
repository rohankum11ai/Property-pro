import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, FileText, AlertTriangle, TrendingUp, Clock } from 'lucide-react'
import type { Lease } from '@/types/lease'
import type { Property } from '@/types/property'
import { getLeases } from '@/api/leaseApi'
import { getProperties } from '@/api/propertyApi'

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  Expired: 'bg-slate-100 text-slate-500',
  Terminated: 'bg-red-50 text-red-700',
}

export default function LandlordDashboard() {
  const navigate = useNavigate()
  const [leases, setLeases] = useState<Lease[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getLeases(), getProperties()])
      .then(([l, p]) => { setLeases(l); setProperties(p) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeLeases = leases.filter(l => l.status === 'Active')
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0)
  const monthlyRent = activeLeases.reduce((sum, l) => sum + l.monthlyRent, 0)

  const now = new Date()
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const expiringSoon = activeLeases.filter(l => new Date(l.endDate) <= in30Days && new Date(l.endDate) >= now)

  const recentLeases = [...leases].slice(0, 5)

  const stats = [
    { label: 'Total Units', value: totalUnits.toString(), icon: <Building2 size={20} />, color: 'blue', sub: `${properties.length} properties` },
    { label: 'Active Leases', value: activeLeases.length.toString(), icon: <FileText size={20} />, color: 'green', sub: 'Occupied' },
    { label: 'Expiring Soon', value: expiringSoon.length.toString(), icon: <AlertTriangle size={20} />, color: 'amber', sub: 'Next 30 days' },
    { label: 'Monthly Rent', value: `$${monthlyRent.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'purple', sub: 'Total expected' },
  ]

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })

  const daysRemaining = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm ${loading ? 'animate-pulse' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{loading ? '—' : s.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${colorMap[s.color]}`}>{s.icon}</div>
            </div>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Leases */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <FileText size={16} /> Recent Leases
            </h2>
            <button onClick={() => navigate('/leases')} className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          {recentLeases.length === 0 ? (
            <div className="p-5 text-center text-slate-400 text-sm py-10">
              No leases yet. <button onClick={() => navigate('/leases')} className="text-blue-600 hover:underline">Create one</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentLeases.map(l => (
                <div key={l.leaseId} onClick={() => navigate(`/leases/${l.leaseId}`)}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{l.tenantFirstName} {l.tenantLastName}</p>
                    <p className="text-xs text-slate-400">{l.propertyName} — Unit {l.unitNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[l.status] ?? ''}`}>
                      {l.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(l.startDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Leases */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} /> Expiring Soon
            </h2>
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">{expiringSoon.length} lease{expiringSoon.length !== 1 ? 's' : ''}</span>
          </div>
          {expiringSoon.length === 0 ? (
            <div className="p-5 text-center text-slate-400 text-sm py-10">
              No leases expiring in the next 30 days
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {expiringSoon.map(l => (
                <div key={l.leaseId} onClick={() => navigate(`/leases/${l.leaseId}`)}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{l.tenantFirstName} {l.tenantLastName}</p>
                    <p className="text-xs text-slate-400">{l.propertyName} — Unit {l.unitNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-600">{daysRemaining(l.endDate)} days</p>
                    <p className="text-xs text-slate-400">Ends {formatDate(l.endDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
