'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  width?: string
}

export function Modal({ open, onClose, title, description, children, width = 'max-w-xl' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/45" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={`relative max-h-[92vh] w-full ${width} overflow-y-auto rounded-t-2xl bg-surface shadow-pop sm:rounded-2xl`}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-5">
              <div>
                <h2 className="font-display text-2xl leading-tight">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="grid size-8 place-items-center rounded-lg text-ink-3 hover:bg-canvas hover:text-ink">
                <X className="size-4" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
