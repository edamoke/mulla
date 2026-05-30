import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/boty/cart-context'
import { AuthProvider } from '@/lib/auth-context'
import { AIChatWidget } from '@/components/ai/chat-widget'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700']
});

import { getCMSData } from "@/lib/cms-store"

export function generateMetadata(): Metadata {
  const cms = getCMSData()
  const siteIcon = cms?.branding?.site_icon || '/icon.svg'
  const isSvg = siteIcon.endsWith('.svg')

  return {
    title: 'Mulla Boutique — Luxury Fashion & Lifestyle',
    description: 'Premium fashion, furniture, imported decor, and lifestyle products in Malindi, Kenya. Experience luxury coastal living.',
    generator: 'v0.app',
    keywords: ['fashion', 'luxury', 'boutique', 'furniture', 'decor', 'Malindi', 'Kenya', 'lifestyle', 'imported'],
    icons: {
      icon: [
        {
          url: siteIcon,
          type: isSvg ? 'image/svg+xml' : 'image/png',
        },
      ],
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#F7F4EF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <AIChatWidget />
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
