import api from './axiosInstance'
import type { TenantDocument } from '@/types/document'

export const getDocuments = (tenantId: number) =>
  api.get<TenantDocument[]>(`/tenants/${tenantId}/documents`).then(r => r.data)

export const uploadDocument = (tenantId: number, file: File, category: string) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  return api.post<TenantDocument>(`/tenants/${tenantId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const downloadDocument = async (tenantId: number, documentId: number, fileName: string) => {
  const response = await api.get(`/tenants/${tenantId}/documents/${documentId}/download`, {
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const deleteDocument = (tenantId: number, documentId: number) =>
  api.delete(`/tenants/${tenantId}/documents/${documentId}`)
