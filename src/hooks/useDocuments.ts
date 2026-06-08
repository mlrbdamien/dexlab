import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DocItem, DocType } from '@/lib/types'

interface DocRow {
  id: string
  type: DocType
  titre: string
  contenu: string
  tags: string[] | null
  epingle: boolean
  position: number
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
}

function rowToDoc(r: DocRow): DocItem {
  return {
    id: r.id,
    type: r.type,
    titre: r.titre,
    contenu: r.contenu ?? '',
    tags: r.tags ?? [],
    epingle: r.epingle,
    position: r.position,
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
    createdBy: r.created_by,
    updatedBy: r.updated_by,
  }
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)
  const seqRef = useRef(0)

  const load = useCallback(() => {
    if (!supabase) return Promise.resolve()
    const seq = ++seqRef.current
    return supabase
      .from('documents')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data, error: err }) => {
        if (seq !== seqRef.current) return
        if (err) setError(err.message)
        else { setDocuments((data as DocRow[] ?? []).map(rowToDoc)); setError(null) }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invalidation intentionnelle du jeton au démontage
    return () => { seqRef.current++ }
  }, [load])

  return { documents, loading, error, refetch: load }
}
