export interface Payment {
  paymentId: number
  leaseId: number
  tenantId: number
  tenantFirstName: string
  tenantLastName: string
  unitId: number
  unitNumber: string
  propertyName: string
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  status: PaymentStatus
  periodMonth: number
  periodYear: number
  lateFee: number
  notes?: string
  receiptNumber: string
  createdAt: string
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Late' | 'Pending'
export const PAYMENT_STATUSES: PaymentStatus[] = ['Paid', 'Partial', 'Late', 'Pending']

export type PaymentMethod = 'E-Transfer' | 'Cash' | 'Cheque' | 'Bank Transfer' | 'Credit Card' | 'Other'
export const PAYMENT_METHODS: PaymentMethod[] = ['E-Transfer', 'Cash', 'Cheque', 'Bank Transfer', 'Credit Card', 'Other']

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
