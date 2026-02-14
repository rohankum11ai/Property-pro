export interface Property {
  propertyId: number
  name: string
  address: string
  city: string
  province: string
  postalCode: string
  propertyType: string
  createdAt: string
  totalUnits: number
  availableUnits: number
  occupiedUnits: number
}

export interface Unit {
  unitId: number
  propertyId: number
  propertyName: string
  unitNumber: string
  bedrooms: number
  bathrooms: number
  rentAmount: number
  squareFeet?: number
  status: 'Available' | 'Occupied' | 'UnderMaintenance'
  createdAt: string
}

export type PropertyType =
  | 'House'
  | 'Townhouse - Freehold'
  | 'Townhouse - Condo'
  | 'Condo Apartment'
  | 'Rental Apartment'
  | 'Multiplex'
  | 'Basement Apartment'
  | 'Room Rental'

export const PROPERTY_TYPES: PropertyType[] = [
  'House',
  'Townhouse - Freehold',
  'Townhouse - Condo',
  'Condo Apartment',
  'Rental Apartment',
  'Multiplex',
  'Basement Apartment',
  'Room Rental',
]

export const MULTI_UNIT_TYPES: PropertyType[] = [
  'Rental Apartment',
  'Multiplex',
  'Room Rental',
]

export const isMultiUnit = (type: string) =>
  MULTI_UNIT_TYPES.includes(type as PropertyType)

export type UnitStatus = 'Available' | 'Occupied' | 'UnderMaintenance'
