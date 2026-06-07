import { Star } from 'lucide-react'
import type { Tube, CentrifugationStatus } from '@/lib/types'

const centriLabel: Record<CentrifugationStatus, string> = {
  oui: 'OUI', obligatoire: 'OBL', non: 'NON', variable: 'VAR', na: 'N/A',
}

const centriStyle: Record<CentrifugationStatus, string> = {
  oui:         'bg-grn-soft text-grn',
  obligatoire: 'bg-org-soft text-org',
  non:         'bg-red-soft text-red',
  variable:    'bg-canvas-2 text-ink-3',
  na:          'bg-canvas-2 text-ink-3',
}

interface Props {
  tube: Tube
  isFav: boolean
  onToggleFav: () => void
  onClick: () => void
}

export function TubeCard({ tube, isFav, onToggleFav, onClick }: Props) {
  return (
    <div className="group relative h-full">
      <button
        onClick={onClick}
        className="flex h-full w-full flex-col rounded-xl border border-line bg-canvas p-4 text-left transition-all duration-150 hover:border-ink-3/30 hover:shadow-sm active:scale-[0.98]"
      >
        {/* Top: pastille + badge centrifugation (l'étoile favori est superposée, hors du bouton) */}
        <div className="flex items-start justify-between gap-1 mb-auto pr-9">
          <span
            className="h-6 w-6 shrink-0 rounded-full border-[0.5px] border-black/8 dark:border-white/12"
            style={{ background: tube.couleur }}
          />
          <span className={`rounded-md px-1.5 py-[2px] text-[0.55rem] font-bold uppercase tracking-wide ${centriStyle[tube.centrifugation]}`}>
            {centriLabel[tube.centrifugation]}
          </span>
        </div>

        {/* Label */}
        <div className="mt-3 min-w-0">
          <div className="text-[0.82rem] font-semibold leading-snug text-ink truncate">{tube.nom}</div>
          {tube.sousTitre && <div className="mt-0.5 text-[0.72rem] text-ink-2 truncate">{tube.sousTitre}</div>}
          <div className="mt-1 font-mono text-[0.62rem] text-ink-3">étiq. {tube.etiquette}</div>
        </div>
      </button>

      {/* Favori : bouton distinct superposé (évite un contrôle imbriqué dans un bouton) */}
      <button
        type="button"
        onClick={onToggleFav}
        aria-label={isFav ? `Retirer ${tube.nom} des favoris` : `Ajouter ${tube.nom} aux favoris`}
        aria-pressed={isFav}
        className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 ${
          isFav ? 'text-amber-500' : 'text-ink-3/40 group-hover:text-ink-3'
        }`}
      >
        <Star className="h-3.5 w-3.5" strokeWidth={1.75} fill={isFav ? 'currentColor' : 'none'} aria-hidden="true" />
      </button>
    </div>
  )
}
