import { Star, ChevronRight, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import type { Materiel, CentrifugationStatus } from '@/lib/types'

const SW = 1.75

export type MaterielSortKey = 'nom' | 'type' | 'etiquette' | 'centrifugation'
export interface MaterielSort { key: MaterielSortKey; dir: 'asc' | 'desc' }

const centriLabel: Record<CentrifugationStatus, string> = {
  oui: 'Oui', obligatoire: 'Obligatoire', non: 'Non', variable: 'Variable', na: 'N/A',
}
const centriDot: Record<CentrifugationStatus, string> = {
  oui: 'bg-grn', obligatoire: 'bg-org', non: 'bg-red', variable: 'bg-ink-3', na: 'bg-ink-3',
}

interface Props {
  tubes: Materiel[]
  isFav: (id: string) => boolean
  onToggleFav: (id: string) => void
  onSelect: (tube: Materiel) => void
  sort: MaterielSort | null
  onSort: (key: MaterielSortKey) => void
}

export function MaterielTable({ tubes, isFav, onToggleFav, onSelect, sort, onSort }: Props) {
  if (tubes.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            <th scope="col" className="w-9" />
            <Th label="Nom" k="nom" sort={sort} onSort={onSort} />
            <Th label="Type" k="type" sort={sort} onSort={onSort} />
            <Th label="Étiquette" k="etiquette" sort={sort} onSort={onSort} />
            <Th label="Centrifugation" k="centrifugation" sort={sort} onSort={onSort} />
            <th scope="col" className="px-3.5 py-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.07em] text-ink-3">Destinations</th>
            <th scope="col" className="w-9" />
          </tr>
        </thead>
        <tbody>
          {tubes.map(t => {
            const fav = isFav(t.id)
            return (
              <tr
                key={t.id}
                onClick={() => onSelect(t)}
                className="group cursor-pointer border-b border-line transition-colors duration-100 last:border-b-0 hover:bg-canvas-2"
              >
                <td className="pl-2.5 pr-0">
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onToggleFav(t.id) }}
                    aria-label={fav ? `Retirer ${t.nom} des favoris` : `Ajouter ${t.nom} aux favoris`}
                    aria-pressed={fav}
                    className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${fav ? 'text-amber-500' : 'text-ink-3/40 hover:text-ink-3'}`}
                  >
                    <Star className="h-3.5 w-3.5" strokeWidth={SW} fill={fav ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                </td>
                <td className="py-2.5 pr-3">
                  <button type="button" onClick={e => { e.stopPropagation(); onSelect(t) }} className="flex items-center gap-2.5 text-left">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10 dark:border-white/15" style={{ background: t.couleur }} />
                    <span className="truncate text-[0.82rem] font-medium text-ink">{t.nom}</span>
                  </button>
                </td>
                <td className="whitespace-nowrap px-3.5 py-2.5 text-[0.8rem] text-ink-2">{t.type}</td>
                <td className="whitespace-nowrap px-3.5 py-2.5">
                  <span className="font-mono text-[0.74rem] font-medium text-ink">{t.etiquette || '—'}</span>
                </td>
                <td className="whitespace-nowrap px-3.5 py-2.5">
                  <span className="flex items-center gap-2 text-[0.8rem] text-ink">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${centriDot[t.centrifugation]}`} aria-hidden="true" />
                    {centriLabel[t.centrifugation]}
                  </span>
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="max-w-[260px] truncate text-[0.78rem] text-ink-3">
                    {t.destinations.map(d => d.label).join(' · ') || '—'}
                  </div>
                </td>
                <td className="pr-3 text-right">
                  <ChevronRight className="ml-auto h-4 w-4 text-ink-3/0 transition-colors duration-150 group-hover:text-ink-3/60" strokeWidth={SW} aria-hidden="true" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ label, k, sort, onSort }: { label: string; k: MaterielSortKey; sort: MaterielSort | null; onSort: (k: MaterielSortKey) => void }) {
  const active = sort?.key === k
  const ariaSort: 'ascending' | 'descending' | 'none' = active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'
  return (
    <th scope="col" aria-sort={ariaSort} className="whitespace-nowrap px-3.5 py-2.5">
      <button
        type="button"
        onClick={() => onSort(k)}
        className="group/th flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-[0.07em] text-ink-3 transition-colors hover:text-ink-2"
      >
        {label}
        {active
          ? (sort!.dir === 'asc' ? <ArrowUp className="h-3 w-3" strokeWidth={2} /> : <ArrowDown className="h-3 w-3" strokeWidth={2} />)
          : <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover/th:opacity-50" strokeWidth={2} />}
      </button>
    </th>
  )
}
