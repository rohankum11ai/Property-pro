import type { UnitStatus } from '@/types/property'
import { cn } from '@/lib/utils'

const config: Record<UnitStatus, { label: string; className: string }> = {
  Available:        { label: 'Available',         className: 'bg-green-100 text-green-700' },
  Occupied:         { label: 'Occupied',           className: 'bg-blue-100 text-blue-700' },
  UnderMaintenance: { label: 'Under Maintenance',  className: 'bg-amber-100 text-amber-700' },
}

export default function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const { label, className } = config[status] ?? config.Available
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  )
}
