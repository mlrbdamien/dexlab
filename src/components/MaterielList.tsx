import { useEffect, useRef } from 'react'
import { Star, TestTube } from 'lucide-react'
import type { Materiel, CentrifugationStatus } from '@/lib/types'

const SW = 1.75

const centriLabel: Record<CentrifugationStatus, string> = {
  oui: 'Oui', obligatoire: 'Obligatoire', non: 'Non', variable: 'Variable', na: 'N/A',
}
const centriDot: Record<CentrifugationStatus, string> = {
  oui: 'bg-grn', obligatoire: 'bg-org', non: 'bg-red', variable: 'bg-ink-3', na: 'bg-ink-3',
}

interface Props {
  tubes: Materiel[]
  selectedId: string | null
  isFav: (id: string) => boolean
  onToggleFav: (id: string) => void
  onSelect: (m: Materiel) => void
}

// Liste compacte du panneau gauche (master-detail). Chaque ligne porte un
// liseré à la couleur du bouchon (motif d'identité) et un statut en point + label.
export function MaterielList({ tubes, selectedId, isFav, onToggleFav, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Garde la ligne sélectionnée visible (utile pour la navigation clavier ↑/↓)
  useEffect(() => {
    if (!selectedId) return
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(selectedId)}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedId])

  return (
    <div ref={containerRef} className="divide-y divide-line">
      {tubes.map(t => {
        const sel = t.id === selectedId
        const fav = isFav(t.id)
        return (
          <div key={t.id} className="group relative">
            <button
              data-id={t.id}
              onClick={() => onSelect(t)}
              aria-current={sel ? 'true' : undefined}
              className={`relative flex w-full flex-col gap-1 py-2.5 pl-4 pr-10 text-left transition-colors duration-100 ${sel ? 'bg-canvas-2' : 'hover:bg-canvas-2/60'}`}
            >
              <span aria-hidden="true" className={`absolute left-0 top-0 h-full w-[3px] transition-opacity duration-150 ${sel ? 'opacity-100' : 'opacity-40'}`} style={{ background: t.couleur }} />
              <span className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10 dark:border-white/15" style={{ background: t.couleur }} />
                <span className="truncate text-[0.85rem] font-medium text-ink">{t.nom}</span>
                <span className="ml-auto shrink-0 font-mono text-[0.68rem] text-ink-3">{t.etiquette}</span>
              </span>
              <span className="flex items-center gap-2 pl-[1.25rem] text-[0.72rem] text-ink-2">
                <span className="truncate">{t.type}</span>
                <span className="text-ink-3/40">·</span>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${centriDot[t.centrifugation]}`} aria-hidden="true" />
                <span className="shrink-0 text-ink-3">{centriLabel[t.centrifugation]}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onToggleFav(t.id)}
              aria-label={fav ? `Retirer ${t.nom} des favoris` : `Ajouter ${t.nom} aux favoris`}
              aria-pressed={fav}
              className={`absolute right-2 top-2.5 flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${fav ? 'text-amber-500' : 'text-ink-3/30 hover:text-ink-3 group-hover:text-ink-3/60'}`}
            >
              <Star className="h-3.5 w-3.5" strokeWidth={SW} fill={fav ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function MaterielListSkeleton() {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 py-3 pl-4 pr-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-canvas-3" />
            <span className="h-3 w-28 animate-pulse rounded bg-canvas-3" />
            <span className="ml-auto h-3 w-8 animate-pulse rounded bg-canvas-3" />
          </div>
          <span className="ml-[1.25rem] h-2.5 w-20 animate-pulse rounded bg-canvas-3" />
        </div>
      ))}
    </div>
  )
}

export function MaterielEmptyState() {
  return (
    <div className="fade-up flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-canvas-2 text-ink-3">
        <TestTube className="h-5 w-5" strokeWidth={SW} aria-hidden="true" />
      </div>
      <p className="text-[0.85rem] font-medium text-ink">Sélectionne un échantillon</p>
      <p className="mt-1 max-w-[15rem] text-[0.75rem] leading-relaxed text-ink-3">Choisis un tube dans la liste pour afficher sa fiche. Navigation : ↑ ↓ pour parcourir, Échap pour fermer.</p>
    </div>
  )
}
