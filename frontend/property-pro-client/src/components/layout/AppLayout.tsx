import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Building2, LayoutDashboard, FileText, Users, Home,
  Wrench, CreditCard, LogOut, Menu, X, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['Landlord', 'Admin'] },
  { label: 'Dashboard', to: '/tenant/dashboard', icon: <LayoutDashboard size={18} />, roles: ['Tenant'] },
  { label: 'Properties', to: '/properties', icon: <Home size={18} />, roles: ['Landlord'] },
  { label: 'Leases', to: '/leases', icon: <FileText size={18} />, roles: ['Landlord'] },
  { label: 'Tenants', to: '/tenants', icon: <Users size={18} />, roles: ['Landlord'] },
  { label: 'My Lease', to: '/my-lease', icon: <FileText size={18} />, roles: ['Tenant'] },
  { label: 'Maintenance', to: '/maintenance', icon: <Wrench size={18} />, roles: ['Landlord', 'Tenant'] },
  { label: 'Payments', to: '/payments', icon: <CreditCard size={18} />, roles: ['Landlord', 'Tenant'] },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileOpen, setProfileOpen] = useState(false)

  const visibleNav = navItems.filter((item) =>
    item.roles.some((r) => user?.roles.includes(r))
  )

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-slate-900 text-white flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="bg-blue-600 p-2 rounded-lg shrink-0">
            <Building2 size={18} />
          </div>
          {sidebarOpen && <span className="font-bold text-lg">PropertyPro</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-slate-700 p-3">
          <button
            onClick={() => logout(navigate)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 w-full text-sm transition"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-800 transition"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.firstName?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-medium">{user?.firstName}</span>
              <ChevronDown size={14} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40 z-50">
                <div className="px-4 py-2 text-xs text-slate-500 border-b">
                  {user?.roles.join(', ')}
                </div>
                <button
                  onClick={() => { logout(navigate); setProfileOpen(false) }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
