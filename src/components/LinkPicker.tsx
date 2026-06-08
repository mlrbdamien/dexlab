import { useEffect, useRef, useState } from 'react'
import { X, Check } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const SW = 1.75
const inputCls = 'h-9 w-full rounded-lg border border-line bg-canvas px-2.5 text-[0.82rem] text-ink outline-none transition duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20'

export interface LinkOption { id: string; label: string; sub?: string }

interface Props {
  title: string
  options: LinkOption[]
  selected: string[]
  onSave: (ids: string[]) => Promise<void>
  onClose: () => void
}

export function LinkPicker({ title, options, selected, onSave, onClose }: Props) {
  const [sel, setSel] = useState<Set<string>>(() => new Set(selected))
  const [filter, setFilter] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const busyRef = useRef(false)
  useEffect(() => { busyRef.current = busy }, [busy])
  const filterRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef)

  const requestClose = () => { if (!busyRef.current) onClose() }

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const t = setTimeout(() => filterRef.current?.focus(), 0)
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); if (!busyRef.current) onClose() } }
    window.addEventListener('keydown', h, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { clearTimeout(t); window.removeEventListener('keydown', h, true); document.body.style.overflow = prev; trigger?.focus?.() }
  }, [onClose])

  const toggle = (id: string) => setSel(s => {
    const n = new Set(s)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      await onSave([...sel])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’enregistrement.')
      setBusy(false)
    }
  }

  const q = filter.trim().toLowerCase()
  const shown = q ? options.filter(o => o.label.toLowerCase().includes(q) || (o.sub ?? '').toLowerCase().includes(q)) : options

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 py-[6vh]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={requestClose} />
      <div ref={panelRef} className="relative flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl animate-[pop-in_150ms_ease-out]">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[0.92rem] font-semibold text-ink">{title}</h2>
          <button type="button" onClick={requestClose} disabled={busy} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink disabled:opacity-50">
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
          </button>
        </div>

        <div className="shrink-0 border-b border-line px-4 py-2.5">
          <input ref={filterRef} value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrer…" aria-label="Filtrer" className={inputCls} />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {shown.length === 0 ? (
            <p className="px-3 py-8 text-center text-[0.82rem] text-ink-3">Aucun élément.</p>
          ) : (
            shown.map(o => {
              const on = sel.has(o.id)
              return (
                <button key={o.id} type="button" onClick={() => toggle(o.id)} aria-pressed={on} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${on ? 'bg-accent-soft' : ''}`}>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? 'border-accent bg-accent text-white' : 'border-line'}`}>
                    {on && <Check aria-hidden="true" className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.85rem] text-ink">{o.label}</span>
                    {o.sub && <span className="block truncate text-[0.68rem] text-ink-3">{o.sub}</span>}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {error && <p role="alert" className="px-5 pb-1 pt-2 text-[0.78rem] text-red">{error}</p>}

        <div className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-3.5">
          <button type="button" onClick={requestClose} disabled={busy} className="h-9 rounded-lg border border-line px-3.5 text-[0.82rem] font-medium text-ink-2 transition-colors duration-150 hover:text-ink disabled:opacity-50">Annuler</button>
          <button type="button" onClick={save} disabled={busy} className="h-9 rounded-lg bg-accent px-4 text-[0.82rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-60">
            {busy ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
