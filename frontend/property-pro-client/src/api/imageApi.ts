import api from './axiosInstance'
import type { PropertyImage } from '@/types/image'

export const getPropertyImages = (propertyId: number) =>
  api.get<PropertyImage[]>(`/properties/${propertyId}/images`).then(r => r.data)

export const getUnitImages = (unitId: number) =>
  api.get<PropertyImage[]>(`/units/${unitId}/images`).then(r => r.data)

export const uploadPropertyImage = (propertyId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<PropertyImage>(`/properties/${propertyId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const uploadUnitImage = (unitId: number, file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<PropertyImage>(`/units/${unitId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const getImageBlob = async (imageId: number): Promise<string> => {
  const response = await api.get(`/images/${imageId}`, { responseType: 'blob' })
  return URL.createObjectURL(response.data)
}

export const deleteImage = (imageId: number) =>
  api.delete(`/images/${imageId}`)
