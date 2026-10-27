import '@/styles/globals.css'
import '@/styles/icomoon.css'
import 'leaflet/dist/leaflet.css'
import { Metadata, Viewport } from 'next'
import clsx from 'clsx'

import { Providers } from './providers'

import { siteConfig } from '@/config/site'
import { figtree, geistMono } from '@/config/fonts'
import { ConditionalLayout } from '@/components/layout/conditional-layout'

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0c' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      suppressHydrationWarning
      className={clsx(figtree.variable, geistMono.variable)}
      lang='en'
    >
      <head />
      <body
        className={clsx(
          'min-h-screen bg-background font-sans text-foreground antialiased',
          figtree.className,
        )}
      >
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  )
}
