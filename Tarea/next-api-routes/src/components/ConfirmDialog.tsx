'use client'

import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './ui'

type Props = {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', loading, onConfirm, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <div className="flex gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
          <AlertTriangle className="size-5" />
        </span>
        <div className="text-sm leading-relaxed text-ink-2">{message}</div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}
