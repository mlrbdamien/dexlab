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
    <button
      onClick={onClick}
      className="group flex flex-col rounded-[9px] border-[0.5px] border-line bg-canvas p-3 text-left transition hover:border-ink-3/40 active:scale-[0.98]"
    >
      {/* Top: pastille + badge + star */}
      <div className="flex items-start justify-between gap-1 mb-auto">
        <span
          className="h-6 w-6 shrink-0 rounded-full border-[0.5px] border-black/8 dark:border-white/12"
          style={{ background: tube.couleur }}
        />
        <div className="flex items-center gap-1">
          <span className={`rounded-[5px] px-1.5 py-[2px] text-[0.55rem] font-bold uppercase tracking-wide ${centriStyle[tube.centrifugation]}`}>
            {centriLabel[tube.centrifugation]}
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onToggleFav() }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onToggleFav() } }}
            className={`flex h-7 w-7 items-center justify-center rounded transition ${
              isFav ? 'text-amber-500' : 'text-ink-3/40 group-hover:text-ink-3'
            }`}
          >
            <Star className="h-3.5 w-3.5" strokeWidth={1.75} fill={isFav ? 'currentColor' : 'none'} />
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="mt-2 min-w-0">
        <div className="text-[0.82rem] font-semibold leading-snug text-ink truncate">{tube.nom}</div>
        {tube.sousTitre && <div className="mt-0.5 text-[0.72rem] text-ink-2 truncate">{tube.sousTitre}</div>}
        <div className="mt-1 font-mono text-[0.62rem] text-ink-3">étiq. {tube.etiquette}</div>
      </div>
    </button>
  )
}
