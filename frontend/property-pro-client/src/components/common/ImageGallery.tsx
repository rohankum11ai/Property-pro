import { useState, useEffect, useRef, useCallback } from 'react'
import { ImagePlus, Trash2, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import type { PropertyImage } from '@/types/image'
import { getImageBlob, deleteImage } from '@/api/imageApi'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface Props {
  images: PropertyImage[]
  maxImages: number
  maxSizeMB: number
  onUpload: (file: File) => Promise<PropertyImage>
  onDeleted: (imageId: number) => void
}

export default function ImageGallery({ images, maxImages, maxSizeMB, onUpload, onDeleted }: Props) {
  const [blobUrls, setBlobUrls] = useState<Record<number, string>>({})
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set())
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const blobUrlsRef = useRef<Record<number, string>>({})

  // Load blob URLs for all images
  useEffect(() => {
    const imageIds = images.map(i => i.propertyImageId)
    const toLoad = imageIds.filter(id => !blobUrls[id] && !loadingIds.has(id))

    if (toLoad.length === 0) return

    setLoadingIds(prev => {
      const next = new Set(prev)
      toLoad.forEach(id => next.add(id))
      return next
    })

    toLoad.forEach(async (id) => {
      try {
        const url = await getImageBlob(id)
        blobUrlsRef.current[id] = url
        setBlobUrls(prev => ({ ...prev, [id]: url }))
      } catch {
        // silently fail for individual image loads
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    })
  }, [images])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed')
      return
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`)
      return
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    try {
      await onUpload(file)
      toast.success('Image uploaded')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: number) => {
    setDeletingId(imageId)
    try {
      await deleteImage(imageId)
      // Revoke blob URL
      if (blobUrlsRef.current[imageId]) {
        URL.revokeObjectURL(blobUrlsRef.current[imageId])
        delete blobUrlsRef.current[imageId]
      }
      setBlobUrls(prev => {
        const next = { ...prev }
        delete next[imageId]
        return next
      })
      onDeleted(imageId)
      // If lightbox was showing the deleted image, close it
      if (lightboxIndex !== null) {
        const deletedIdx = images.findIndex(i => i.propertyImageId === imageId)
        if (deletedIdx === lightboxIndex) setLightboxIndex(null)
        else if (deletedIdx < lightboxIndex) setLightboxIndex(lightboxIndex - 1)
      }
      toast.success('Image deleted')
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxIndex === null) return
    if (e.key === 'Escape') setLightboxIndex(null)
    if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev)
    if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null && prev < images.length - 1 ? prev + 1 : prev)
  }, [lightboxIndex, images.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const atMax = images.length >= maxImages

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.propertyImageId}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group cursor-pointer"
            onClick={() => setLightboxIndex(idx)}
          >
            {blobUrls[img.propertyImageId] ? (
              <img
                src={blobUrls[img.propertyImageId]}
                alt={img.fileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            )}
            {/* Delete overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-start justify-end p-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(img.propertyImageId) }}
                disabled={deletingId === img.propertyImageId}
                className="p-1.5 bg-white/90 hover:bg-red-50 rounded-lg shadow-sm transition"
              >
                {deletingId === img.propertyImageId
                  ? <Loader2 size={14} className="animate-spin text-red-500" />
                  : <Trash2 size={14} className="text-red-500" />}
              </button>
            </div>
          </div>
        ))}

        {/* Upload dropzone */}
        {!atMax && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 transition disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <ImagePlus size={24} />
            )}
            <span className="text-xs font-medium">
              {uploading ? 'Uploading...' : 'Add Image'}
            </span>
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-2">
        {images.length}/{maxImages} images &middot; JPG, PNG, WebP up to {maxSizeMB}MB
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setLightboxIndex(null)}>
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={24} />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 p-2 text-white/70 hover:text-white transition"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {lightboxIndex < images.length - 1 && (
            <button
              className="absolute right-4 p-2 text-white/70 hover:text-white transition"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
            >
              <ChevronRight size={32} />
            </button>
          )}
          <div className="max-w-[90vw] max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {blobUrls[images[lightboxIndex].propertyImageId] ? (
              <img
                src={blobUrls[images[lightboxIndex].propertyImageId]}
                alt={images[lightboxIndex].fileName}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            ) : (
              <Loader2 size={32} className="animate-spin text-white" />
            )}
            <p className="text-center text-white/60 text-sm mt-2">
              {images[lightboxIndex].fileName} &middot; {lightboxIndex + 1} of {images.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
