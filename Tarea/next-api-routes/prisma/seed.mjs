// Datos de ejemplo para la biblioteca: `npm run seed`
// Es idempotente: no duplica autores (por email) ni libros (por título + autor).
// Los libros de García Márquez solo se agregan si su autor ya existe
// (se crea en el laboratorio con POST /api/authors).
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const authors = [
  {
    name: 'Mario Vargas Llosa', email: 'vargasllosa@example.com', nationality: 'Perú', birthYear: 1936,
    bio: 'Premio Nobel de Literatura 2010. Figura central del boom latinoamericano.',
    books: [
      ['La ciudad y los perros', 1963, 'Novela', 456, 'La vida de los cadetes del Colegio Militar Leoncio Prado.'],
      ['La casa verde', 1966, 'Novela', 528, 'Historias entrecruzadas entre Piura y la Amazonía.'],
      ['Conversación en La Catedral', 1969, 'Novela', 729, 'Retrato del Perú bajo la dictadura de Odría.'],
      ['La tía Julia y el escribidor', 1977, 'Novela', 447, 'Un joven escritor, un romance y un guionista de radionovelas.'],
      ['La verdad de las mentiras', 1990, 'Ensayo', 336, 'Ensayos sobre la ficción y las grandes novelas del siglo XX.'],
      ['La fiesta del Chivo', 2000, 'Novela', 518, 'Los últimos días de la dictadura de Trujillo.'],
      ['El sueño del celta', 2010, 'Novela', 464, 'La vida de Roger Casement y su denuncia del colonialismo.'],
    ],
  },
  {
    name: 'Isabel Allende', email: 'allende@example.com', nationality: 'Chile', birthYear: 1942,
    bio: 'Escritora chilena, una de las autoras en español más leídas del mundo.',
    books: [
      ['La casa de los espíritus', 1982, 'Novela', 448, 'La saga de la familia Trueba a lo largo de cuatro generaciones.'],
      ['De amor y de sombra', 1984, 'Novela', 288, 'Una historia de amor en tiempos de dictadura.'],
      ['Eva Luna', 1987, 'Novela', 304, 'Una narradora que sobrevive contando historias.'],
      ['Cuentos de Eva Luna', 1989, 'Cuento', 256, 'Veintitrés relatos narrados por Eva Luna.'],
      ['Paula', 1994, 'Memorias', 368, 'Memorias escritas para su hija.'],
    ],
  },
  {
    name: 'Julio Cortázar', email: 'cortazar@example.com', nationality: 'Argentina', birthYear: 1914,
    bio: 'Maestro del cuento fantástico y autor de la novela experimental Rayuela.',
    books: [
      ['Bestiario', 1951, 'Cuento', 160, 'Ocho relatos donde lo fantástico irrumpe en lo cotidiano.'],
      ['Final del juego', 1956, 'Cuento', 176, 'Cuentos que incluyen Continuidad de los parques.'],
      ['Historias de cronopios y de famas', 1962, 'Cuento', 144, 'Textos breves, lúdicos y absurdos.'],
      ['Rayuela', 1963, 'Novela', 600, 'Una novela que puede leerse en distintos órdenes.'],
    ],
  },
  {
    name: 'Jorge Luis Borges', email: 'borges@example.com', nationality: 'Argentina', birthYear: 1899,
    bio: 'Poeta, ensayista y cuentista; laberintos, espejos y bibliotecas infinitas.',
    books: [
      ['Ficciones', 1944, 'Cuento', 224, 'Incluye La biblioteca de Babel y El jardín de senderos que se bifurcan.'],
      ['El Aleph', 1949, 'Cuento', 208, 'Relatos sobre el infinito, la identidad y el tiempo.'],
      ['Otras inquisiciones', 1952, 'Ensayo', 272, 'Ensayos sobre literatura y filosofía.'],
      ['El libro de arena', 1975, 'Cuento', 144, 'Un libro sin principio ni fin.'],
    ],
  },
  {
    name: 'César Vallejo', email: 'vallejo@example.com', nationality: 'Perú', birthYear: 1892,
    bio: 'Poeta peruano, uno de los grandes innovadores de la poesía del siglo XX.',
    books: [
      ['Los heraldos negros', 1918, 'Poesía', 160, 'Su primer poemario.'],
      ['Trilce', 1922, 'Poesía', 128, 'Obra vanguardista que rompió con el lenguaje poético tradicional.'],
      ['El tungsteno', 1931, 'Novela', 144, 'La explotación minera en los Andes peruanos.'],
      ['Poemas humanos', 1939, 'Poesía', 176, 'Poemario publicado de forma póstuma.'],
    ],
  },
  {
    name: 'Pablo Neruda', email: 'neruda@example.com', nationality: 'Chile', birthYear: 1904,
    bio: 'Premio Nobel de Literatura 1971.',
    books: [
      ['Veinte poemas de amor y una canción desesperada', 1924, 'Poesía', 96, 'El poemario de amor más leído en español.'],
      ['Canto general', 1950, 'Poesía', 568, 'Un recorrido poético por la historia de América.'],
      ['Confieso que he vivido', 1974, 'Memorias', 448, 'Memorias publicadas tras su muerte.'],
    ],
  },
  {
    name: 'Laura Esquivel', email: 'esquivel@example.com', nationality: 'México', birthYear: 1950,
    bio: 'Novelista y guionista mexicana.',
    books: [
      ['Como agua para chocolate', 1989, 'Novela', 256, 'Amor, cocina y realismo mágico en la Revolución mexicana.'],
      ['Malinche', 2006, 'Novela', 208, 'La historia de la intérprete de Hernán Cortés.'],
    ],
  },
  {
    name: 'José María Arguedas', email: 'arguedas@example.com', nationality: 'Perú', birthYear: 1911,
    bio: 'Novelista y antropólogo; retrató el mundo andino y la cultura quechua.',
    books: [
      ['Yawar Fiesta', 1941, 'Novela', 176, 'Una corrida de toros andina en Puquio.'],
      ['Los ríos profundos', 1958, 'Novela', 288, 'La adolescencia de Ernesto entre dos mundos.'],
      ['Todas las sangres', 1964, 'Novela', 600, 'El conflicto social en la sierra peruana.'],
    ],
  },
]

const gaboBooks = [
  ['La hojarasca', 1955, 'Novela', 160, 'La primera novela ambientada en Macondo.'],
  ['Cien años de soledad', 1967, 'Novela', 417, 'Obra maestra del realismo mágico.', '978-0307474728'],
  ['Relato de un náufrago', 1970, 'Periodismo', 110, 'Crónica de un marinero que sobrevivió diez días en el mar.'],
  ['Crónica de una muerte anunciada', 1981, 'Novela', 120, 'Un crimen que todo el pueblo sabía que iba a ocurrir.'],
  ['El amor en los tiempos del cólera', 1985, 'Novela', 368, 'Un amor que espera más de cincuenta años.'],
  ['El general en su laberinto', 1989, 'Novela', 288, 'El último viaje de Simón Bolívar.'],
  ['Doce cuentos peregrinos', 1992, 'Cuento', 240, 'Latinoamericanos en Europa.'],
  ['Del amor y otros demonios', 1994, 'Novela', 208, 'Una niña marquesa y un sacerdote en Cartagena colonial.'],
]

async function addBooks(authorId, books) {
  let created = 0
  for (const [title, publishedYear, genre, pages, description, isbn] of books) {
    const exists = await prisma.book.findFirst({ where: { title, authorId } })
    if (exists) continue
    await prisma.book.create({
      data: { title, publishedYear, genre, pages, description, isbn: isbn ?? null, authorId },
    })
    created++
  }
  return created
}

let createdBooks = 0
for (const { books, ...data } of authors) {
  const author = await prisma.author.upsert({ where: { email: data.email }, update: {}, create: data })
  createdBooks += await addBooks(author.id, books)
}

const gabo = await prisma.author.findUnique({ where: { email: 'gabo@example.com' } })
if (gabo) createdBooks += await addBooks(gabo.id, gaboBooks)

console.log(`Seed listo: ${authors.length} autores revisados, ${createdBooks} libros nuevos${gabo ? ' (incluye García Márquez)' : ''}`)
await prisma.$disconnect()
