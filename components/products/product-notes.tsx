import type { LucideIcon } from 'lucide-react'

import { Calculator, CheckCircle2, FileText, Wrench } from 'lucide-react'

const headingClass =
  'mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'

function NoteList({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon
  title: string
  items: string[]
}) {
  return (
    <section>
      <h3 className={headingClass}>
        <Icon className='h-4 w-4 text-amber-800 dark:text-amber-500' />
        {title}
      </h3>
      <ul className='space-y-2 text-sm leading-relaxed text-muted-foreground'>
        {items.map(item => (
          <li key={item} className='flex gap-2'>
            <span className='mt-2 h-1 w-1 shrink-0 rounded-full bg-border' />
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Notes, typical uses and specs under a sub-line's pricing board. */
export default function ProductNotes({
  features,
  applications,
  specifications,
}: {
  features: string[]
  applications: string[]
  specifications: Record<string, string>
}) {
  return (
    <>
      <div className='mt-12 grid grid-cols-1 gap-8 border-t border-border pt-10 lg:grid-cols-3'>
        <NoteList icon={CheckCircle2} items={features} title='Product notes' />
        <NoteList icon={Wrench} items={applications} title='Typical use' />
        <section>
          <h3 className={headingClass}>
            <FileText className='h-4 w-4 text-amber-800 dark:text-amber-500' />
            Specs
          </h3>
          <dl className='divide-y divide-border border border-border bg-card'>
            {Object.entries(specifications).map(([key, value]) => (
              <div
                key={key}
                className='flex justify-between gap-4 px-3 py-2 text-sm'
              >
                <dt className='text-muted-foreground'>{key}</dt>
                <dd className='text-right font-medium text-foreground'>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <p className='mt-8 flex items-start gap-2 text-xs text-muted-foreground'>
        <Calculator className='mt-0.5 h-3.5 w-3.5 shrink-0' />
        Prices are demo unit rates in USD. Use the calculator action on a row
        for weight estimates where available.
      </p>
    </>
  )
}
