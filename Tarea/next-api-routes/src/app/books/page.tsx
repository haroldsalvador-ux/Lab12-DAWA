'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, SearchX, Trash2, X } from 'lucide-react'
import { api } from '@/lib/api'
import { number } from '@/lib/format'
import type { Author, Book, LibraryStats, SearchResponse } from '@/lib/types'
import { BookForm } from '@/components/BookForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Modal } from '@/components/Modal'
import { Avatar, Button, Card, EmptyState, GenreBadge, IconButton, PageHeader, Skeleton } from '@/components/ui'

const SORTS = [
  { value: 'createdAt', label: 'Ordenar por fecha' },
  { value: 'title', label: 'Ordenar por título' },
  { value: 'publishedYear', label: 'Ordenar por año' },
]

export default function BooksPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <BooksExplorer />
    </Suspense>
  )
}

function BooksExplorer() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  // El estado de los filtros vive en la URL (se puede compartir y recargar)
  const search = params.get('search') ?? ''
  const genre = params.get('genre') ?? ''
  const authorName = params.get('authorName') ?? ''
  const sortBy = params.get('sortBy') ?? 'createdAt'
  const order = params.get('order') ?? 'desc'
  const page = Number(params.get('page') ?? 1)
  const limit = Number(params.get('limit') ?? 9)

  const [term, setTerm] = useState(search)
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [editing, setEditing] = useState<Book | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Book | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)
  const [reload, setReload] = useState(0)
  // Enlaces directos: /books?nuevo=1, /books?editar=<id>, /books?eliminar=<id>
  const deepLink = useRef({ nuevo: params.get('nuevo'), editar: params.get('editar'), eliminar: params.get('eliminar') })

  const update = useCallback(
    (changes: Record<string, string | number | null>, resetPage = true) => {
      const next = new URLSearchParams(params.toString())
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === '') next.delete(key)
        else next.set(key, String(value))
      }
      if (resetPage) next.delete('page')
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [params, pathname, router]
  )

  // Catálogos para los dropdowns
  const loadCatalogs = useCallback(() => {
    api<Author[]>('/api/authors').then(setAuthors).catch(() => {})
    api<LibraryStats>('/api/stats').then((s) => setGenres(s.genres.map((g) => g.genre))).catch(() => {})
  }, [])
  useEffect(() => { loadCatalogs() }, [loadCatalogs])

  // Búsqueda en tiempo real: espera 350 ms después de la última tecla
  useEffect(() => {
    if (term.trim() === search) return
    const t = setTimeout(() => update({ search: term.trim() }), 350)
    return () => clearTimeout(t)
  }, [term, search, update])

  // Consulta al endpoint de búsqueda cada vez que cambian los filtros
  const qs = new URLSearchParams({ page: String(page), limit: String(limit), sortBy, order })
  if (search) qs.set('search', search)
  if (genre) qs.set('genre', genre)
  if (authorName) qs.set('authorName', authorName)
  const queryKey = `${qs}#${reload}`
  const loading = loadedKey !== queryKey

  useEffect(() => {
    const controller = new AbortController()
    api<SearchResponse>(`/api/books/search?${queryKey.split('#')[0]}`, { signal: controller.signal })
      .then((r) => {
        setResult(r)
        setLoadedKey(queryKey)
        const link = deepLink.current
        if (link.nuevo || link.editar || link.eliminar) {
          deepLink.current = { nuevo: null, editar: null, eliminar: null }
          if (link.nuevo) setCreating(true)
          if (link.editar) setEditing(r.data.find((b) => b.id === link.editar) ?? null)
          if (link.eliminar) setDeleting(r.data.find((b) => b.id === link.eliminar) ?? null)
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        toast.error(err.message)
        setLoadedKey(queryKey)
      })
    return () => controller.abort()
  }, [queryKey])

  const refresh = () => { setReload((n) => n + 1); loadCatalogs() }

  async function confirmDelete() {
    if (!deleting) return
    setDeletingBusy(true)
    try {
      await api(`/api/books/${deleting.id}`, { method: 'DELETE' })
      toast.success('Libro eliminado', { description: deleting.title })
      setDeleting(null)
      // Si era el último de la página, regresa a la anterior
      if (result && result.data.length === 1 && page > 1) update({ page: page - 1 }, false)
      else refresh()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setDeletingBusy(false)
    }
  }

  const hasFilters = !!(search || genre || authorName)
  const pg = result?.pagination

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Búsqueda de libros"
        description="Busca por título, filtra por género o autor, ordena los resultados y navega entre páginas."
        actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> Nuevo libro</Button>}
      />

      {/* Barra de búsqueda y filtros */}
      <Card className="relative overflow-hidden p-4">
        {loading && (
          <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
            <span className="block h-full w-1/3 animate-progress bg-brand-500" />
          </span>
        )}
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto]">
          <label className="relative">
            <span className="sr-only">Buscar por título</span>
            {loading ? (
              <Loader2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-brand-600" />
            ) : (
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            )}
            <input className="field-input pl-9 pr-9" placeholder="Buscar por título…" value={term} onChange={(e) => setTerm(e.target.value)} />
            {term && (
              <button onClick={() => setTerm('')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-ink-3 hover:bg-canvas">
                <X className="size-3.5" />
              </button>
            )}
          </label>
          <select className="field-input" value={genre} onChange={(e) => update({ genre: e.target.value })} aria-label="Filtrar por género">
            <option value="">Todos los géneros</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="field-input" value={authorName} onChange={(e) => update({ authorName: e.target.value })} aria-label="Filtrar por autor">
            <option value="">Todos los autores</option>
            {authors.map((a) => <option key={a.id} value={a.name}>{a.name}</option>)}
            {authorName && !authors.some((a) => a.name === authorName) && <option value={authorName}>{authorName}</option>}
          </select>
          <select className="field-input" value={sortBy} onChange={(e) => update({ sortBy: e.target.value })} aria-label="Ordenar por">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Button
            variant="secondary"
            onClick={() => update({ order: order === 'asc' ? 'desc' : 'asc' })}
            aria-label="Cambiar orden"
            title={order === 'asc' ? 'Ascendente' : 'Descendente'}
          >
            {order === 'asc' ? <ArrowUpNarrowWide className="size-4" /> : <ArrowDownWideNarrow className="size-4" />}
            <span className="md:hidden lg:inline">{order === 'asc' ? 'Asc' : 'Desc'}</span>
          </Button>
        </div>
      </Card>

      {/* Resumen de resultados */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-2">
          {pg ? (
            <>
              <strong className="font-semibold text-ink">{number(pg.total)}</strong> {pg.total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              {pg.total > 0 && <> · página {pg.page} de {pg.totalPages}</>}
            </>
          ) : 'Buscando…'}
        </p>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={() => { setTerm(''); update({ search: null, genre: null, authorName: null }) }}>
              <X className="size-3.5" /> Limpiar filtros
            </Button>
          )}
          <select className="field-input h-9 w-auto py-1.5 text-[13px]" value={limit} onChange={(e) => update({ limit: e.target.value })} aria-label="Resultados por página">
            {[6, 9, 12, 24].map((n) => <option key={n} value={n}>{n} por página</option>)}
          </select>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-3">
        {!result && loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : result && result.data.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No se encontraron libros"
            text={hasFilters ? 'Prueba con otro término o quita algunos filtros.' : 'Registra el primer libro del catálogo.'}
            action={hasFilters ? undefined : <Button onClick={() => setCreating(true)}><Plus className="size-4" /> Nuevo libro</Button>}
          />
        ) : (
          <motion.div layout className={`grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
            <AnimatePresence mode="popLayout">
              {result?.data.map((book, i) => (
                <motion.article
                  key={book.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.035, duration: 0.35 } }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-shadow hover:shadow-pop"
                >
                  <div className="flex items-start justify-between gap-3">
                    <GenreBadge genre={book.genre} />
                    <span className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <IconButton label="Editar libro" onClick={() => setEditing(book)}><Pencil className="size-4" /></IconButton>
                      <IconButton label="Eliminar libro" tone="danger" onClick={() => setDeleting(book)}><Trash2 className="size-4" /></IconButton>
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[22px] leading-snug">{book.title}</h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-2">{book.description ?? 'Sin descripción.'}</p>
                  <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-canvas/70 px-3 py-2.5 text-center">
                    <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Año</dt><dd className="text-sm font-semibold tabular-nums">{book.publishedYear ?? '—'}</dd></div>
                    <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">Páginas</dt><dd className="text-sm font-semibold tabular-nums">{book.pages ?? '—'}</dd></div>
                    <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-3">ISBN</dt><dd className="truncate font-mono text-[11px] leading-5 text-ink-2" title={book.isbn ?? ''}>{book.isbn ?? '—'}</dd></div>
                  </dl>
                  {book.author && (
                    <Link href={`/authors/${book.author.id}`} className="mt-4 flex items-center gap-2.5 border-t border-line pt-4 text-sm hover:text-brand-700">
                      <Avatar name={book.author.name} size={28} />
                      <span className="truncate font-medium">{book.author.name}</span>
                    </Link>
                  )}
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Paginación */}
      {pg && pg.totalPages > 1 && (
        <nav id="paginacion" className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="Paginación">
          <Button size="sm" variant="secondary" disabled={!pg.hasPrev} onClick={() => update({ page: page - 1 }, false)}>
            <ChevronLeft className="size-4" /> Anterior
          </Button>
          {pageList(pg.page, pg.totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1 text-ink-3">…</span>
            ) : (
              <button
                key={p}
                onClick={() => update({ page: p }, false)}
                aria-current={p === pg.page ? 'page' : undefined}
                className={`relative size-8 rounded-lg text-[13px] font-medium tabular-nums transition-colors ${p === pg.page ? 'text-white' : 'text-ink-2 hover:bg-surface'}`}
              >
                {p === pg.page && <motion.span layoutId="page-active" className="absolute inset-0 rounded-lg bg-brand-600" />}
                <span className="relative">{p}</span>
              </button>
            )
          )}
          <Button size="sm" variant="secondary" disabled={!pg.hasNext} onClick={() => update({ page: page + 1 }, false)}>
            Siguiente <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Nuevo libro" description="Completa los datos y asígnalo a un autor.">
        <BookForm authors={authors} genres={genres} onCancel={() => setCreating(false)} onSaved={() => { setCreating(false); refresh() }} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar libro" description={editing?.title}>
        {editing && <BookForm key={editing.id} book={editing} authors={authors} genres={genres} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); refresh() }} />}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="¿Eliminar libro?"
        loading={deletingBusy}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        message={<>Se eliminará <strong className="text-ink">{deleting?.title}</strong> del catálogo de forma permanente.</>}
      />
    </>
  )
}

// Números de página con "…" cuando hay muchas: 1 … 4 5 6 … 12
function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…' as const, p] : [p]))
}

