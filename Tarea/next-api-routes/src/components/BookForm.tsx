'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { api, clean, json } from '@/lib/api'
import type { Author, Book, BookInput } from '@/lib/types'
import { Button, Field } from './ui'

type Props = {
  book?: Book | null
  authors: Pick<Author, 'id' | 'name'>[]
  genres: string[]
  defaultAuthorId?: string
  onSaved: (book: Book) => void
  onCancel?: () => void
}

export function BookForm({ book, authors, genres, defaultAuthorId, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<BookInput>({
    title: book?.title ?? '',
    authorId: book?.authorId ?? defaultAuthorId ?? '',
    genre: book?.genre ?? '',
    publishedYear: book?.publishedYear?.toString() ?? '',
    pages: book?.pages?.toString() ?? '',
    isbn: book?.isbn ?? '',
    description: book?.description ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof BookInput, string>>>({})
  const [saving, setSaving] = useState(false)

  const set = (key: keyof BookInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (form.title.trim().length < 3) next.title = 'El título debe tener al menos 3 caracteres'
    if (!form.authorId) next.authorId = 'Selecciona un autor'
    if (form.pages && Number(form.pages) < 1) next.pages = 'Debe ser mayor a 0'
    const year = Number(form.publishedYear)
    if (form.publishedYear && (year < 1000 || year > new Date().getFullYear())) next.publishedYear = 'Año no válido'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const saved = await api<Book>(book ? `/api/books/${book.id}` : '/api/books', {
        method: book ? 'PUT' : 'POST',
        body: json(clean(form)),
      })
      toast.success(book ? 'Libro actualizado' : 'Libro creado', { description: saved.title })
      onSaved(saved)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes('ISBN')) setErrors({ isbn: message })
      else toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Título *" error={errors.title} className="sm:col-span-2">
        <input className="field-input" value={form.title} onChange={set('title')} placeholder="Cien años de soledad" autoFocus />
      </Field>
      <Field label="Autor *" error={errors.authorId} className="sm:col-span-2">
        <select className="field-input" value={form.authorId} onChange={set('authorId')}>
          <option value="">Selecciona un autor…</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Género" hint="Elige uno existente o escribe uno nuevo">
        <input className="field-input" list="genre-options" value={form.genre} onChange={set('genre')} placeholder="Novela" />
        <datalist id="genre-options">
          {genres.map((g) => <option key={g} value={g} />)}
        </datalist>
      </Field>
      <Field label="ISBN" error={errors.isbn}>
        <input className="field-input font-mono" value={form.isbn} onChange={set('isbn')} placeholder="978-0307474728" />
      </Field>
      <Field label="Año de publicación" error={errors.publishedYear}>
        <input className="field-input" type="number" value={form.publishedYear} onChange={set('publishedYear')} placeholder="1967" />
      </Field>
      <Field label="Páginas" error={errors.pages}>
        <input className="field-input" type="number" min={1} value={form.pages} onChange={set('pages')} placeholder="417" />
      </Field>
      <Field label="Descripción" className="sm:col-span-2">
        <textarea className="field-input min-h-24 resize-y" value={form.description} onChange={set('description')} placeholder="Resumen del libro" />
      </Field>
      <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" loading={saving}>{book ? 'Guardar cambios' : 'Crear libro'}</Button>
      </div>
    </form>
  )
}
