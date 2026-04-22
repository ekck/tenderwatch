import type { Metadata } from 'next'
import { Playfair_Display, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { GlobalAds } from '@/components/ads/AdSlot'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const ibmSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://tenderwatch.co.ke'),
  title: {
    default: 'TenderWatch Kenya — Public Procurement Tracker',
    template: '%s | TenderWatch Kenya',
  },
  description: 'Track Kenya government tenders, contract awards, and procurement spending across all ministries and county governments. Data sourced from PPIP (tenders.go.ke).',
  keywords: ['Kenya tenders', 'government procurement Kenya', 'PPIP tenders', 'public contracts Kenya', 'county government tenders'],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://tenderwatch.zanah.co.ke',
    siteName: 'TenderWatch Kenya',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${ibmSans.variable} ${ibmMono.variable}`}>
      <body className="font-body bg-cream text-ink">
        <GlobalAds />
        <Header />
        <main className="min-h-screen relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
