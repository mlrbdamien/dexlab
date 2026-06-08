import { supabase } from '@/lib/supabase'
import type { MediaItem } from '@/lib/types'

const BUCKET = 'media'

function client() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase
}

export interface MediaParent {
  materielId?: string
  documentId?: string
}

// ----------------------------------------------------------------
// Compression côté client : redimensionne (max 1600 px) et ré-encode
// en JPEG ~0.82. Réduit fortement le poids stocké. En cas d'échec
// (format non décodable, etc.) on retombe sur le fichier d'origine.
// ----------------------------------------------------------------
async function decodeBitmap(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    try { return await createImageBitmap(file) } catch { return null }
  }
}

export async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file
  const bitmap = await decodeBitmap(file)
  if (!bitmap) return file
  try {
    let { width, height } = bitmap
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height)
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/jpeg', quality))
    return blob ?? file
  } finally {
    bitmap.close?.()
  }
}

function rowToMedia(r: {
  id: string; materiel_id: string | null; document_id: string | null
  path: string; caption: string | null; position: number; created_at: string | null
}): MediaItem {
  return {
    id: r.id,
    materielId: r.materiel_id,
    documentId: r.document_id,
    path: r.path,
    caption: r.caption ?? '',
    position: r.position,
    createdAt: r.created_at ?? undefined,
  }
}

export async function listMedia(parent: MediaParent): Promise<MediaItem[]> {
  const sb = client()
  const col = parent.materielId ? 'materiel_id' : 'document_id'
  const id = parent.materielId ?? parent.documentId
  if (!id) return []
  const { data, error } = await sb.from('media').select('*').eq(col, id).order('position', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToMedia)
}

// Signe en lot les chemins → { path: url }. Les URLs expirent après `expiresIn` s.
export async function signPaths(paths: string[], expiresIn = 3600): Promise<Record<string, string>> {
  if (paths.length === 0) return {}
  const sb = client()
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrls(paths, expiresIn)
  if (error) throw error
  const out: Record<string, string> = {}
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) out[entry.path] = entry.signedUrl
  }
  return out
}

export async function uploadMedia(file: File, parent: MediaParent, position: number): Promise<void> {
  const sb = client()
  const id = parent.materielId ?? parent.documentId
  if (!id) throw new Error('Parent manquant')
  const folder = parent.materielId ? `materiel/${parent.materielId}` : `documents/${parent.documentId}`
  const blob = await compressImage(file)

  // Type/extension réels : la compression produit du JPEG, mais en cas de
  // repli (HEIC iPhone non décodable, etc.) on conserve les octets d'origine
  // et il faut alors un Content-Type et une extension cohérents.
  const contentType = blob.type || file.type || 'application/octet-stream'
  const subtype = contentType.split('/')[1] || ''
  const ext = (contentType === 'image/jpeg' ? 'jpg' : (subtype || file.name.split('.').pop() || 'bin')).toLowerCase()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error: upErr } = await sb.storage.from(BUCKET).upload(path, blob, {
    contentType,
    upsert: false,
  })
  if (upErr) throw upErr

  const { error: rowErr } = await sb.from('media').insert({
    materiel_id: parent.materielId ?? null,
    document_id: parent.documentId ?? null,
    path,
    caption: '',
    position,
  })
  if (rowErr) {
    // Annule l'objet déjà déposé pour éviter un orphelin de stockage.
    await sb.storage.from(BUCKET).remove([path]).catch(e => console.warn('media: rollback du stockage échoué', e))
    throw rowErr
  }
}

export async function deleteMedia(media: MediaItem): Promise<void> {
  const sb = client()
  // Ligne d'abord (une ligne orpheline afficherait une image cassée),
  // puis l'objet de stockage (un objet orphelin reste invisible).
  const { error: rowErr } = await sb.from('media').delete().eq('id', media.id)
  if (rowErr) throw rowErr
  await sb.storage.from(BUCKET).remove([media.path]).catch(e => console.warn('media: suppression du stockage échouée (objet orphelin)', e))
}
