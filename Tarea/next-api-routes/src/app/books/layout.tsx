import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Búsqueda de libros' }

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return children
}
