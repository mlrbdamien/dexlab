import { useState, useCallback } from 'react'

const STORAGE_KEY = 'tube-favs'

function readFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>(readFavs)

  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFav = useCallback((id: string) => favs.includes(id), [favs])

  return { favs, toggle, isFav } as const
}
