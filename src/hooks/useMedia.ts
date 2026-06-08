import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { listMedia, signPaths, type MediaParent } from '@/lib/mediaApi'
import type { MediaWithUrl } from '@/lib/types'

// Charge les médias d'un parent (matériel OU document) et signe leurs URLs.
// Le jeton de séquence évite les résultats périmés entre refetchs concurrents.
export function useMedia(parent: MediaParent) {
  const key = parent.materielId ?? parent.documentId ?? ''
  const kind = parent.materielId ? 'materiel' : 'document'

  const [items, setItems] = useState<MediaWithUrl[]>([])
  const [loading, setLoading] = useState(Boolean(supabase) && key !== '')
  const [error, setError] = useState<string | null>(null)
  const seqRef = useRef(0)

  const load = useCallback(() => {
    if (!supabase || !key) return Promise.resolve()
    const seq = ++seqRef.current
    const p: MediaParent = kind === 'materiel' ? { materielId: key } : { documentId: key }
    return listMedia(p)
      .then(async rows => {
        const urls = await signPaths(rows.map(r => r.path))
        if (seq !== seqRef.current) return
        setItems(rows.map(r => ({ ...r, url: urls[r.path] ?? '' })))
        setError(null)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (seq !== seqRef.current) return
        setError(e instanceof Error ? e.message : 'Erreur de chargement des images.')
        setLoading(false)
      })
  }, [key, kind])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invalidation intentionnelle du jeton de séquence au démontage
    return () => { seqRef.current++ }
  }, [load])

  return { items, loading, error, refetch: load }
}
