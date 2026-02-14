export interface AuthResponse {
  success: boolean
  error?: string
  token?: string
  refreshToken?: string
  firstName?: string
  avatarUrl?: string
  roles: string[]
  needsRoleSelection: boolean
}

export interface User {
  firstName: string
  avatarUrl?: string
  roles: string[]
}

export type UserRole = 'Landlord' | 'Tenant' | 'Admin'
