import Link from 'next/link'
import { productCategoryHref } from '@/types/products'

/**
 * Category index cell — market-board style (not a marketing card).
 * Uses semantic theme tokens so light/dark stay consistent.
 */
export default function HeroItem({
  label,
  icon,
  categoryId,
  lineCount,
}: {
  label: string
  icon: string
  categoryId: string
  lineCount?: number
}) {
  const code = categoryId.toUpperCase()

  return (
    <Link
      href={productCategoryHref(categoryId)}
      className='group relative flex h-full min-h-[7.5rem] flex-col justify-between overflow-hidden bg-card px-4 py-4 text-left transition-colors duration-200 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[8.5rem] sm:px-5 sm:py-5'
    >
      {/* Soft watermark icon — functional identity, not a gradient badge */}
      <i
        className={`${icon} pointer-events-none absolute -right-1 bottom-1 text-[4.5rem] leading-none text-foreground/[0.04] transition-colors duration-200 ease-out group-hover:text-foreground/[0.07] dark:text-foreground/[0.06] dark:group-hover:text-foreground/[0.1]`}
        aria-hidden
      />

      <div className='relative z-[1] flex items-start justify-between gap-2'>
        <span className='font-mono text-[10px] font-medium tracking-[0.16em] text-muted-foreground transition-colors duration-200 ease-out group-hover:text-amber-800 dark:group-hover:text-amber-500'>
          {code}
        </span>
        <span
          className='mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border transition-colors duration-200 ease-out group-hover:bg-amber-700 dark:group-hover:bg-amber-500'
          aria-hidden
        />
      </div>

      <div className='relative z-[1] mt-auto'>
        <span className='block text-base font-semibold tracking-tight text-foreground sm:text-lg'>
          {label}
        </span>
        <span className='mt-1 flex items-center gap-1.5 text-xs text-muted-foreground'>
          <span className='tabular-nums'>
            {lineCount != null ? `${lineCount} sub-lines` : 'Open board'}
          </span>
          <span
            className='translate-x-0 opacity-0 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:opacity-100'
            aria-hidden
          >
            →
          </span>
        </span>
      </div>
    </Link>
  )
}
