import { useState, useRef } from 'react'
import { X, Loader2, Upload } from 'lucide-react'
import { DOCUMENT_CATEGORIES } from '@/types/document'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

const ALLOWED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.docx,.doc'
const MAX_SIZE = 25 * 1024 * 1024

interface Props {
  open: boolean
  onClose: () => void
  onUpload: (file: File, category: string) => Promise<void>
  loading?: boolean
}

export default function DocumentUploadModal({ open, onClose, onUpload, loading }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState(DOCUMENT_CATEGORIES[0])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('File type not allowed. Accepted: PDF, JPG, PNG, DOCX, DOC.')
      return
    }
    if (selected.size > MAX_SIZE) {
      setError('File size exceeds the 25 MB limit.')
      return
    }
    setFile(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    await onUpload(file, category)
    setFile(null)
    setCategory(DOCUMENT_CATEGORIES[0])
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    setFile(null)
    setError(null)
    setCategory(DOCUMENT_CATEGORIES[0])
    if (inputRef.current) inputRef.current.value = ''
    onClose()
  }

  if (!open) return null

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Upload Document</h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              {DOCUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">File</label>
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition">
              <Upload size={24} className="mx-auto text-slate-400 mb-2" />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500">Click to select a file</p>
                  <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, PNG, DOCX, DOC — Max 25 MB</p>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept={ALLOWED_EXTENSIONS}
              onChange={handleFileChange} className="hidden" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
              Cancel
            </button>
            <button type="submit" disabled={loading || !file}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
