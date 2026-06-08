import { supabase } from '@/lib/supabase'
import type { DocInput } from '@/lib/types'

function toRow(input: DocInput) {
  return {
    type: input.type,
    titre: input.titre,
    contenu: input.contenu,
    tags: input.tags,
    epingle: input.epingle,
  }
}

function client() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

export async function createDocument(input: DocInput, position: number) {
  const { error } = await client().from('documents').insert({ ...toRow(input), position })
  if (error) throw error
}

export async function updateDocument(id: string, input: DocInput) {
  const { error } = await client().from('documents').update(toRow(input)).eq('id', id)
  if (error) throw error
}

export async function deleteDocument(id: string) {
  const { error } = await client().from('documents').delete().eq('id', id)
  if (error) throw error
}
