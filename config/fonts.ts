import { Figtree, Geist_Mono } from 'next/font/google'

/** Primary UI font for the English portfolio demo. */
export const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

/** Monospace companion (optional use via font-mono). */
export const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
