import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Estadísticas generales de la biblioteca (para el dashboard)
export async function GET() {
  try {
    const [totalAuthors, totalBooks, pagesAgg, byGenre, latestBooks] = await prisma.$transaction([
      prisma.author.count(),
      prisma.book.count(),
      prisma.book.aggregate({ _avg: { pages: true }, _sum: { pages: true } }),
      prisma.book.groupBy({
        by: ['genre'],
        where: { genre: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { genre: 'desc' } },
      }),
      prisma.book.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, name: true } } },
      }),
    ])

    return NextResponse.json({
      totalAuthors,
      totalBooks,
      totalGenres: byGenre.length,
      averagePages: Math.round(pagesAgg._avg.pages ?? 0),
      totalPages: pagesAgg._sum.pages ?? 0,
      genres: byGenre.map((g) => ({
        genre: g.genre,
        count: (g._count as { _all: number })._all,
      })),
      latestBooks,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
