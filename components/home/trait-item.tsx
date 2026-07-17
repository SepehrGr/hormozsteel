interface TraitItemProps {
  index: number
  title: string
  description: string
}

export default function TraitItem({
  index,
  title,
  description,
}: TraitItemProps) {
  const code = String(index + 1).padStart(2, '0')

  return (
    <article className='group flex h-full min-h-[11rem] flex-col bg-card px-5 py-5 transition-colors duration-200 ease-out hover:bg-muted sm:min-h-[12rem] sm:px-6 sm:py-6'>
      <span className='font-mono text-[11px] font-semibold tabular-nums tracking-wide text-amber-800 dark:text-amber-500'>
        {code}
      </span>
      <h3 className='mt-4 text-base font-semibold tracking-tight text-foreground sm:text-lg'>
        {title}
      </h3>
      <p className='mt-2 flex-1 text-sm leading-relaxed max-w-[27ch] text-muted-foreground'>
        {description}
      </p>
    </article>
  )
}
