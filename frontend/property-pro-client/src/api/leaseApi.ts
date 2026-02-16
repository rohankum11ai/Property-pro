import api from './axiosInstance'
import type { Lease } from '@/types/lease'
import type { Payment } from '@/types/payment'

export const getLeases = (search?: string, status?: string) =>
  api.get<Lease[]>('/leases', { params: { ...(search ? { search } : {}), ...(status ? { status } : {}) } }).then(r => r.data)

export const getLease = (id: number) =>
  api.get<Lease>(`/leases/${id}`).then(r => r.data)

export const createLease = (data: {
  tenantId: number
  unitId: number
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  paymentFrequency: string
  notes?: string
}) => api.post<Lease>('/leases', data).then(r => r.data)

export const updateLease = (id: number, data: {
  tenantId: number
  unitId: number
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  paymentFrequency: string
  notes?: string
}) => api.put<Lease>(`/leases/${id}`, data).then(r => r.data)

export const deleteLease = (id: number) =>
  api.delete(`/leases/${id}`)

export const changeLeaseStatus = (id: number, status: string) =>
  api.post<Lease>(`/leases/${id}/status`, { status }).then(r => r.data)

export const getLeasePayments = (leaseId: number) =>
  api.get<Payment[]>(`/leases/${leaseId}/payments`).then(r => r.data)
