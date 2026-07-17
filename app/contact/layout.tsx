import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact sales',
  description:
    'Request a firm steel quote — rebar, sheet, sections, pipe, and billets. Sales desk in Bandar Abbas.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className='w-full'>{children}</div>
}
