export interface LeaseActivity {
  leaseActivityId: number
  oldStatus: string
  newStatus: string
  changedAt: string
}

export interface Lease {
  leaseId: number
  tenantId: number
  tenantFirstName: string
  tenantLastName: string
  tenantEmail: string
  unitId: number
  unitNumber: string
  propertyId: number
  propertyName: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  paymentFrequency: string
  status: LeaseStatus
  notes?: string
  createdAt: string
  activities: LeaseActivity[]
}

export type LeaseStatus = 'Active' | 'Month-to-Month' | 'Terminated' | 'Pending'

export const LEASE_STATUSES: LeaseStatus[] = ['Active', 'Pending', 'Month-to-Month', 'Terminated']
