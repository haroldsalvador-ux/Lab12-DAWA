'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { hue, initials } from '@/lib/format'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-700',
  secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-canvas',
  ghost: 'text-ink-2 hover:bg-canvas hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

// Clases de botón reutilizables también en enlaces (<Link className={buttonClass()} />)
export function buttonClass(variant: keyof typeof VARIANTS = 'primary', size: 'sm' | 'md' = 'md') {
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${
    size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm'
  } ${VARIANTS[variant]}`
}

export function Button({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${buttonClass(variant, size)} ${className}`}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

export function IconButton({ label, tone = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; tone?: 'default' | 'danger' }) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      className={`grid size-8 place-items-center rounded-lg text-ink-3 transition-colors ${
        tone === 'danger' ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-brand-50 hover:text-brand-700'
      }`}
    />
  )
}

export function Card({ className = '', children, delay = 0 }: { className?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-line bg-surface shadow-card ${className}`}
    >
      {children}
    </motion.section>
  )
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-7 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl leading-tight text-ink sm:text-[38px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.header>
  )
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const h = hue(name)
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(140deg, hsl(${h} 55% 48%), hsl(${(h + 40) % 360} 60% 36%))`,
      }}
    >
      {initials(name)}
    </span>
  )
}

export function GenreBadge({ genre }: { genre: string | null }) {
  if (!genre) return <span className="text-xs text-ink-3">Sin género</span>
  const h = hue(genre)
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: `hsl(${h} 70% 95%)`, color: `hsl(${h} 55% 30%)` }}
    >
      {genre}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`skeleton block ${className}`} />
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: React.ElementType; title: string; text: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center"
    >
      <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-2">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

// Número animado de 0 al valor final cuando entra en pantalla
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (!inView) return
    // Anima desde el último valor mostrado (0 la primera vez)
    const controls = animate(from.current, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => { from.current = value },
    })
    return () => controls.stop()
  }, [inView, value])

  return <span ref={ref}>{new Intl.NumberFormat('es-PE').format(display)}</span>
}

export function Field({ label, error, hint, children, className = '' }: { label: string; error?: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-3">{hint}</span>
      ) : null}
    </label>
  )
}
