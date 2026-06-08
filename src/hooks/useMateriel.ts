import { useCallback, useEffect, useRef, useState } from 'react'
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
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  updated_by: string | null
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
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
    createdBy: r.created_by,
    updatedBy: r.updated_by,
  }
}

export function useMateriel() {
  const [materiel, setMateriel] = useState<Materiel[]>([])
  const [loading, setLoading] = useState(Boolean(supabase))
  const [error, setError] = useState<string | null>(null)

  // Jeton de séquence : seul le résultat de la dernière invocation s'applique
  // (évite les données périmées entre refetchs concurrents et tout setState
  // après démontage — le cleanup incrémente le jeton).
  const seqRef = useRef(0)

  const load = useCallback(() => {
    if (!supabase) return Promise.resolve()
    const seq = ++seqRef.current
    return supabase
      .from('materiel')
      .select('*')
      .order('position', { ascending: true })
      .then(({ data, error: err }) => {
        if (seq !== seqRef.current) return
        if (err) setError(err.message)
        else { setMateriel((data as MaterielRow[] ?? []).map(rowToMateriel)); setError(null) }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invalidation intentionnelle du jeton de séquence au démontage
    return () => { seqRef.current++ }
  }, [load])

  return { materiel, loading, error, refetch: load }
}
