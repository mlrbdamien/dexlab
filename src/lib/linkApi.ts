import { supabase } from '@/lib/supabase'

function client() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

// Met à jour l'ensemble des documents liés à un matériel (diff add/remove).
export async function setMaterielLinks(materielId: string, desiredDocIds: string[], currentDocIds: string[]) {
  const toAdd = desiredDocIds.filter(id => !currentDocIds.includes(id))
  const toRemove = currentDocIds.filter(id => !desiredDocIds.includes(id))
  if (toAdd.length) {
    const { error } = await client().from('materiel_document').insert(toAdd.map(document_id => ({ materiel_id: materielId, document_id })))
    if (error) throw error
  }
  if (toRemove.length) {
    const { error } = await client().from('materiel_document').delete().eq('materiel_id', materielId).in('document_id', toRemove)
    if (error) throw error
  }
}

// Met à jour l'ensemble des matériels liés à un document (diff add/remove).
export async function setDocumentLinks(documentId: string, desiredMaterielIds: string[], currentMaterielIds: string[]) {
  const toAdd = desiredMaterielIds.filter(id => !currentMaterielIds.includes(id))
  const toRemove = currentMaterielIds.filter(id => !desiredMaterielIds.includes(id))
  if (toAdd.length) {
    const { error } = await client().from('materiel_document').insert(toAdd.map(materiel_id => ({ materiel_id, document_id: documentId })))
    if (error) throw error
  }
  if (toRemove.length) {
    const { error } = await client().from('materiel_document').delete().eq('document_id', documentId).in('materiel_id', toRemove)
    if (error) throw error
  }
}
