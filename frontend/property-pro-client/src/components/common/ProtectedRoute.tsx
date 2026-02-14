import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />

  if (allowedRoles && user && !allowedRoles.some((r) => user.roles.includes(r))) {
    if (user.roles.includes('Landlord')) return <Navigate to="/dashboard" replace />
    if (user.roles.includes('Tenant')) return <Navigate to="/tenant/dashboard" replace />
    return <Navigate to="/onboarding/select-role" replace />
  }

  return <>{children}</>
}
