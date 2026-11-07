import { NextResponse } from 'next/server'

// Respuesta JSON con sangría (legible al abrir el endpoint en el navegador)
export function prettyJson(data: unknown, init?: ResponseInit) {
  return new NextResponse(JSON.stringify(data, null, 2), {
    ...init,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...init?.headers },
  })
}
