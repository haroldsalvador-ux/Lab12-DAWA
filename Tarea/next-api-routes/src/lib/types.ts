export type Author = {
  id: string
  name: string
  email: string
  bio: string | null
  nationality: string | null
  birthYear: number | null
  createdAt: string
  updatedAt: string
  books?: Book[]
  _count?: { books: number }
}

export type Book = {
  id: string
  title: string
  description: string | null
  isbn: string | null
  publishedYear: number | null
  genre: string | null
  pages: number | null
  authorId: string
  createdAt: string
  updatedAt: string
  author?: Pick<Author, 'id' | 'name' | 'email'>
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export type SearchResponse = { data: Book[]; pagination: Pagination }

export type LibraryStats = {
  totalAuthors: number
  totalBooks: number
  totalGenres: number
  averagePages: number
  totalPages: number
  genres: { genre: string; count: number }[]
  latestBooks: Book[]
}

export type AuthorStats = {
  authorId: string
  authorName: string
  totalBooks: number
  firstBook: { title: string; year: number } | null
  latestBook: { title: string; year: number } | null
  averagePages: number
  genres: string[]
  longestBook: { title: string; pages: number } | null
  shortestBook: { title: string; pages: number } | null
}

export type AuthorInput = {
  name: string
  email: string
  nationality?: string
  birthYear?: string
  bio?: string
}

export type BookInput = {
  title: string
  authorId: string
  genre?: string
  publishedYear?: string
  pages?: string
  isbn?: string
  description?: string
}
