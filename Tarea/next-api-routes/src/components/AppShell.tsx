'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { BookMarked, LayoutDashboard, Library, Search } from 'lucide-react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/books', label: 'Catálogo de libros', icon: Search },
]

type Variant = 'sidebar' | 'mobile'

const isActive = (pathname: string | null, href: string) =>
  !!pathname && (href === '/' ? pathname === '/' || pathname.startsWith('/authors') : pathname.startsWith(href))

function NavItems({ pathname, variant }: { pathname: string | null; variant: Variant }) {
  if (variant === 'mobile') {
    return NAV.map(({ href, icon: Icon, label }) => (
      <Link
        key={href}
        href={href}
        aria-label={label}
        className={`grid size-9 place-items-center rounded-lg ${
          isActive(pathname, href) ? 'bg-brand-600 text-white' : 'text-ink-2 hover:bg-canvas'
        }`}
      >
        <Icon className="size-[18px]" />
      </Link>
    ))
  }

  return NAV.map(({ href, label, icon: Icon }) => {
    const active = isActive(pathname, href)
    return (
      <Link
        key={href}
        href={href}
        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          active ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-active"
            className="absolute inset-0 rounded-lg bg-white/10 ring-1 ring-white/10"
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
        )}
        <Icon className="relative size-[18px]" />
        <span className="relative">{label}</span>
      </Link>
    )
  })
}

// usePathname() se lee dentro de <Suspense> para no bloquear el prerenderizado (Next.js 16)
function ActiveNav({ variant }: { variant: Variant }) {
  return <NavItems pathname={usePathname()} variant={variant} />
}

function Nav({ variant }: { variant: Variant }) {
  return (
    <Suspense fallback={<NavItems pathname={null} variant={variant} />}>
      <ActiveNav variant={variant} />
    </Suspense>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-screen flex-col bg-sidebar text-white lg:flex">
        <Link href="/" className="flex items-center gap-3 px-6 py-6">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-black/30">
            <Library className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl">Biblioteca</span>
            <span className="block text-xs tracking-wide text-white/50">Sistema de gestión</span>
          </span>
        </Link>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">Menú</p>
          <Nav variant="sidebar" />
        </nav>

        <div className="m-4 mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookMarked className="size-4 text-brand-100" /> API Routes + Prisma
          </div>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Next.js App Router conectado a PostgreSQL en Supabase.
          </p>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white">
          <Library className="size-4" />
        </span>
        <span className="font-display text-lg">Biblioteca</span>
        <nav className="ml-auto flex gap-1">
          <Nav variant="mobile" />
        </nav>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>
    </div>
  )
}
