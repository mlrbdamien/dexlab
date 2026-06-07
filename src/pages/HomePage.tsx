import { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Tag, Activity, ArrowRightCircle, ChevronDown } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { tubes as allTubes } from '@/data/tubes'
import { TubeGrid } from '@/components/TubeGrid'
import { TabEnregistrement } from '@/components/tabs/TabEnregistrement'
import { TabFeuilles } from '@/components/tabs/TabFeuilles'
import { TabStatifs } from '@/components/tabs/TabStatifs'
import { TabEtiquettes } from '@/components/tabs/TabEtiquettes'
import { TabCheckin } from '@/components/tabs/TabCheckin'
import { TabSerotheque } from '@/components/tabs/TabSerotheque'
import { TabGestion } from '@/components/tabs/TabGestion'
import { TabCas } from '@/components/tabs/TabCas'
import { procedures } from '@/components/Layout'
import { destColors } from '@/lib/destStyles'
import type { LayoutCtx } from '@/components/Layout'
import type { Tube, CentrifugationStatus } from '@/lib/types'

const panels: Record<string, React.FC> = {
  enregistrement: TabEnregistrement, feuilles: TabFeuilles,
  statifs: TabStatifs, etiquettes: TabEtiquettes,
  checkin: TabCheckin, serotheque: TabSerotheque,
  gestion: TabGestion, cas: TabCas,
}

const SW = 1.75

export function HomePage() {
  const { section, setSection, query, filteredTubes } = useOutletContext<LayoutCtx>()
  const { isFav, toggle: toggleFav } = useFavorites()
  const [autresOpen, setAutresOpen] = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && section.startsWith('tube:')) setSection('home') }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [section, setSection])

  const isTube = section.startsWith('tube:')
  const tubeId = isTube ? section.slice(5) : null
  const selectedTube = tubeId ? allTubes.find(t => t.id === tubeId) ?? null : null

  const isProc = !['home','procedures'].includes(section) && !isTube
  const Panel = isProc ? panels[section] : null
  const procLabel = isProc ? procedures.find(p => p.id === section)?.label : null

  const hasQuery = query.trim().length > 0
  const sangTubes = useMemo(() => filteredTubes.filter(t => t.categorie === 'sang'), [filteredTubes])
  const autresTubes = useMemo(() => filteredTubes.filter(t => t.categorie === 'autres'), [filteredTubes])
  const favTubes = useMemo(() => allTubes.filter(t => isFav(t.id)), [isFav])

  const selectTube = (tube: Tube) => setSection(`tube:${tube.id}`)

  return (
    <>
      {section === 'home' && (
        <div className="fade-up">
          <div className="hidden md:block mb-5">
            <h1 className="text-lg font-bold text-ink">Gestion des échantillons</h1>
            <p className="text-[0.72rem] font-mono text-ink-3 mt-0.5">Dexlab  — Sion</p>
          </div>

          {hasQuery && (
            <>
              {filteredTubes.length > 0 && (
                <div className="mb-5">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3 mb-2">
                    Échantillons ({filteredTubes.length})
                  </p>
                  <TubeGrid tubes={filteredTubes} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
                </div>
              )}

              {filteredTubes.length === 0 && (
                <p className="text-center text-[0.82rem] text-ink-3 py-8">Aucun résultat pour « {query} »</p>
              )}
            </>
          )}

          {!hasQuery && (
            <>
              {favTubes.length > 0 && (
                <div className="mb-5">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-amber-500 mb-2">Favoris</p>
                  <TubeGrid tubes={favTubes} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
                </div>
              )}

              <div className="mb-5">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3 mb-2.5">Échantillons fréquents</p>
                <TubeGrid tubes={sangTubes} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
              </div>

              {autresTubes.length > 0 && (
                <div className="mb-5">
                  <button
                    onClick={() => setAutresOpen(v => !v)}
                    className="state-hover flex w-full items-center gap-2 mb-2.5 text-left"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 text-ink-3 transition-transform ${autresOpen ? '' : '-rotate-90'}`} strokeWidth={SW} />
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Autres échantillons</p>
                  </button>
                  {autresOpen && (
                    <TubeGrid tubes={autresTubes} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isTube && selectedTube && (
        <TubeFiche tube={selectedTube} isFav={isFav(selectedTube.id)} onToggleFav={() => toggleFav(selectedTube.id)} onBack={() => setSection('home')} />
      )}

      {section === 'procedures' && (
        <div className="fade-up space-y-1 mt-2">
          {procedures.map(p => (
            <button key={p.id} onClick={() => setSection(p.id)}
              className="state-hover flex w-full items-center gap-2.5 rounded-[9px] border-[0.5px] border-line bg-canvas px-3.5 py-3 text-left"
            >
              <p.icon className="h-4 w-4 text-accent shrink-0" strokeWidth={SW} />
              <span className="flex-1 text-[0.82rem] font-medium text-ink">{p.label}</span>
              <ChevronRight className="h-3.5 w-3.5 text-ink-3/50" strokeWidth={SW} />
            </button>
          ))}
        </div>
      )}

      {isProc && Panel && (
        <div className="fade-up">
          <button onClick={() => setSection('procedures')} className="md:hidden flex items-center gap-1 mb-3 mt-1 text-[0.78rem] font-medium text-accent">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
          </button>
          <h2 className="text-base font-bold text-ink mb-3 md:mt-2">{procLabel}</h2>
          <Panel />
        </div>
      )}
    </>
  )
}

const centriLabel: Record<CentrifugationStatus, string> = {
  oui: 'Oui', obligatoire: 'Obligatoire', non: 'Non', variable: 'Variable', na: 'N/A',
}
const centriColor: Record<CentrifugationStatus, string> = {
  oui: 'bg-grn-soft text-grn', obligatoire: 'bg-org-soft text-org',
  non: 'bg-red-soft text-red', variable: 'bg-canvas-2 text-ink-2', na: 'bg-canvas-2 text-ink-3',
}

function TubeFiche({ tube, isFav, onToggleFav, onBack }: { tube: Tube; isFav: boolean; onToggleFav: () => void; onBack: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (k: string) => setOpen(p => ({ ...p, [k]: !p[k] }))

  const casCount = tube.casParticuliers.length + tube.alertes.length

  return (
    <div className="fade-up">
      <button onClick={onBack} className="flex items-center gap-1.5 mb-4 text-[0.78rem] font-medium text-accent">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
      </button>

      <div className="flex items-start gap-3.5 mb-5">
        <span className="h-12 w-12 shrink-0 rounded-full border-[0.5px] border-black/10 dark:border-white/15" style={{ background: tube.couleur }} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-ink">{tube.nom}</h1>
          <p className="font-mono text-[0.75rem] text-ink-3 mt-0.5">{tube.sousTitre}</p>
        </div>
        <button onClick={onToggleFav} className={`flex h-9 w-9 items-center justify-center rounded-md transition ${isFav ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-ink-3 hover:text-ink-2 hover:bg-canvas-2'}`} title="Favori">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
        <div className="rounded-[9px] border-[0.5px] border-line bg-canvas p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-ink-3" strokeWidth={SW} />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Étiquette</span>
          </div>
          <div className="font-mono text-2xl font-bold text-ink leading-none">{tube.etiquette}</div>
          {tube.codeExces && <p className="mt-2 font-mono text-[0.68rem] text-ink-3">excès · {tube.codeExces}</p>}
          {tube.codeSansAnalyse && <p className="font-mono text-[0.68rem] text-ink-3">sans analyse · {tube.codeSansAnalyse}</p>}
        </div>

        <div className="rounded-[9px] border-[0.5px] border-line bg-canvas p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-ink-3" strokeWidth={SW} />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Centrifuger</span>
          </div>
          <span className={`inline-block rounded-[5px] px-2.5 py-1 text-[0.85rem] font-bold ${centriColor[tube.centrifugation]}`}>
            {centriLabel[tube.centrifugation]}
          </span>
          <p className="mt-2 text-[0.72rem] text-ink-2 leading-relaxed">{tube.centrifugationDetail}</p>
        </div>

        <div className="rounded-[9px] border-[0.5px] border-line bg-canvas p-4 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightCircle className="h-4 w-4 text-ink-3" strokeWidth={SW} />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Destinations</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tube.destinations.map((d, i) => (
              <div key={i} className={`rounded-md border-[0.5px] px-2 py-1 text-[0.72rem] ${destColors[d.categorie]}`}>
                <strong className="font-semibold">{d.label}</strong>
                {d.detail && <span className="ml-1 text-[0.65rem] text-ink-2">· {d.detail}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <FicheAccordion title="Cas particuliers" badge={casCount || undefined} isOpen={!!open.cas} onToggle={() => toggle('cas')}>
          {tube.alertes.length > 0 && (
            <div className="rounded-md border-l-[3px] border-l-red bg-red-soft p-3 mb-2">
              <h4 className="text-[0.62rem] font-bold uppercase tracking-[0.06em] text-red mb-1">⚠ Attention</h4>
              <ul className="ml-3 list-disc space-y-0.5 text-[0.75rem] text-ink-2">
                {tube.alertes.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
          {tube.casParticuliers.length > 0 && (
            <ul className="ml-3 list-disc space-y-0.5 text-[0.75rem] text-ink-2">
              {tube.casParticuliers.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
          {casCount === 0 && <p className="text-[0.75rem] text-ink-3">Aucun cas particulier.</p>}
        </FicheAccordion>

        <FicheAccordion title="Notes & codes" isOpen={!!open.notes} onToggle={() => toggle('notes')}>
          {tube.codeReserve && (
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[0.72rem] text-ink-3">Réserve</span>
              <code className="rounded border-[0.5px] border-line bg-canvas-2 px-1.5 py-0.5 font-mono text-[0.72rem]">{tube.codeReserve}</code>
            </div>
          )}
          {tube.notes.length > 0 ? (
            <ul className="ml-3 list-disc space-y-0.5 text-[0.75rem] text-ink-2">
              {tube.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          ) : (
            <p className="text-[0.75rem] text-ink-3">Aucune note.</p>
          )}
        </FicheAccordion>
      </div>
    </div>
  )
}

function FicheAccordion({ title, badge, isOpen, onToggle, children }: { title: string; badge?: number; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-line last:border-b-0">
      <button onClick={onToggle} className="state-hover flex w-full items-center gap-2 py-3.5 text-left">
        <ChevronDown className={`h-3.5 w-3.5 text-ink-3 transition-transform duration-150 ${isOpen ? '' : '-rotate-90'}`} strokeWidth={SW} />
        <span className="text-[0.82rem] font-medium text-ink flex-1">{title}</span>
        {badge !== undefined && badge > 0 && (
          <span className="rounded-[5px] bg-org-soft text-org px-1.5 py-0.5 text-[0.58rem] font-bold">{badge}</span>
        )}
      </button>
      {isOpen && <div className="pb-4 pl-6">{children}</div>}
    </div>
  )
}
