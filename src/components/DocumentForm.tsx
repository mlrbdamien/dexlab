import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Markdown } from '@/components/Markdown'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import type { DocItem, DocInput, DocType } from '@/lib/types'

const SW = 1.75
const inputCls = 'h-9 w-full rounded-lg border border-line bg-canvas px-2.5 text-[0.82rem] text-ink outline-none transition duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20'
const labelCls = 'mb-1 block text-[0.7rem] font-medium text-ink-2'

const TYPES: { value: DocType; label: string }[] = [
  { value: 'note', label: 'Note' },
  { value: 'memo', label: 'Mémo' },
  { value: 'procedure', label: 'Procédure' },
]

interface Props {
  initial: DocItem | null            // null = création
  defaultType?: DocType              // type par défaut en création
  onSave: (input: DocInput) => Promise<void>
  onClose: () => void
}

export function DocumentForm({ initial, defaultType = 'note', onSave, onClose }: Props) {
  const [type, setType] = useState<DocType>(initial?.type ?? defaultType)
  const [titre, setTitre] = useState(initial?.titre ?? '')
  const [contenu, setContenu] = useState(initial?.contenu ?? '')
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(', '))
  const [epingle, setEpingle] = useState(initial?.epingle ?? false)
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formRef = useRef<HTMLFormElement>(null)
  const titreRef = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)
  useEffect(() => { busyRef.current = busy }, [busy])
  const dirty = titre !== (initial?.titre ?? '') || contenu !== (initial?.contenu ?? '') || epingle !== (initial?.epingle ?? false) || type !== (initial?.type ?? defaultType) || tagsRaw !== (initial?.tags ?? []).join(', ')
  const dirtyRef = useRef(false)
  useEffect(() => { dirtyRef.current = dirty }, [dirty])
  useFocusTrap(formRef)

  const requestClose = () => {
    if (busyRef.current) return
    if (dirtyRef.current && !window.confirm('Abandonner les modifications non enregistrées ?')) return
    onClose()
  }

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const t = setTimeout(() => titreRef.current?.focus(), 0)
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        if (busyRef.current) return
        if (dirtyRef.current && !window.confirm('Abandonner les modifications non enregistrées ?')) return
        onClose()
      }
    }
    window.addEventListener('keydown', h, true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', h, true)
      document.body.style.overflow = prevOverflow
      trigger?.focus?.()
    }
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titre.trim()) { setError('Le titre est requis.'); titreRef.current?.focus(); return }
    setBusy(true)
    setError(null)
    const input: DocInput = {
      type, titre: titre.trim(), contenu,
      tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      epingle,
    }
    try {
      await onSave(input)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 py-[5vh]" role="dialog" aria-modal="true" aria-label={initial ? 'Éditer le document' : 'Nouveau document'}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={requestClose} />
      <form ref={formRef} onSubmit={submit} className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl animate-[pop-in_150ms_ease-out]">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[0.92rem] font-semibold text-ink">{initial ? 'Éditer le document' : 'Nouveau document'}</h2>
          <button type="button" onClick={requestClose} disabled={busy} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink disabled:opacity-50">
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls} htmlFor="doc-titre">Titre *</label>
              <input id="doc-titre" ref={titreRef} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? 'doc-error' : undefined} value={titre} onChange={e => setTitre(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="doc-type">Type</label>
              <select id="doc-type" value={type} onChange={e => setType(e.target.value as DocType)} className={inputCls}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="doc-tags">Tags (séparés par des virgules)</label>
              <input id="doc-tags" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} className={inputCls} placeholder="ex. hémato, urgent" />
            </div>
          </div>

          <label className="flex w-fit items-center gap-2 text-[0.78rem] text-ink-2">
            <input type="checkbox" checked={epingle} onChange={e => setEpingle(e.target.checked)} className="h-4 w-4 accent-[var(--c-accent)]" />
            Épingler
          </label>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className={`${labelCls} mb-0`} htmlFor="doc-contenu">Contenu (markdown)</label>
              <button type="button" onClick={() => setPreview(p => !p)} aria-pressed={preview} className="text-[0.72rem] font-medium text-accent">
                {preview ? 'Éditer' : 'Aperçu'}
              </button>
            </div>
            {preview ? (
              <div className="min-h-[16rem] rounded-lg border border-line bg-canvas-2/40 px-3.5 py-3">
                {contenu.trim() ? <Markdown>{contenu}</Markdown> : <p className="text-[0.8rem] text-ink-3">Rien à prévisualiser.</p>}
              </div>
            ) : (
              <textarea id="doc-contenu" value={contenu} onChange={e => setContenu(e.target.value)} rows={14} className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-[0.8rem] leading-relaxed text-ink outline-none transition duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20" />
            )}
          </div>

          {error && <p id="doc-error" role="alert" className="text-[0.78rem] text-red">{error}</p>}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-3.5">
          <button type="button" onClick={requestClose} disabled={busy} className="h-9 rounded-lg border border-line px-3.5 text-[0.82rem] font-medium text-ink-2 transition-colors duration-150 hover:text-ink disabled:opacity-50">Annuler</button>
          <button type="submit" disabled={busy} className="h-9 rounded-lg bg-accent px-4 text-[0.82rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-60">
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
