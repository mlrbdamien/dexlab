import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { tubes } from '@/data/tubes'
import type { Tube } from '@/lib/types'

const tubeFuse = new Fuse(tubes, {
  keys: ['nom', 'sousTitre', 'motsCles', 'etiquette'],
  threshold: 0.35,
  ignoreLocation: true,
})

export function useSearch() {
  const [query, setQuery] = useState('')

  const filteredTubes: Tube[] = useMemo(() => {
    if (!query.trim()) return tubes
    return tubeFuse.search(query).map(r => r.item)
  }, [query])

  return { query, setQuery, filteredTubes } as const
}
