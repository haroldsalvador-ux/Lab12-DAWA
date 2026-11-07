'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { toast } from 'sonner'
import {
  ArrowLeft, BookOpen, BookPlus, CalendarClock, CalendarDays, FileText, Globe, Mail, Pencil,
  Ruler, Sparkles, Trash2, UserX,
} from 'lucide-react'
import { api } from '@/lib/api'
import type { Author, AuthorStats, Book, LibraryStats } from '@/lib/types'
import { AuthorForm } from '@/components/AuthorForm'
import { BookForm } from '@/components/BookForm'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Modal } from '@/components/Modal'
import { Avatar, Button, buttonClass, Card, CountUp, EmptyState, GenreBadge, IconButton, Skeleton } from '@/components/ui'

export default function AuthorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  // Enlaces directos: /authors/<id>?editar=1, /authors/<id>?agregar=1
  const query = useSearchParams()

  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [editingAuthor, setEditingAuthor] = useState(() => query.has('editar'))
  const [addingBook, setAddingBook] = useState(() => query.has('agregar'))
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [deletingAuthor, setDeletingAuthor] = useState(false)
  const [busy, setBusy] = useState(false)

  // Cada cambio de "version" vuelve a consultar el autor y sus estadísticas
  const [version, setVersion] = useState(0)
  const load = () => setVersion((v) => v + 1)

  useEffect(() => {
    let alive = true
    Promise.all([api<Author>(`/api/authors/${id}`), api<AuthorStats>(`/api/authors/${id}/stats`)])
      .then(([a, s]) => { if (alive) { setAuthor(a); setStats(s) } })
      .catch(() => { if (alive) setNotFound(true) })
    return () => { alive = false }
  }, [id, version])

  useEffect(() => {
    api<Author[]>('/api/authors').then(setAuthors).catch(() => {})
    api<LibraryStats>('/api/stats').then((s) => setGenres(s.genres.map((g) => g.genre))).catch(() => {})
  }, [])

  async function removeBook() {
    if (!deletingBook) return
    setBusy(true)
    try {
      await api(`/api/books/${deletingBook.id}`, { method: 'DELETE' })
      toast.success('Libro eliminado', { description: deletingBook.title })
      setDeletingBook(null)
      load()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function removeAuthor() {
    if (!author) return
    setBusy(true)
    try {
      await api(`/api/authors/${author.id}`, { method: 'DELETE' })
      toast.success('Autor eliminado', { description: author.name })
      router.push('/')
    } catch (err) {
      toast.error((err as Error).message)
      setBusy(false)
    }
  }

  if (notFound) {
    return (
      <EmptyState
        icon={UserX}
        title="Autor no encontrado"
        text="El autor que buscas no existe o fue eliminado."
        action={<Link href="/" className={buttonClass()}><ArrowLeft className="size-4" /> Volver al dashboard</Link>}
      />
    )
  }

  const books = author?.books ?? []

  return (
    <>
      <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" /> Dashboard
      </Link>

      {/* Información del autor */}
      <Card className="relative overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500">
          <div className="h-full w-full opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="-mt-12 rounded-full bg-surface p-1.5 shadow-card">
                {author ? <Avatar name={author.name} size={84} /> : <Skeleton className="size-[84px] rounded-full" />}
              </div>
              <div className="pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Perfil del autor</p>
                {author ? <h1 className="font-display text-3xl leading-tight sm:text-4xl">{author.name}</h1> : <Skeleton className="mt-1 h-9 w-64" />}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setEditingAuthor((v) => !v)} disabled={!author}>
                <Pencil className="size-4" /> {editingAuthor ? 'Cerrar edición' : 'Editar autor'}
              </Button>
              <Button onClick={() => setAddingBook(true)} disabled={!author}>
                <BookPlus className="size-4" /> Agregar libro
              </Button>
            </div>
          </div>

          {author && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              <p className="max-w-3xl text-[15px] leading-relaxed text-ink-2">{author.bio ?? 'Este autor aún no tiene biografía registrada.'}</p>
              <ul className="space-y-2.5 rounded-xl bg-canvas/70 p-4 text-sm">
                <li className="flex items-center gap-2.5"><Mail className="size-4 text-ink-3" /> <span className="truncate">{author.email}</span></li>
                <li className="flex items-center gap-2.5"><Globe className="size-4 text-ink-3" /> {author.nationality ?? 'Nacionalidad no registrada'}</li>
                <li className="flex items-center gap-2.5"><CalendarDays className="size-4 text-ink-3" /> {author.birthYear ? `Nació en ${author.birthYear}` : 'Año de nacimiento no registrado'}</li>
              </ul>
            </div>
          )}

          {/* Formulario para editar al autor */}
          <AnimatePresence initial={false}>
            {editingAuthor && author && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-6 rounded-xl border border-line p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-display text-xl">Editar información</h2>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeletingAuthor(true)}>
                      <Trash2 className="size-3.5" /> Eliminar autor
                    </Button>
                  </div>
                  <AuthorForm
                    key={author.updatedAt}
                    author={author}
                    onCancel={() => setEditingAuthor(false)}
                    onSaved={() => { setEditingAuthor(false); load() }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Estadísticas del autor (GET /api/authors/[id]/stats) */}
      <h2 id="estadisticas" className="mb-3 mt-8 scroll-mt-6 font-display text-2xl">Estadísticas</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile delay={0.05} icon={BookOpen} label="Libros publicados" loading={!stats}>
          {stats && <span className="font-display text-4xl tabular-nums"><CountUp value={stats.totalBooks} /></span>}
        </StatTile>
        <StatTile delay={0.1} icon={FileText} label="Promedio de páginas" loading={!stats}>
          {stats && <span className="font-display text-4xl tabular-nums"><CountUp value={stats.averagePages} /></span>}
        </StatTile>
        <StatTile delay={0.15} icon={CalendarDays} label="Primer libro" loading={!stats}>
          <BookRef title={stats?.firstBook?.title} detail={stats?.firstBook?.year} />
        </StatTile>
        <StatTile delay={0.2} icon={CalendarClock} label="Último libro" loading={!stats}>
          <BookRef title={stats?.latestBook?.title} detail={stats?.latestBook?.year} />
        </StatTile>
        <StatTile delay={0.25} icon={Ruler} label="Libro con más páginas" loading={!stats}>
          <BookRef title={stats?.longestBook?.title} detail={stats?.longestBook && `${stats.longestBook.pages} páginas`} />
        </StatTile>
        <StatTile delay={0.3} icon={Ruler} label="Libro con menos páginas" loading={!stats}>
          <BookRef title={stats?.shortestBook?.title} detail={stats?.shortestBook && `${stats.shortestBook.pages} páginas`} />
        </StatTile>
        <StatTile delay={0.35} icon={Sparkles} label="Géneros escritos" loading={!stats} className="col-span-2">
          {stats && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {stats.genres.length ? stats.genres.map((g) => <GenreBadge key={g} genre={g} />) : <span className="text-sm text-ink-3">Sin géneros registrados</span>}
            </div>
          )}
        </StatTile>
      </div>

      {/* Libros del autor */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="font-display text-2xl">Libros {author && <span className="text-ink-3">({books.length})</span>}</h2>
        {author && books.length > 0 && (
          <Link href={`/books?authorName=${encodeURIComponent(author.name)}`} className="text-sm font-medium text-brand-600 hover:underline">
            Ver en el catálogo
          </Link>
        )}
      </div>
      <Card delay={0.2} className="overflow-hidden">
        {!author ? (
          <div className="space-y-3 p-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : books.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={BookOpen}
              title="Sin libros todavía"
              text={`Agrega el primer libro de ${author.name}.`}
              action={<Button onClick={() => setAddingBook(true)}><BookPlus className="size-4" /> Agregar libro</Button>}
            />
          </div>
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {books.map((b, i) => (
                <motion.li
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0, x: -24 }}
                  className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-6 py-4 last:border-0 hover:bg-canvas/50"
                >
                  <span className="w-12 font-display text-2xl tabular-nums text-ink-3">{b.publishedYear ?? '—'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{b.title}</p>
                    <p className="line-clamp-1 text-sm text-ink-3">{b.description ?? 'Sin descripción'}</p>
                  </div>
                  <GenreBadge genre={b.genre} />
                  <span className="w-24 text-right text-sm tabular-nums text-ink-2">{b.pages ? `${b.pages} págs.` : '—'}</span>
                  <span className="flex gap-0.5">
                    <IconButton label="Editar libro" onClick={() => setEditingBook(b)}><Pencil className="size-4" /></IconButton>
                    <IconButton label="Eliminar libro" tone="danger" onClick={() => setDeletingBook(b)}><Trash2 className="size-4" /></IconButton>
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Card>

      <Modal open={addingBook} onClose={() => setAddingBook(false)} title="Agregar libro" description={author ? `Nuevo libro de ${author.name}` : undefined}>
        {author && (
          <BookForm
            authors={authors.length ? authors : [author]}
            genres={genres}
            defaultAuthorId={author.id}
            onCancel={() => setAddingBook(false)}
            onSaved={() => { setAddingBook(false); load() }}
          />
        )}
      </Modal>

      <Modal open={!!editingBook} onClose={() => setEditingBook(null)} title="Editar libro" description={editingBook?.title}>
        {editingBook && author && (
          <BookForm
            key={editingBook.id}
            book={editingBook}
            authors={authors.length ? authors : [author]}
            genres={genres}
            onCancel={() => setEditingBook(null)}
            onSaved={() => { setEditingBook(null); load() }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deletingBook}
        title="¿Eliminar libro?"
        loading={busy}
        onClose={() => setDeletingBook(null)}
        onConfirm={removeBook}
        message={<>Se eliminará <strong className="text-ink">{deletingBook?.title}</strong> de forma permanente.</>}
      />

      <ConfirmDialog
        open={deletingAuthor}
        title="¿Eliminar autor?"
        loading={busy}
        onClose={() => setDeletingAuthor(false)}
        onConfirm={removeAuthor}
        message={<>Se eliminará a <strong className="text-ink">{author?.name}</strong> junto con sus <strong className="text-ink">{books.length} libros</strong>. Esta acción no se puede deshacer.</>}
      />
    </>
  )
}

function StatTile({ icon: Icon, label, loading, children, delay, className = '' }: {
  icon: React.ElementType; label: string; loading: boolean; children?: React.ReactNode; delay: number; className?: string
}) {
  return (
    <Card delay={delay} className={`p-5 ${className}`}>
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
        <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600"><Icon className="size-4" /></span>
        {label}
      </div>
      <div className="mt-3 min-h-11">{loading ? <Skeleton className="h-10" /> : children}</div>
    </Card>
  )
}

function BookRef({ title, detail }: { title?: string; detail?: string | number | null }) {
  if (!title) return <span className="text-sm text-ink-3">Sin datos</span>
  return (
    <div>
      <p className="line-clamp-2 font-medium leading-snug">{title}</p>
      {detail && <p className="mt-0.5 text-sm tabular-nums text-ink-3">{detail}</p>}
    </div>
  )
}
