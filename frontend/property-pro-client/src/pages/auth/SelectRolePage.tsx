import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Building2, Loader2 } from 'lucide-react'

export default function SelectRolePage() {
  const navigate = useNavigate()
  const { assignRole, isLoading } = useAuthStore()
  const [selected, setSelected] = useState<'Landlord' | 'Tenant' | null>(null)

  const roles = [
    {
      key: 'Landlord' as const,
      icon: '🏠',
      title: 'Landlord',
      description: 'Manage properties, units, leases and tenants',
      color: 'blue',
    },
    {
      key: 'Tenant' as const,
      icon: '🔑',
      title: 'Tenant',
      description: 'View your lease, pay rent and submit requests',
      color: 'emerald',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-600 text-white p-3 rounded-xl mb-3">
              <Building2 size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome to PropertyPro</h1>
            <p className="text-slate-500 text-sm mt-1">How will you use the app?</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {roles.map((role) => (
              <button
                key={role.key}
                onClick={() => setSelected(role.key)}
                className={`flex flex-col items-center p-6 border-2 rounded-xl transition text-left ${
                  selected === role.key
                    ? 'border-blue-600 bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-4xl mb-3">{role.icon}</span>
                <span className="font-semibold text-slate-800 mb-1">{role.title}</span>
                <span className="text-xs text-slate-500 text-center">{role.description}</span>
              </button>
            ))}
          </div>

          <button
            disabled={!selected || isLoading}
            onClick={() => selected && assignRole(selected, navigate)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            Continue as {selected ?? '...'}
          </button>
        </div>
      </div>
    </div>
  )
}
