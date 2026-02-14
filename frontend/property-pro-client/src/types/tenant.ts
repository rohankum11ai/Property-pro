export interface Tenant {
  tenantId: number
  firstName: string
  lastName: string
  email: string
  phone: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
  unitId?: number
  unitNumber?: string
  propertyId?: number
  propertyName?: string
  createdAt: string
}
