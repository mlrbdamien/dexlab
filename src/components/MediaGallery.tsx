import { useEffect, useMemo, useRef, useState } from 'react'
import { Paperclip, Trash2, X, ChevronLeft, ChevronRight, ImageOff, FileText, ExternalLink } from 'lucide-react'
import { useMedia } from '@/hooks/useMedia'
import { uploadMedia, deleteMedia, isImagePath, type MediaParent } from '@/lib/mediaApi'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { MediaWithUrl } from '@/lib/types'

const SW = 1.75
const MAX_MB = 40
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024
const ACCEPT = 'image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.ods,.odp'

// Couleur d'icône selon le type de fichier (sémantique, pas décoratif).
function fileColor(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'text-red'
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return 'text-blu'
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'text-grn'
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'text-org'
  return 'text-accent'
}

interface Props {
  materielId?: string
  documentId?: string
}

export function MediaGallery({ materielId, documentId }: Props) {
  const parent = useMemo<MediaParent>(() => ({ materielId, documentId }), [materielId, documentId])
  const { items, loading, error, refetch } = useMedia(parent)
  const [busy, setBusy] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const images = useMemo(() => items.filter(m => isImagePath(m.path)), [items])
  const files = useMemo(() => items.filter(m => !isImagePath(m.path)), [items])

  const onPick = async (picked: FileList | null) => {
    if (!picked || picked.length === 0) return
    setBusy(true)
    setUploadError(null)
    try {
      let pos = items.length ? Math.max(...items.map(i => i.position)) + 1 : 0
      let tooBig = false
      for (const file of Array.from(picked)) {
        if (file.size > MAX_FILE_SIZE) { tooBig = true; continue }
        await uploadMedia(file, parent, pos++)
      }
      if (tooBig) setUploadError(`Certains fichiers dépassent ${MAX_MB} Mo et ont été ignorés.`)
      await refetch()
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Échec de l’envoi.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDelete = async (m: MediaWithUrl) => {
    if (!window.confirm('Supprimer cette pièce jointe ? Action irréversible.')) return
    try {
      await deleteMedia(m)
      await refetch()
    } catch {
      window.alert('Échec de la suppression. Vérifie ta connexion et réessaie.')
    }
  }

  return (
    <div className="print-hide mt-2 border-t border-line pt-4">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-2">
          Pièces jointes{items.length > 0 ? ` (${items.length})` : ''}
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-1 text-[0.72rem] font-medium text-accent transition-colors duration-150 hover:text-accent-ink disabled:opacity-50"
        >
          <Paperclip aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> {busy ? 'Envoi…' : 'Ajouter'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={e => { void onPick(e.target.files) }}
        />
      </div>

      {uploadError && <p role="alert" className="mb-2 text-[0.75rem] text-red">{uploadError}</p>}

      {error ? (
        <div className="rounded-xl border border-red/30 bg-red-soft p-3 text-[0.78rem] text-red">
          Impossible de charger les pièces jointes : {error}.
          <button onClick={() => void refetch()} className="ml-2 font-medium underline">Réessayer</button>
        </div>
      ) : loading && items.length === 0 ? (
        <p className="py-4 text-[0.75rem] text-ink-2">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="text-[0.75rem] text-ink-2">Aucune pièce jointe.</p>
      ) : (
        <div className="space-y-3">
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((m, i) => (
                <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-canvas-2">
                  <button
                    type="button"
                    onClick={() => setLightbox(i)}
                    className="block h-full w-full"
                    aria-label={m.caption || `Agrandir l’image ${i + 1}`}
                  >
                    {m.url ? (
                      <img src={m.url} alt={m.caption || `Image ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-ink-3">
                        <ImageOff aria-hidden="true" className="h-5 w-5" strokeWidth={SW} />
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(m)}
                    aria-label="Supprimer l’image"
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-150 hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-1.5">
              {files.map(m => (
                <div key={m.id} className="group relative flex items-center rounded-xl border border-line bg-canvas pr-9 transition-colors duration-150 hover:border-ink-3/30">
                  <a href={m.url || undefined} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5">
                    <FileText aria-hidden="true" className={`h-4 w-4 shrink-0 ${fileColor(m.path)}`} strokeWidth={SW} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8rem] font-medium text-ink">{m.caption || 'Fichier'}</span>
                      <span className="text-[0.62rem] font-medium uppercase tracking-wide text-ink-2">{(m.path.split('.').pop() || '').slice(0, 5)}</span>
                    </span>
                    <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={SW} />
                  </a>
                  <button
                    type="button"
                    onClick={() => void onDelete(m)}
                    aria-label={`Supprimer ${m.caption || 'le fichier'}`}
                    className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-red-soft hover:text-red"
                  >
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lightbox !== null && images[lightbox] && (
        <Lightbox items={images} index={lightbox} onClose={() => setLightbox(null)} onNavigate={setLightbox} />
      )}
    </div>
  )
}

function Lightbox({ items, index, onClose, onNavigate }: { items: MediaWithUrl[]; index: number; onClose: () => void; onNavigate: (i: number) => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef)
  const current = items[index]
  const hasPrev = index > 0
  const hasNext = index < items.length - 1

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose() }
      else if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); onNavigate(index - 1) }
      else if (e.key === 'ArrowRight' && index < items.length - 1) { e.preventDefault(); onNavigate(index + 1) }
    }
    window.addEventListener('keydown', h, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h, true); document.body.style.overflow = prev; trigger?.focus?.() }
  }, [index, items.length, onClose, onNavigate])

  // Garde-fou : si la liste rétrécit pendant l'ouverture, on referme proprement.
  if (!current) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Image agrandie">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div ref={panelRef} className="relative flex max-h-full max-w-5xl flex-col items-center">
        <div className="absolute -top-1 right-0 z-10 flex translate-y-[-110%] items-center gap-2 sm:translate-y-0 sm:-top-12">
          <span className="rounded-lg bg-white/10 px-2.5 py-1 text-[0.72rem] font-medium text-white/80">{index + 1} / {items.length}</span>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors duration-150 hover:bg-white/20">
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={SW} />
          </button>
        </div>

        {current.url ? (
          <img src={current.url} alt={current.caption || `Image ${index + 1}`} className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl" />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-xl bg-white/5 text-white/50">
            <ImageOff aria-hidden="true" className="h-8 w-8" strokeWidth={SW} />
          </div>
        )}

        {current.caption && <p className="mt-3 max-w-xl text-center text-[0.8rem] text-white/80">{current.caption}</p>}

        {hasPrev && (
          <button type="button" onClick={() => onNavigate(index - 1)} aria-label="Image précédente" className="absolute left-0 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 sm:-translate-x-14">
            <ChevronLeft aria-hidden="true" className="h-6 w-6" strokeWidth={SW} />
          </button>
        )}
        {hasNext && (
          <button type="button" onClick={() => onNavigate(index + 1)} aria-label="Image suivante" className="absolute right-0 top-1/2 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 sm:translate-x-14">
            <ChevronRight aria-hidden="true" className="h-6 w-6" strokeWidth={SW} />
          </button>
        )}
      </div>
    </div>
  )
}
