import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Materiel } from '@/lib/types'

export function useSearch(materiel: Materiel[]) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () => new Fuse(materiel, { keys: ['nom', 'sousTitre', 'etiquette'], threshold: 0.35, ignoreLocation: true }),
    [materiel],
  )

  const filteredMateriel: Materiel[] = useMemo(() => {
    if (!query.trim()) return materiel
    return fuse.search(query).map(r => r.item)
  }, [query, fuse, materiel])

  return { query, setQuery, filteredMateriel } as const
}
