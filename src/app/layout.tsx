import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MetaAudit — AI-Powered Facebook Ads Audit',
  description:
    'Get a deep 5-layer audit of your Meta ads account in minutes. Money Model · Signal · Structure · Creative · Bid/Budget. Powered by AmraniAds.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">
            Meta<span className="text-blue-600">Audit</span>
          </span>
          <a
            href="/audit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Get Your Audit — 499 MAD
          </a>
        </nav>
        {children}
      </body>
    </html>
  )
}
