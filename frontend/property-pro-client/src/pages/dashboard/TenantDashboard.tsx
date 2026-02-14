import { FileText, CreditCard, Wrench, Bell } from 'lucide-react'

export default function TenantDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Your tenancy overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Lease', icon: <FileText size={24} />, color: 'blue', to: '/my-lease' },
          { label: 'Pay Rent', icon: <CreditCard size={24} />, color: 'green', to: '/payments' },
          { label: 'Maintenance', icon: <Wrench size={24} />, color: 'amber', to: '/maintenance' },
          { label: 'Notices', icon: <Bell size={24} />, color: 'purple', to: '/notices' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.to}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition"
          >
            <div className={`p-3 rounded-xl bg-${action.color}-100 text-${action.color}-600`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-slate-700">{action.label}</span>
          </a>
        ))}
      </div>

      {/* Lease Summary */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <FileText size={16} /> Lease Summary
        </h2>
        <div className="text-center text-slate-400 text-sm py-8">
          No active lease found. Contact your landlord.
        </div>
      </div>
    </div>
  )
}
