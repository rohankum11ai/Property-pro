import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, AlertTriangle, Home, Pencil, FileText, Upload, Download, Trash2, File } from 'lucide-react'
import { toast } from 'sonner'
import type { Tenant } from '@/types/tenant'
import type { TenantDocument } from '@/types/document'
import { getTenant, updateTenant } from '@/api/tenantApi'
import { getDocuments, uploadDocument, downloadDocument, deleteDocument } from '@/api/documentApi'
import TenantFormModal from '@/components/tenants/TenantFormModal'
import DocumentUploadModal from '@/components/tenants/DocumentUploadModal'

const categoryColors: Record<string, string> = {
  'ID Proof': 'bg-blue-50 text-blue-700',
  'Income Statement': 'bg-green-50 text-green-700',
  'Credit Score': 'bg-purple-50 text-purple-700',
  'Others': 'bg-slate-100 text-slate-600',
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Documents state
  const [documents, setDocuments] = useState<TenantDocument[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchTenant(parseInt(id))
      fetchDocuments(parseInt(id))
    }
  }, [id])

  const fetchTenant = async (tenantId: number) => {
    try {
      setLoading(true)
      const data = await getTenant(tenantId)
      setTenant(data)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async (tenantId: number) => {
    try {
      setDocsLoading(true)
      const data = await getDocuments(tenantId)
      setDocuments(data)
    } catch {
      // silently fail
    } finally {
      setDocsLoading(false)
    }
  }

  const handleSubmit = async (data: Parameters<typeof updateTenant>[1]) => {
    if (!id) return
    setSaving(true)
    try {
      const updated = await updateTenant(parseInt(id), data)
      setTenant(updated)
      setModalOpen(false)
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string; title?: string } }; message?: string }
      const msg = e?.response?.data?.message
        ?? e?.response?.data?.title
        ?? (e?.response?.status ? `Server error (${e.response.status})` : null)
        ?? e?.message
        ?? 'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (file: File, category: string) => {
    if (!id) return
    setUploading(true)
    try {
      const doc = await uploadDocument(parseInt(id), file, category)
      setDocuments(prev => [doc, ...prev])
      setUploadModalOpen(false)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (doc: TenantDocument) => {
    if (!id) return
    try {
      await downloadDocument(parseInt(id), doc.tenantDocumentId, doc.fileName)
    } catch {
      toast.error('Download failed.')
    }
  }

  const handleDeleteDocument = async (doc: TenantDocument) => {
    if (!id || !confirm(`Delete "${doc.fileName}"?`)) return
    try {
      await deleteDocument(parseInt(id), doc.tenantDocumentId)
      setDocuments(prev => prev.filter(d => d.tenantDocumentId !== doc.tenantDocumentId))
    } catch {
      toast.error('Failed to delete document.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-48 bg-white rounded-xl border border-slate-200" />
      </div>
    )
  }

  if (!tenant) return (
    <div className="text-center py-20 text-slate-400">Tenant not found.</div>
  )

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + Header */}
      <div>
        <button onClick={() => navigate('/tenants')}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm mb-3 transition">
          <ArrowLeft size={16} /> Back to Tenants
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              {tenant.firstName[0]}{tenant.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{tenant.firstName} {tenant.lastName}</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Added {new Date(tenant.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Pencil size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Mail size={16} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm text-slate-800 font-medium">{tenant.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg"><Phone size={16} className="text-blue-600" /></div>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm text-slate-800 font-medium">{tenant.phone}</p>
            </div>
          </div>
          {tenant.emergencyContact && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg"><AlertTriangle size={16} className="text-orange-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Emergency Contact</p>
                <p className="text-sm text-slate-800 font-medium">{tenant.emergencyContact}</p>
              </div>
            </div>
          )}
          {tenant.emergencyPhone && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg"><Phone size={16} className="text-orange-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Emergency Phone</p>
                <p className="text-sm text-slate-800 font-medium">{tenant.emergencyPhone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unit Assignment */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Unit Assignment</h2>
        {tenant.propertyName && tenant.unitNumber ? (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><Home size={16} className="text-green-600" /></div>
            <div>
              <p className="text-sm text-slate-800 font-medium">{tenant.propertyName} — Unit {tenant.unitNumber}</p>
              <p className="text-xs text-slate-400">Currently assigned</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Not currently assigned to any unit.</p>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <File size={14} /> Documents
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium normal-case">
              {documents.length}
            </span>
          </h2>
          <button onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition">
            <Upload size={14} /> Upload
          </button>
        </div>

        {docsLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm py-10">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {documents.map(doc => (
              <div key={doc.tenantDocumentId} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                    <FileText size={16} className="text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[doc.category] ?? categoryColors['Others']}`}>
                        {doc.category}
                      </span>
                      <span className="text-xs text-slate-400">{formatFileSize(doc.fileSize)}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString('en-CA')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button onClick={() => handleDownload(doc)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    title="Download">
                    <Download size={15} />
                  </button>
                  <button onClick={() => handleDeleteDocument(doc)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {tenant.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Notes</h2>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-50 rounded-lg"><FileText size={16} className="text-slate-500" /></div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{tenant.notes}</p>
          </div>
        </div>
      )}

      <TenantFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={tenant}
        loading={saving}
      />

      <DocumentUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
        loading={uploading}
      />
    </div>
  )
}
