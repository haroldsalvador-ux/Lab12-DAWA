// Color estable por texto (avatares y etiquetas de género)
export function hue(seed = '') {
  let h = 7
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 360
  return h
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export const number = (n: number) => new Intl.NumberFormat('es-PE').format(n)

export const date = (iso: string) =>
  new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(iso))
