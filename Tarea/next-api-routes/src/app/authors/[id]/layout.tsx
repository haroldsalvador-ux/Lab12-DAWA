import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detalle del autor' }

export default function AuthorLayout({ children }: { children: React.ReactNode }) {
  return children
}
