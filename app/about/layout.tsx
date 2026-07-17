import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Hormoz Steel — industrial steel supply from Bandar Abbas. Company background, product coverage, and how to order.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className='w-full'>{children}</div>
}
