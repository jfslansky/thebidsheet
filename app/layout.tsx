import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Bid Sheet — Greek Life, Rush Season & Chapter News',
  description: 'Your source for Greek life, sorority rush, bid day, and campus chapter news at Big 10, SEC, and ACC schools.',
  openGraph: {
    title: 'The Bid Sheet',
    description: 'Greek life, rush season, and everything in between.',
    type: 'website',
    url: 'https://thebidsheet.com',
    images: [{ url: 'https://thebidsheet.com/opengraph-image', width: 1200, height: 630, alt: 'The Bid Sheet' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Bid Sheet',
    description: 'Greek life, rush season, and everything in between.',
    images: ['https://thebidsheet.com/opengraph-image'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6234356615359295"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
