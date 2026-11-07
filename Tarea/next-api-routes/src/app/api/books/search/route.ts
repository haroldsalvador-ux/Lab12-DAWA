import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const SORT_FIELDS = ['title', 'publishedYear', 'createdAt'] as const
type SortField = (typeof SORT_FIELDS)[number]

// Convierte un query param a entero positivo; si no es válido usa el valor por defecto
function toPositiveInt(value: string | null, fallback: number) {
  const number = Number.parseInt(value ?? '', 10)
  return Number.isNaN(number) || number < 1 ? fallback : number
}

// GET - Búsqueda de libros con filtros, ordenamiento y paginación
// Ej: /api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc
export async function GET(request: Request) {
  // Se lee fuera del try: al acceder a request.url Next marca la ruta como dinámica
  const { searchParams } = new URL(request.url)

  try {
    const search = searchParams.get('search')?.trim()
    const genre = searchParams.get('genre')?.trim()
    const authorName = searchParams.get('authorName')?.trim()

    const page = toPositiveInt(searchParams.get('page'), 1)
    const limit = Math.min(toPositiveInt(searchParams.get('limit'), 10), 50)

    const sortParam = searchParams.get('sortBy') as SortField
    const sortBy: SortField = SORT_FIELDS.includes(sortParam) ? sortParam : 'createdAt'
    const order: Prisma.SortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    const where: Prisma.BookWhereInput = {
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(genre && { genre }),
      ...(authorName && {
        author: { name: { contains: authorName, mode: 'insensitive' } },
      }),
    }

    // Conteo total y página de resultados en una sola transacción
    const [total, books] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
        // Los libros sin año se envían al final; el id desempata para que la paginación sea estable
        orderBy: [
          sortBy === 'publishedYear'
            ? { publishedYear: { sort: order, nulls: 'last' } }
            : { [sortBy]: order },
          { id: 'asc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}
