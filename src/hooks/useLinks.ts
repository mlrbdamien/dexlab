import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { MaterielDocumentLink } from '@/lib/types'

export function useLinks() {
  const [links, setLinks] = useState<MaterielDocumentLink[]>([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const seqRef = useRef(0)

  const load = useCallback(() => {
    if (!supabase) return Promise.resolve()
    const seq = ++seqRef.current
    return supabase
      .from('materiel_document')
      .select('materiel_id, document_id')
      .then(({ data }) => {
        if (seq !== seqRef.current) return
        setLinks((data as MaterielDocumentLink[]) ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invalidation intentionnelle du jeton au démontage
    return () => { seqRef.current++ }
  }, [load])

  return { links, loading, refetch: load }
}
