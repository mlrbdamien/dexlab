import { useEffect, useState } from 'react'
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
  }
}

export function useDocuments() {
  const [documents, setDocuments] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('documents')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(err.message)
        else setDocuments((data as DocRow[] ?? []).map(rowToDoc))
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  return { documents, loading, error }
}
