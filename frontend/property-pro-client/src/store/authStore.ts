import { create } from 'zustand'
import type { User } from '@/types/auth'
import api from '@/api/axiosInstance'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  loginWithGoogle: (idToken: string, navigate: (path: string) => void) => Promise<void>
  loginWithEmail: (email: string, password: string, navigate: (path: string) => void) => Promise<void>
  register: (data: RegisterData, navigate: (path: string) => void) => Promise<void>
  assignRole: (role: string, navigate: (path: string) => void) => Promise<void>
  logout: (navigate: (path: string) => void) => Promise<void>
  initFromStorage: () => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}

const redirectByRole = (roles: string[], navigate: (path: string) => void, needsRoleSelection: boolean) => {
  if (needsRoleSelection) return navigate('/onboarding/select-role')
  if (roles.includes('Landlord')) return navigate('/dashboard')
  if (roles.includes('Tenant')) return navigate('/tenant/dashboard')
  navigate('/onboarding/select-role')
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  initFromStorage: () => {
    const token = localStorage.getItem('token')
    const firstName = localStorage.getItem('firstName') || ''
    const roles = JSON.parse(localStorage.getItem('roles') || '[]')
    const avatarUrl = localStorage.getItem('avatarUrl') || undefined
    if (token) set({ user: { firstName, roles, avatarUrl }, token })
  },

  loginWithGoogle: async (idToken, navigate) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/google', { idToken })
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('firstName', data.firstName)
      localStorage.setItem('roles', JSON.stringify(data.roles))
      if (data.avatarUrl) localStorage.setItem('avatarUrl', data.avatarUrl)
      set({ user: { firstName: data.firstName, roles: data.roles, avatarUrl: data.avatarUrl }, token: data.token })
      redirectByRole(data.roles, navigate, data.needsRoleSelection)
    } finally {
      set({ isLoading: false })
    }
  },

  loginWithEmail: async (email, password, navigate) => {
    set({ isLoading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('firstName', data.firstName)
      localStorage.setItem('roles', JSON.stringify(data.roles))
      set({ user: { firstName: data.firstName, roles: data.roles }, token: data.token })
      redirectByRole(data.roles, navigate, data.needsRoleSelection)
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (data, navigate) => {
    set({ isLoading: true })
    try {
      const { data: res } = await api.post('/auth/register', data)
      localStorage.setItem('token', res.token)
      localStorage.setItem('refreshToken', res.refreshToken)
      localStorage.setItem('firstName', res.firstName)
      localStorage.setItem('roles', JSON.stringify(res.roles))
      set({ user: { firstName: res.firstName, roles: res.roles }, token: res.token })
      redirectByRole(res.roles, navigate, res.needsRoleSelection)
    } finally {
      set({ isLoading: false })
    }
  },

  assignRole: async (role, navigate) => {
    await api.post('/auth/assign-role', { role })
    const roles = [role]
    localStorage.setItem('roles', JSON.stringify(roles))
    const user = get().user
    if (user) set({ user: { ...user, roles } })
    redirectByRole(roles, navigate, false)
  },

  logout: async (navigate) => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken }).catch(() => {})
    }
    localStorage.clear()
    set({ user: null, token: null })
    navigate('/login')
  },
}))
