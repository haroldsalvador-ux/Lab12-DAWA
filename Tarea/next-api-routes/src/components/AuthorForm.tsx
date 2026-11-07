'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { api, clean, json } from '@/lib/api'
import type { Author, AuthorInput } from '@/lib/types'
import { Button, Field } from './ui'

type Props = {
  author?: Author | null
  onSaved: (author: Author) => void
  onCancel?: () => void
}

const empty: AuthorInput = { name: '', email: '', nationality: '', birthYear: '', bio: '' }

export function AuthorForm({ author, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<AuthorInput>(
    author
      ? {
          name: author.name,
          email: author.email,
          nationality: author.nationality ?? '',
          birthYear: author.birthYear?.toString() ?? '',
          bio: author.bio ?? '',
        }
      : empty
  )
  const [errors, setErrors] = useState<Partial<Record<keyof AuthorInput, string>>>({})
  const [saving, setSaving] = useState(false)

  const set = (key: keyof AuthorInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!form.name.trim()) next.name = 'El nombre es requerido'
    if (!form.email.trim()) next.email = 'El email es requerido'
    const year = Number(form.birthYear)
    if (form.birthYear && (year < 1000 || year > new Date().getFullYear())) next.birthYear = 'Año no válido'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      const saved = await api<Author>(author ? `/api/authors/${author.id}` : '/api/authors', {
        method: author ? 'PUT' : 'POST',
        body: json(clean(form)),
      })
      toast.success(author ? 'Autor actualizado' : 'Autor creado', { description: saved.name })
      onSaved(saved)
    } catch (err) {
      const message = (err as Error).message
      if (message.toLowerCase().includes('email')) setErrors({ email: message })
      else toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre completo *" error={errors.name} className="sm:col-span-2">
        <input className="field-input" value={form.name} onChange={set('name')} placeholder="Gabriel García Márquez" autoFocus />
      </Field>
      <Field label="Email *" error={errors.email} className="sm:col-span-2">
        <input className="field-input" type="email" value={form.email} onChange={set('email')} placeholder="autor@ejemplo.com" />
      </Field>
      <Field label="Nacionalidad">
        <input className="field-input" value={form.nationality} onChange={set('nationality')} placeholder="Colombia" />
      </Field>
      <Field label="Año de nacimiento" error={errors.birthYear}>
        <input className="field-input" type="number" value={form.birthYear} onChange={set('birthYear')} placeholder="1927" />
      </Field>
      <Field label="Biografía" className="sm:col-span-2">
        <textarea className="field-input min-h-24 resize-y" value={form.bio} onChange={set('bio')} placeholder="Breve reseña del autor" />
      </Field>
      <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" loading={saving}>{author ? 'Guardar cambios' : 'Crear autor'}</Button>
      </div>
    </form>
  )
}
