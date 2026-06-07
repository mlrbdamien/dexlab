import { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Tag, Activity, ArrowRightCircle, ChevronDown, FileText } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { TubeGrid } from '@/components/TubeGrid'
import { Markdown } from '@/components/Markdown'
import type { LayoutCtx } from '@/lib/navigation'
import type { Materiel, CentrifugationStatus } from '@/lib/types'

const SW = 1.75

export function HomePage() {
  const { section, setSection, query, materiel, filteredMateriel, documents, loading, documentsLoading } = useOutletContext<LayoutCtx>()
  const { isFav, toggle: toggleFav } = useFavorites()

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && section.startsWith('tube:')) setSection('home') }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [section, setSection])

  const isTube = section.startsWith('tube:')
  const tubeId = isTube ? section.slice(5) : null
  const selectedTube = tubeId ? materiel.find(m => m.id === tubeId) ?? null : null

  const procedureDocs = documents.filter(d => d.type === 'procedure')
  const isProc = !['home', 'procedures'].includes(section) && !isTube
  const procDoc = isProc ? documents.find(d => d.id === section) ?? null : null

  const hasQuery = query.trim().length > 0
  const favMateriel = useMemo(() => materiel.filter(m => isFav(m.id)), [materiel, isFav])

  const selectTube = (m: Materiel) => setSection(`tube:${m.id}`)

  return (
    <>
      {section === 'home' && (
        <div className="fade-up">
          <div className="hidden md:block mb-6">
            <h1 className="text-lg font-bold text-ink">Matériel</h1>
          </div>

          {loading && materiel.length === 0 ? (
            <p className="py-12 text-center text-[0.82rem] text-ink-3">Chargement…</p>
          ) : hasQuery ? (
            filteredMateriel.length > 0 ? (
              <div className="mb-6">
                <p className="mb-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Résultats ({filteredMateriel.length})</p>
                <TubeGrid tubes={filteredMateriel} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
              </div>
            ) : (
              <p className="py-8 text-center text-[0.82rem] text-ink-3">Aucun résultat pour « {query} »</p>
            )
          ) : materiel.length === 0 ? (
            <p className="py-12 text-center text-[0.82rem] text-ink-3">Aucun matériel pour l'instant.</p>
          ) : (
            <>
              {favMateriel.length > 0 && (
                <div className="mb-6">
                  <p className="mb-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-amber-500">Favoris</p>
                  <TubeGrid tubes={favMateriel} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
                </div>
              )}
              <div className="mb-6">
                <p className="mb-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Tous les échantillons</p>
                <TubeGrid tubes={materiel} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
              </div>
            </>
          )}
        </div>
      )}

      {isTube && selectedTube && (
        <TubeFiche tube={selectedTube} isFav={isFav(selectedTube.id)} onToggleFav={() => toggleFav(selectedTube.id)} onBack={() => setSection('home')} />
      )}

      {isTube && !selectedTube && (
        <div className="fade-up">
          <button onClick={() => setSection('home')} className="mb-4 flex items-center gap-1.5 text-[0.78rem] font-medium text-accent">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
          </button>
          <p className="py-10 text-center text-[0.82rem] text-ink-3">{loading ? 'Chargement…' : 'Échantillon introuvable.'}</p>
        </div>
      )}

      {section === 'procedures' && (
        <div className="fade-up space-y-1.5 mt-2">
          {documentsLoading && procedureDocs.length === 0 ? (
            <p className="py-10 text-center text-[0.82rem] text-ink-3">Chargement…</p>
          ) : procedureDocs.length === 0 ? (
            <p className="py-10 text-center text-[0.82rem] text-ink-3">Aucune procédure.</p>
          ) : procedureDocs.map(d => (
            <button key={d.id} onClick={() => setSection(d.id)}
              className="state-hover flex w-full items-center gap-2.5 rounded-xl border border-line bg-canvas px-4 py-3.5 text-left transition-colors duration-150"
            >
              <FileText className="h-4 w-4 shrink-0 text-accent" strokeWidth={SW} />
              <span className="flex-1 text-[0.82rem] font-medium text-ink">{d.titre}</span>
              <ChevronRight className="h-3.5 w-3.5 text-ink-3/50" strokeWidth={SW} />
            </button>
          ))}
        </div>
      )}

      {isProc && procDoc && (
        <div className="fade-up">
          <button onClick={() => setSection('procedures')} className="md:hidden mb-3 mt-1 flex items-center gap-1 text-[0.78rem] font-medium text-accent">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
          </button>
          <h2 className="mb-4 text-base font-bold text-ink md:mt-2">{procDoc.titre}</h2>
          <Markdown>{procDoc.contenu}</Markdown>
        </div>
      )}

      {isProc && !procDoc && (
        <div className="fade-up">
          <button onClick={() => setSection('procedures')} className="md:hidden mb-3 mt-1 flex items-center gap-1 text-[0.78rem] font-medium text-accent">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
          </button>
          <p className="py-10 text-center text-[0.82rem] text-ink-3">{documentsLoading ? 'Chargement…' : 'Procédure introuvable.'}</p>
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

function TubeFiche({ tube, isFav, onToggleFav, onBack }: { tube: Materiel; isFav: boolean; onToggleFav: () => void; onBack: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (k: string) => setOpen(p => ({ ...p, [k]: !p[k] }))

  const casCount = tube.casParticuliers.length + tube.alertes.length
  const hasNotes = tube.notes.length > 0 || Boolean(tube.codeReserve)

  return (
    <div className="fade-up">
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-[0.78rem] font-medium text-accent">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
      </button>

      <div className="mb-6 flex items-start gap-3.5">
        <span className="h-12 w-12 shrink-0 rounded-full border-[0.5px] border-black/10 dark:border-white/15" style={{ background: tube.couleur }} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink">{tube.nom}</h1>
          {tube.sousTitre && <p className="mt-0.5 font-mono text-[0.75rem] text-ink-3">{tube.sousTitre}</p>}
        </div>
        <button onClick={onToggleFav} aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isFav} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ${isFav ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' : 'text-ink-3 hover:bg-canvas-2 hover:text-ink-2'}`}>
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-canvas p-4">
          <div className="mb-2 flex items-center gap-2">
            <Tag aria-hidden="true" className="h-4 w-4 text-ink-3" strokeWidth={SW} />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Étiquette</span>
          </div>
          <div className="font-mono text-2xl font-bold leading-none text-ink">{tube.etiquette}</div>
          {tube.codeExces && <p className="mt-2 font-mono text-[0.68rem] text-ink-3">excès · {tube.codeExces}</p>}
          {tube.codeSansAnalyse && <p className="font-mono text-[0.68rem] text-ink-3">sans analyse · {tube.codeSansAnalyse}</p>}
        </div>

        <div className="rounded-2xl border border-line bg-canvas p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity aria-hidden="true" className="h-4 w-4 text-ink-3" strokeWidth={SW} />
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Centrifuger</span>
          </div>
          <span className={`inline-block rounded-md px-2.5 py-1 text-[0.85rem] font-bold ${centriColor[tube.centrifugation]}`}>
            {centriLabel[tube.centrifugation]}
          </span>
          {tube.centrifugationDetail && <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-2">{tube.centrifugationDetail}</p>}
        </div>

        {tube.destinations.length > 0 && (
          <div className="rounded-2xl border border-line bg-canvas p-4">
            <div className="mb-2 flex items-center gap-2">
              <ArrowRightCircle aria-hidden="true" className="h-4 w-4 text-ink-3" strokeWidth={SW} />
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Destinations</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tube.destinations.map((d, i) => (
                <div key={i} className="rounded-md border border-line bg-canvas-2 px-2 py-1 text-[0.72rem]">
                  <strong className="font-semibold text-ink">{d.label}</strong>
                  {d.detail && <span className="ml-1 text-[0.65rem] text-ink-3">· {d.detail}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(casCount > 0 || hasNotes) && (
        <div className="mt-2 border-t border-line">
          {casCount > 0 && (
            <FicheAccordion title="Cas particuliers" badge={casCount} isOpen={!!open.cas} onToggle={() => toggle('cas')}>
              {tube.alertes.length > 0 && (
                <div className="mb-2 rounded-md border-l-[3px] border-l-red bg-red-soft p-3">
                  <h4 className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-red">⚠ Attention</h4>
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
            </FicheAccordion>
          )}

          {hasNotes && (
            <FicheAccordion title="Notes & codes" isOpen={!!open.notes} onToggle={() => toggle('notes')}>
              {tube.codeReserve && (
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-[0.72rem] text-ink-3">Réserve</span>
                  <code className="rounded border border-line bg-canvas-2 px-1.5 py-0.5 font-mono text-[0.72rem]">{tube.codeReserve}</code>
                </div>
              )}
              {tube.notes.length > 0 && (
                <ul className="ml-3 list-disc space-y-0.5 text-[0.75rem] text-ink-2">
                  {tube.notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              )}
            </FicheAccordion>
          )}
        </div>
      )}
    </div>
  )
}

function FicheAccordion({ title, badge, isOpen, onToggle, children }: { title: string; badge?: number; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-line last:border-b-0">
      <button onClick={onToggle} className="state-hover flex w-full items-center gap-2 py-3.5 text-left">
        <ChevronDown className={`h-3.5 w-3.5 text-ink-3 transition-transform duration-150 ${isOpen ? '' : '-rotate-90'}`} strokeWidth={SW} />
        <span className="flex-1 text-[0.82rem] font-medium text-ink">{title}</span>
        {badge !== undefined && badge > 0 && (
          <span className="rounded-md bg-org-soft px-1.5 py-0.5 text-[0.58rem] font-bold text-org">{badge}</span>
        )}
      </button>
      {isOpen && <div className="pb-4 pl-6">{children}</div>}
    </div>
  )
}
