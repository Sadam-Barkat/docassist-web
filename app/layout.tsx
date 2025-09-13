import type React from "react"
import { Suspense, lazy } from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import "./globals.css"

// Lazy load heavy components
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })))

export const metadata: Metadata = {
  title: "DocCare - Doctor Appointment Booking System",
  description: "Professional healthcare appointment booking platform. Book appointments with qualified doctors easily and securely.",
  generator: "DocCare",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/medical-icon.svg', sizes: 'any', type: 'image/svg+xml' }
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
            <Suspense fallback={null}>
              <ChatbotWidget />
            </Suspense>
          </AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
