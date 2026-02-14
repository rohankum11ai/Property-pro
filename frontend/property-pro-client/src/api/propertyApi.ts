import api from './axiosInstance'
import type { Property, Unit } from '@/types/property'

// ── Properties ────────────────────────────────────────────────────────────────

export const getProperties = () =>
  api.get<Property[]>('/properties').then(r => r.data)

export const getProperty = (id: number) =>
  api.get<Property>(`/properties/${id}`).then(r => r.data)

export const createProperty = (data: Omit<Property, 'propertyId' | 'createdAt' | 'totalUnits' | 'availableUnits' | 'occupiedUnits'>) =>
  api.post<Property>('/properties', data).then(r => r.data)

export const updateProperty = (id: number, data: Omit<Property, 'propertyId' | 'createdAt' | 'totalUnits' | 'availableUnits' | 'occupiedUnits'>) =>
  api.put<Property>(`/properties/${id}`, data).then(r => r.data)

export const deleteProperty = (id: number) =>
  api.delete(`/properties/${id}`)

// ── Units ─────────────────────────────────────────────────────────────────────

export const getUnits = (propertyId: number) =>
  api.get<Unit[]>(`/properties/${propertyId}/units`).then(r => r.data)

export const createUnit = (propertyId: number, data: Omit<Unit, 'unitId' | 'propertyId' | 'propertyName' | 'createdAt' | 'status'>) =>
  api.post<Unit>(`/properties/${propertyId}/units`, data).then(r => r.data)

export const updateUnit = (propertyId: number, unitId: number, data: Omit<Unit, 'unitId' | 'propertyId' | 'propertyName' | 'createdAt'>) =>
  api.put<Unit>(`/properties/${propertyId}/units/${unitId}`, data).then(r => r.data)

export const deleteUnit = (propertyId: number, unitId: number) =>
  api.delete(`/properties/${propertyId}/units/${unitId}`)
