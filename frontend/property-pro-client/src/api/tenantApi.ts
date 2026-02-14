import api from './axiosInstance'
import type { Tenant } from '@/types/tenant'

export const getTenants = (search?: string) =>
  api.get<Tenant[]>('/tenants', { params: search ? { search } : {} }).then(r => r.data)

export const getTenant = (id: number) =>
  api.get<Tenant>(`/tenants/${id}`).then(r => r.data)

export const createTenant = (data: Omit<Tenant, 'tenantId' | 'createdAt' | 'unitNumber' | 'propertyId' | 'propertyName'>) =>
  api.post<Tenant>('/tenants', data).then(r => r.data)

export const updateTenant = (id: number, data: Omit<Tenant, 'tenantId' | 'createdAt' | 'unitNumber' | 'propertyId' | 'propertyName'>) =>
  api.put<Tenant>(`/tenants/${id}`, data).then(r => r.data)

export const deleteTenant = (id: number) =>
  api.delete(`/tenants/${id}`)
