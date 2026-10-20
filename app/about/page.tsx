import type { Metadata } from 'next'

import {
  Coverage,
  Masthead,
  Ordering,
  QuoteChecklist,
  TrackRecord,
} from '@/components/about/about-sections'
import CtaStrip from '@/components/content/cta-strip'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Hormoz Steel. Building since 1993, trading mill products since 2019. How we quote steel and what sales needs to price a package.',
}

/**
 * About — masthead plate, a dated track record, and the section chart of what
 * we quote. Board tokens throughout; the profiles are the only drawn element.
 */
export default function AboutPage() {
  return (
    <div className='w-full'>
      <Masthead />
      <TrackRecord />
      <Coverage />
      <Ordering />
      <QuoteChecklist />
      <CtaStrip
        body='Browse live unit rates or send specs to sales for a firm quote.'
        primary={{ href: '/products', label: 'Browse catalog' }}
        secondary={{ href: '/contact', label: 'Contact sales' }}
        title='Ready to price a package?'
      />
    </div>
  )
}
