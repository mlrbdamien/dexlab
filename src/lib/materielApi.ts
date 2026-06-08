import { supabase } from '@/lib/supabase'
import type { MaterielInput } from '@/lib/types'

function toRow(input: MaterielInput) {
  return {
    type: input.type,
    nom: input.nom,
    sous_titre: input.sousTitre,
    etiquette: input.etiquette,
    couleur: input.couleur,
    centrifugation: input.centrifugation,
    centrifugation_detail: input.centrifugationDetail,
    code_exces: input.codeExces,
    code_sans_analyse: input.codeSansAnalyse,
    code_reserve: input.codeReserve,
    destinations: input.destinations,
    notes: input.notes,
    alertes: input.alertes,
    cas_particuliers: input.casParticuliers,
  }
}

function client() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

export async function createMateriel(input: MaterielInput, position: number) {
  const { error } = await client().from('materiel').insert({ ...toRow(input), position })
  if (error) throw error
}

export async function updateMateriel(id: string, input: MaterielInput) {
  const { error } = await client().from('materiel').update(toRow(input)).eq('id', id)
  if (error) throw error
}

export async function deleteMateriel(id: string) {
  const { error } = await client().from('materiel').delete().eq('id', id)
  if (error) throw error
}
