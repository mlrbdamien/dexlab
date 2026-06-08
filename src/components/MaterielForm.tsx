import { useEffect, useRef, useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Materiel, MaterielInput, CentrifugationStatus, MaterielDestination } from '@/lib/types'

const SW = 1.75
const inputCls = 'h-9 w-full rounded-lg border border-line bg-canvas px-2.5 text-[0.82rem] text-ink outline-none transition duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20'
const labelCls = 'mb-1 block text-[0.7rem] font-medium text-ink-2'

const CENTRI: { value: CentrifugationStatus; label: string }[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'obligatoire', label: 'Obligatoire' },
  { value: 'non', label: 'Non' },
  { value: 'variable', label: 'Variable' },
  { value: 'na', label: 'N/A' },
]
const TYPES = ['tube', 'consommable', 'contenant', 'autre']

function emptyInput(): MaterielInput {
  return {
    type: 'tube', nom: '', sousTitre: '', etiquette: '', couleur: '#64748B',
    centrifugation: 'na', centrifugationDetail: '',
    codeExces: '', codeSansAnalyse: '', codeReserve: '',
    destinations: [], notes: [], alertes: [], casParticuliers: [],
  }
}
function fromMateriel(m: Materiel): MaterielInput {
  return {
    type: m.type, nom: m.nom, sousTitre: m.sousTitre, etiquette: m.etiquette, couleur: m.couleur,
    centrifugation: m.centrifugation, centrifugationDetail: m.centrifugationDetail,
    codeExces: m.codeExces, codeSansAnalyse: m.codeSansAnalyse, codeReserve: m.codeReserve,
    destinations: m.destinations.map(d => ({ ...d })),
    notes: [...m.notes], alertes: [...m.alertes], casParticuliers: [...m.casParticuliers],
  }
}

interface Props {
  initial: Materiel | null   // null = création
  onSave: (input: MaterielInput) => Promise<void>
  onClose: () => void
}

export function MaterielForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<MaterielInput>(initial ? fromMateriel(initial) : emptyInput())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nomRef = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)
  useEffect(() => { busyRef.current = busy }, [busy])

  const requestClose = () => { if (!busyRef.current) onClose() }

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const t = setTimeout(() => nomRef.current?.focus(), 0)
    // Capture : neutralise le raccourci Échap de la page pendant que la modale est ouverte.
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopImmediatePropagation(); if (!busyRef.current) onClose() }
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

  function set<K extends keyof MaterielInput>(k: K, v: MaterielInput[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nom.trim()) { setError('Le nom est requis.'); nomRef.current?.focus(); return }
    setBusy(true)
    setError(null)
    try {
      await onSave({ ...form, nom: form.nom.trim() })
      // succès → le parent ferme le formulaire
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 py-[5vh]" role="dialog" aria-modal="true" aria-label={initial ? 'Éditer le matériel' : 'Nouveau matériel'}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={requestClose} />
      <form onSubmit={submit} className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl animate-[pop-in_150ms_ease-out]">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[0.92rem] font-semibold text-ink">{initial ? 'Éditer le matériel' : 'Nouveau matériel'}</h2>
          <button type="button" onClick={requestClose} disabled={busy} aria-label="Fermer" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink disabled:opacity-50">
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls} htmlFor="mat-nom">Nom *</label>
              <input id="mat-nom" ref={nomRef} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? 'mat-error' : undefined} value={form.nom} onChange={e => set('nom', e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className={labelCls} htmlFor="mat-st">Sous-titre</label>
              <input id="mat-st" value={form.sousTitre} onChange={e => set('sousTitre', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="mat-type">Type</label>
              <select id="mat-type" value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="mat-etiq">Étiquette</label>
              <input id="mat-etiq" value={form.etiquette} onChange={e => set('etiquette', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="mat-centri">Centrifugation</label>
              <select id="mat-centri" value={form.centrifugation} onChange={e => set('centrifugation', e.target.value as CentrifugationStatus)} className={inputCls}>
                {CENTRI.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="mat-couleur">Couleur</label>
              <div className="flex gap-1.5">
                <input id="mat-couleur" type="color" value={form.couleur || '#64748B'} onChange={e => set('couleur', e.target.value)} className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-line bg-canvas" />
                <input value={form.couleur} onChange={e => set('couleur', e.target.value)} aria-label="Couleur (code hexadécimal)" className={`${inputCls} font-mono`} placeholder="#RRGGBB" />
              </div>
            </div>
            <div className="col-span-2">
              <label className={labelCls} htmlFor="mat-cd">Détail centrifugation</label>
              <input id="mat-cd" value={form.centrifugationDetail} onChange={e => set('centrifugationDetail', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelCls} htmlFor="mat-ce">Code excès</label>
              <input id="mat-ce" value={form.codeExces} onChange={e => set('codeExces', e.target.value)} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls} htmlFor="mat-csa">Code sans analyse</label>
              <input id="mat-csa" value={form.codeSansAnalyse} onChange={e => set('codeSansAnalyse', e.target.value)} className={`${inputCls} font-mono`} />
            </div>
            <div>
              <label className={labelCls} htmlFor="mat-cr">Code réserve</label>
              <input id="mat-cr" value={form.codeReserve} onChange={e => set('codeReserve', e.target.value)} className={`${inputCls} font-mono`} />
            </div>
          </div>

          <DestinationsField items={form.destinations} onChange={v => set('destinations', v)} />
          <StringListField label="Notes" items={form.notes} onChange={v => set('notes', v)} />
          <StringListField label="Alertes" items={form.alertes} onChange={v => set('alertes', v)} />
          <StringListField label="Cas particuliers" items={form.casParticuliers} onChange={v => set('casParticuliers', v)} />

          {error && <p id="mat-error" role="alert" className="text-[0.78rem] text-red">{error}</p>}
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

function StringListField({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  return (
    <div role="group" aria-label={label}>
      <span className={labelCls}>{label}</span>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={i} className="flex gap-1.5">
            <input value={it} aria-label={`${label} ${i + 1}`} onChange={e => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className={inputCls} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Supprimer ${label.toLowerCase()} ${i + 1}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:text-red">
              <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="flex items-center gap-1 text-[0.75rem] font-medium text-accent">
          <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Ajouter
        </button>
      </div>
    </div>
  )
}

function DestinationsField({ items, onChange }: { items: MaterielDestination[]; onChange: (v: MaterielDestination[]) => void }) {
  const upd = (i: number, patch: Partial<MaterielDestination>) => onChange(items.map((d, j) => (j === i ? { ...d, ...patch } : d)))
  return (
    <div role="group" aria-label="Destinations">
      <span className={labelCls}>Destinations</span>
      <div className="space-y-1.5">
        {items.map((d, i) => (
          <div key={i} className="flex gap-1.5">
            <input value={d.label} aria-label={`Label destination ${i + 1}`} onChange={e => upd(i, { label: e.target.value })} placeholder="Label" className={`${inputCls} w-1/3`} />
            <input value={d.detail} aria-label={`Détail destination ${i + 1}`} onChange={e => upd(i, { detail: e.target.value })} placeholder="Détail" className={inputCls} />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Supprimer destination ${i + 1}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:text-red">
              <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, { label: '', detail: '' }])} className="flex items-center gap-1 text-[0.75rem] font-medium text-accent">
          <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Ajouter
        </button>
      </div>
    </div>
  )
}
