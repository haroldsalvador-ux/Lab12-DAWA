# Lab 12 · API Routes con App Router, Prisma y Supabase

Desarrollo de Aplicaciones Web Avanzado · Tecsup · Harold Salvador

Sistema de biblioteca (autores y libros) con **Next.js 16 (App Router)**, **Prisma 6** y **PostgreSQL en Supabase**.

| Carpeta | Contenido |
|---|---|
| `Laboratorio/next-api-routes` | API Routes de la guía (ejercicios 1 a 5) |
| `Laboratorio/postman` | Colección de Postman con las peticiones de prueba |
| `Tarea/next-api-routes` | Búsqueda con paginación, estadísticas de autor y páginas (dashboard, catálogo y detalle de autor) |

## Ejecutar

```bash
cd Tarea/next-api-routes        # o Laboratorio/next-api-routes
cp .env.example .env            # pegar la cadena de conexión de Supabase (Session pooler)
npm install
npx prisma db push
npm run seed                    # (solo tarea) datos de ejemplo
npm run dev
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET, POST | `/api/authors` | Listar y crear autores |
| GET, PUT, DELETE | `/api/authors/[id]` | Autor por ID |
| GET | `/api/authors/[id]/books` | Libros de un autor |
| GET | `/api/authors/[id]/stats` | Estadísticas del autor (tarea) |
| GET, POST | `/api/books` | Listar (filtro `genre`, `authorId`) y crear libros |
| GET, PUT, DELETE | `/api/books/[id]` | Libro por ID |
| GET | `/api/books/search` | Búsqueda con `search`, `genre`, `authorName`, `page`, `limit`, `sortBy`, `order` (tarea) |
| GET | `/api/stats` | Estadísticas generales (tarea) |
