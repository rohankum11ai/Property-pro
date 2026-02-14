import { Building2, FileText, AlertTriangle, TrendingUp, Clock } from 'lucide-react'

const stats = [
  { label: 'Total Units', value: '0', icon: <Building2 size={20} />, color: 'blue', sub: 'Properties' },
  { label: 'Active Leases', value: '0', icon: <FileText size={20} />, color: 'green', sub: 'Occupied' },
  { label: 'Expiring Soon', value: '0', icon: <AlertTriangle size={20} />, color: 'amber', sub: 'Next 30 days' },
  { label: 'Monthly Rent', value: '$0', icon: <TrendingUp size={20} />, color: 'purple', sub: 'Total expected' },
]

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
}

export default function LandlordDashboard() {
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
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{s.value}</p>
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
            <button className="text-xs text-blue-600 hover:underline">View all</button>
          </div>
          <div className="p-5 text-center text-slate-400 text-sm py-10">
            No leases yet. <a href="/leases" className="text-blue-600 hover:underline">Create one</a>
          </div>
        </div>

        {/* Expiring Leases */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} /> Expiring Soon
            </h2>
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">0 leases</span>
          </div>
          <div className="p-5 text-center text-slate-400 text-sm py-10">
            No leases expiring in the next 30 days
          </div>
        </div>
      </div>
    </div>
  )
}
