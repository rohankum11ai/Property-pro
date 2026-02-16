import api from './axiosInstance'
import type { Payment } from '@/types/payment'

export const getPayments = (params?: { leaseId?: number; status?: string; from?: string; to?: string }) =>
  api.get<Payment[]>('/payments', { params }).then(r => r.data)

export const getPayment = (id: number) =>
  api.get<Payment>(`/payments/${id}`).then(r => r.data)

export const createPayment = (data: {
  leaseId: number
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  status: string
  periodMonth: number
  periodYear: number
  lateFee: number
  notes?: string
}) => api.post<Payment>('/payments', data).then(r => r.data)

export const updatePayment = (id: number, data: {
  leaseId: number
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  status: string
  periodMonth: number
  periodYear: number
  lateFee: number
  notes?: string
}) => api.put<Payment>(`/payments/${id}`, data).then(r => r.data)

export const deletePayment = (id: number) =>
  api.delete(`/payments/${id}`)
