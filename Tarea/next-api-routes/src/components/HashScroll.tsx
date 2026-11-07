'use client'

import { useEffect } from 'react'

// Si la URL trae #seccion, baja hasta esa sección cuando ya cargaron los datos
export function HashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    // Reintenta hasta que la sección exista (los datos llegan después de montar la página)
    let tries = 0
    const t = setInterval(() => {
      const el = document.getElementById(id)
      if (el && tries > 4) { el.scrollIntoView({ block: 'end' }); clearInterval(t) }
      if (++tries > 40) clearInterval(t)
    }, 250)
    return () => clearInterval(t)
  }, [])
  return null
}
