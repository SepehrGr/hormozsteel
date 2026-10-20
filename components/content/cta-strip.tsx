import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CtaLink {
  href: string
  label: string
}

/** Closing band of a public page: a question, a line of help, two next steps. */
export default function CtaStrip({
  title,
  body,
  primary,
  secondary,
}: {
  title: string
  body: string
  primary: CtaLink
  secondary: CtaLink
}) {
  return (
    <section className='border-b border-border bg-muted/30'>
      <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-14'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
            {title}
          </h2>
          <p className='mt-2 max-w-lg text-sm text-muted-foreground'>{body}</p>
        </div>
        <div className='flex flex-wrap gap-3'>
          <Link
            className='inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity duration-200 ease-out hover:opacity-90'
            href={primary.href}
          >
            {primary.label}
            <ArrowRight className='h-4 w-4' />
          </Link>
          <Link
            className='inline-flex items-center border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-200 ease-out hover:bg-muted'
            href={secondary.href}
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
