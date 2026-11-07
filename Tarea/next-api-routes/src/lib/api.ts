// Cliente mínimo para consumir las API Routes desde los componentes del navegador
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`)
  return body as T
}

export const json = (data: unknown) => JSON.stringify(data)

// Quita los campos vacíos de un formulario para no enviar "" a la API
export function clean<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v])
  ) as T
}
