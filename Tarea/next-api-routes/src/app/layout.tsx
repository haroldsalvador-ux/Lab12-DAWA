import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/AppShell'
import { HashScroll } from '@/components/HashScroll'
import './globals.css'

// Fuentes locales (no dependen de fonts.googleapis.com al compilar)
const newsreader = localFont({
  variable: '--font-newsreader',
  display: 'swap',
  src: [
    { path: './fonts/newsreader-latin-wght-normal.woff2', weight: '200 800', style: 'normal' },
    { path: './fonts/newsreader-latin-wght-italic.woff2', weight: '200 800', style: 'italic' },
  ],
})

export const metadata: Metadata = {
  title: { default: 'Biblioteca · Panel', template: '%s · Biblioteca' },
  description: 'Sistema de biblioteca con API Routes de Next.js, Prisma y Supabase',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable} ${newsreader.variable}`}>
      <body className="font-sans antialiased">
        <AppShell>{children}</AppShell>
        <HashScroll />
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}
