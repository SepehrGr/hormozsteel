import type { ContactFormStatus, QuickOrderStatus } from '@prisma/client'
import type { PillTone } from '@/components/admin/pill'

import { capitalize } from '@/lib/format'

export type InboxStatus = QuickOrderStatus | ContactFormStatus

export const QUICK_ORDER_TONES: Record<QuickOrderStatus, PillTone> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'neutral',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export const CONTACT_TONES: Record<ContactFormStatus, PillTone> = {
  NEW: 'info',
  READ: 'neutral',
  REPLIED: 'success',
}

// Safe casts: a Record's keys are exactly the enum's values.
export const QUICK_ORDER_STATUSES = Object.keys(
  QUICK_ORDER_TONES,
) as QuickOrderStatus[]
export const CONTACT_STATUSES = Object.keys(
  CONTACT_TONES,
) as ContactFormStatus[]

const STATUS_TONES: Record<InboxStatus, PillTone> = {
  ...QUICK_ORDER_TONES,
  ...CONTACT_TONES,
}

export function statusTone(status: InboxStatus) {
  return STATUS_TONES[status]
}

export function statusLabel(status: InboxStatus) {
  return capitalize(status.toLowerCase())
}
