import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Materiel, MaterielDestination, CentrifugationStatus } from '@/lib/types'

interface MaterielRow {
  id: string
  type: string
  nom: string
  sous_titre: string
  etiquette: string
  couleur: string
  centrifugation: CentrifugationStatus
  centrifugation_detail: string
  code_exces: string
  code_sans_analyse: string
  code_reserve: string
  destinations: MaterielDestination[] | null
  notes: string[] | null
  alertes: string[] | null
  cas_particuliers: string[] | null
  position: number
}

function rowToMateriel(r: MaterielRow): Materiel {
  return {
    id: r.id,
    type: r.type,
    nom: r.nom,
    sousTitre: r.sous_titre,
    etiquette: r.etiquette,
    couleur: r.couleur,
    centrifugation: r.centrifugation,
    centrifugationDetail: r.centrifugation_detail,
    codeExces: r.code_exces,
    codeSansAnalyse: r.code_sans_analyse,
    codeReserve: r.code_reserve,
    destinations: r.destinations ?? [],
    notes: r.notes ?? [],
    alertes: r.alertes ?? [],
    casParticuliers: r.cas_particuliers ?? [],
    position: r.position,
  }
}

export function useMateriel() {
  const [materiel, setMateriel] = useState<Materiel[]>([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    let active = true
    supabase
      .from('materiel')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(err.message)
        else setMateriel((data as MaterielRow[] ?? []).map(rowToMateriel))
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  return { materiel, loading, error }
}
