export interface PropertyImage {
  propertyImageId: number
  propertyId: number | null
  unitId: number | null
  fileName: string
  contentType: string
  fileSize: number
  sortOrder: number
  createdAt: string
}
