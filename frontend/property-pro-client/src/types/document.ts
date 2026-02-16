export interface TenantDocument {
  tenantDocumentId: number
  tenantId: number
  fileName: string
  category: string
  fileSize: number
  contentType: string
  createdAt: string
}

export const DOCUMENT_CATEGORIES = ['ID Proof', 'Income Statement', 'Credit Score', 'Others'] as const
