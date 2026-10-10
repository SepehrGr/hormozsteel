import type { ReactNode } from 'react'
import type { InboxStatus } from '@/config/order-status'

import { statusLabel, statusTone } from '@/config/order-status'
import { cn } from '@/lib/utils'

// Tailwind only ships classes it can see written out in full.
const TONES = {
  neutral: 'border-border bg-muted text-muted-foreground',
  strong: 'border-foreground bg-foreground text-background',
  info: 'border-sky-600/30 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-950/40 dark:text-sky-100',
  success:
    'border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-100',
  warning:
    'border-amber-600/30 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100',
  danger:
    'border-red-600/30 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-100',
}

export type PillTone = keyof typeof TONES

/** Small uppercase label for a status or role. */
export function Pill({
  tone = 'neutral',
  children,
}: {
  tone?: PillTone
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        TONES[tone],
      )}
    >
      {children}
    </span>
  )
}

export function StatusPill({ status }: { status: InboxStatus }) {
  return <Pill tone={statusTone(status)}>{statusLabel(status)}</Pill>
}
