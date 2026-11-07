'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { BookOpen, Eye, FileText, Layers, Library, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { number } from '@/lib/format'
import type { Author, LibraryStats } from '@/lib/types'
import { AuthorForm } from '@/components/AuthorForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Modal } from '@/components/Modal'
import { Avatar, Button, buttonClass, Card, CountUp, EmptyState, GenreBadge, IconButton, PageHeader, Skeleton } from '@/components/ui'

export default function DashboardPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Dashboard />
    </Suspense>
  )
}

function Dashboard() {
  // Enlaces directos: /?nuevo=1, /?editar=<id>, /?eliminar=<id>
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const deepLink = useRef(true)

  const [authors, setAuthors] = useState<Author[] | null>(null)
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Author | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Author | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  // Cada cambio de "version" vuelve a consultar la API (después de crear, editar o eliminar)
  const [version, setVersion] = useState(0)
  const load = () => setVersion((v) => v + 1)

  useEffect(() => {
    let alive = true
    Promise.all([api<Author[]>('/api/authors'), api<LibraryStats>('/api/stats')])
      .then(([a, s]) => {
        if (!alive) return
        setAuthors(a)
        setStats(s)
        if (deepLink.current) {
          deepLink.current = false
          const find = (key: string) => a.find((x) => x.id === params.get(key)) ?? null
          if (params.get('nuevo')) setCreating(true)
          if (params.get('editar')) setEditing(find('editar'))
          if (params.get('eliminar')) setDeleting(find('eliminar'))
          if (params.size) router.replace(pathname, { scroll: false })
        }
      })
      .catch((err) => toast.error(err.message))
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!authors || !q) return authors
    return authors.filter((a) => [a.name, a.email, a.nationality].some((v) => v?.toLowerCase().includes(q)))
  }, [authors, query])

  async function confirmDelete() {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await api(`/api/authors/${deleting.id}`, { method: 'DELETE' })
      toast.success('Autor eliminado', { description: deleting.name })
      setDeleting(null)
      load()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeletingBusy(false)
    }
  }

  const maxGenre = stats?.genres[0]?.count ?? 1

  return (
    <>
      <PageHeader
        eyebrow="Panel general"
        title="Dashboard de la biblioteca"
        description="Administra autores, revisa el catálogo y consulta las estadísticas generales en tiempo real."
        actions={
          <>
            <Link href="/books" className={buttonClass('secondary')}><Search className="size-4" /> Buscar libros</Link>
            <Button onClick={() => setCreating(true)}><Plus className="size-4" /> Nuevo autor</Button>
          </>
        }
      />

      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: 'Autores registrados', value: stats?.totalAuthors, icon: Users, tone: 'from-brand-500 to-brand-700' },
          { label: 'Libros en catálogo', value: stats?.totalBooks, icon: BookOpen, tone: 'from-sky-500 to-indigo-600' },
          { label: 'Géneros distintos', value: stats?.totalGenres, icon: Layers, tone: 'from-amber-400 to-orange-600' },
          { label: 'Promedio de páginas', value: stats?.averagePages, icon: FileText, tone: 'from-fuchsia-500 to-rose-600' },
        ].map(({ label, value, icon: Icon, tone }, i) => (
          <Card key={label} delay={i * 0.06} className="group relative overflow-hidden p-5 transition-transform hover:-translate-y-0.5">
            <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}>
              <Icon className="size-5" />
            </span>
            <p className="mt-4 text-[13px] font-medium text-ink-2">{label}</p>
            <div className="mt-0.5 font-display text-4xl tabular-nums">
              {value === undefined ? <Skeleton className="h-9 w-16" /> : <CountUp value={value} />}
            </div>
            <span className={`pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br ${tone} opacity-[0.07] transition-transform duration-500 group-hover:scale-125`} />
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Distribución por género */}
        <Card delay={0.2} className="p-6 lg:col-span-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">Libros por género</h2>
            <span className="text-xs text-ink-3">{stats ? `${number(stats.totalPages)} páginas en total` : ''}</span>
          </div>
          <div className="mt-5 space-y-3">
            {!stats
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6" />)
              : stats.genres.length === 0
                ? <p className="text-sm text-ink-3">Aún no hay libros con género.</p>
                : stats.genres.slice(0, 7).map((g, i) => (
                    <Link key={g.genre} href={`/books?genre=${encodeURIComponent(g.genre)}`} className="group grid grid-cols-[110px_1fr_32px] items-center gap-3 text-sm">
                      <span className="truncate text-ink-2 group-hover:text-ink">{g.genre}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-canvas">
                        <motion.span
                          className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                          initial={{ width: 0 }}
                          animate={{ width: `${(g.count / maxGenre) * 100}%` }}
                          transition={{ duration: 0.9, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </span>
                      <span className="text-right font-medium tabular-nums">{g.count}</span>
                    </Link>
                  ))}
          </div>
        </Card>

        {/* Últimos libros agregados */}
        <Card delay={0.26} className="p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">Agregados recientemente</h2>
            <Link href="/books?sortBy=createdAt&order=desc" className="text-xs font-medium text-brand-600 hover:underline">Ver catálogo</Link>
          </div>
          <ul className="mt-4 divide-y divide-line">
            {!stats
              ? Array.from({ length: 4 }).map((_, i) => <li key={i} className="py-3"><Skeleton className="h-9" /></li>)
              : stats.latestBooks.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-2.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"><BookOpen className="size-4" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{b.title}</p>
                      <p className="truncate text-xs text-ink-3">{b.author?.name} · {b.publishedYear ?? 's/f'}</p>
                    </div>
                    <GenreBadge genre={b.genre} />
                  </li>
                ))}
          </ul>
        </Card>
      </div>

      {/* Listado de autores */}
      <div id="autores" className="scroll-mt-6" />
      <Card delay={0.32} className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl">Autores</h2>
            <p className="text-xs text-ink-3">{authors ? `${authors.length} autores registrados` : 'Cargando…'}</p>
          </div>
          <label className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <input className="field-input pl-9" placeholder="Filtrar por nombre, email o país" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        <div className="hidden grid-cols-[minmax(0,2.2fr)_1fr_0.7fr_0.6fr_190px] gap-4 border-b border-line bg-canvas/60 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3 md:grid">
          <span>Autor</span><span>Nacionalidad</span><span>Nacimiento</span><span>Libros</span><span className="text-right">Acciones</span>
        </div>

        {!filtered ? (
          <div className="space-y-3 p-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Library}
              title={query ? 'Sin coincidencias' : 'Todavía no hay autores'}
              text={query ? 'Ningún autor coincide con el filtro.' : 'Crea el primer autor para empezar a registrar libros.'}
              action={!query && <Button onClick={() => setCreating(true)}><Plus className="size-4" /> Nuevo autor</Button>}
            />
          </div>
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {filtered.map((a, i) => (
                <motion.li
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 10) * 0.03 } }}
                  exit={{ opacity: 0, x: -24 }}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line px-6 py-3.5 last:border-0 hover:bg-canvas/50 md:grid-cols-[minmax(0,2.2fr)_1fr_0.7fr_0.6fr_190px]"
                >
                  <Link href={`/authors/${a.id}`} className="flex min-w-0 items-center gap-3">
                    <Avatar name={a.name} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold hover:text-brand-700">{a.name}</span>
                      <span className="block truncate text-xs text-ink-3">{a.email}</span>
                    </span>
                  </Link>
                  <span className="hidden text-sm text-ink-2 md:block">{a.nationality ?? '—'}</span>
                  <span className="hidden text-sm tabular-nums text-ink-2 md:block">{a.birthYear ?? '—'}</span>
                  <span className="hidden md:block">
                    <span className="inline-flex min-w-8 justify-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{a._count?.books ?? 0}</span>
                  </span>
                  <span className="flex justify-end gap-0.5">
                    <Link href={`/books?authorName=${encodeURIComponent(a.name)}`} className={`${buttonClass('ghost', 'sm')} hidden sm:inline-flex`}><BookOpen className="size-3.5" /> Ver libros</Link>
                    <Link href={`/authors/${a.id}`} aria-label="Ver detalle" title="Ver detalle" className="grid size-8 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-brand-50 hover:text-brand-700"><Eye className="size-4" /></Link>
                    <IconButton label="Editar autor" onClick={() => setEditing(a)}><Pencil className="size-4" /></IconButton>
                    <IconButton label="Eliminar autor" tone="danger" onClick={() => setDeleting(a)}><Trash2 className="size-4" /></IconButton>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Card>

      <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo autor" description="Registra un autor para asociarle libros.">
        <AuthorForm onCancel={() => setCreating(false)} onSaved={() => { setCreating(false); load() }} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar autor" description={editing?.name}>
        {editing && <AuthorForm key={editing.id} author={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="¿Eliminar autor?"
        loading={deletingBusy}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        message={
          <>
            Se eliminará a <strong className="text-ink">{deleting?.name}</strong>
            {deleting?._count?.books ? <> y sus <strong className="text-ink">{deleting._count.books} libros</strong></> : null} de forma permanente. Esta acción no se puede deshacer.
          </>
        }
      />
    </>
  )
}
