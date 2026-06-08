import { useState, useEffect, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Tag, Activity, ArrowRightCircle, ChevronDown, FileText, Plus, Pencil, Trash2, StickyNote, Pin, Link2, Printer, History, Table2, LayoutGrid } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { TubeGrid } from '@/components/TubeGrid'
import { MaterielTable, type MaterielSort, type MaterielSortKey } from '@/components/MaterielTable'
import { Markdown } from '@/components/Markdown'
import { MediaGallery } from '@/components/MediaGallery'
import { formatDate } from '@/lib/format'
import type { LayoutCtx } from '@/lib/navigation'
import type { Materiel, CentrifugationStatus, DocItem } from '@/lib/types'

const SW = 1.75

const centriRank: Record<CentrifugationStatus, number> = { obligatoire: 0, oui: 1, variable: 2, non: 3, na: 4 }

function sortMateriel(items: Materiel[], sort: MaterielSort | null): Materiel[] {
  if (!sort) return items
  const dir = sort.dir === 'desc' ? -1 : 1
  const { key } = sort
  return [...items].sort((a, b) => {
    const r = key === 'centrifugation'
      ? centriRank[a.centrifugation] - centriRank[b.centrifugation]
      : String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'fr', { sensitivity: 'base' })
    return r * dir
  })
}

export function HomePage() {
  const { section, setSection, query, materiel, filteredMateriel, documents, loading, documentsLoading, materielError, refetchMateriel, onNewMateriel, onEditMateriel, onDeleteMateriel, documentsError, refetchDocuments, onNewDocument, onEditDocument, onDeleteDocument, onTogglePinDocument, links, onEditMaterielLinks, onEditDocLinks, profiles, onShowHistory } = useOutletContext<LayoutCtx>()
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
  const noteDocs = useMemo(
    () => documents.filter(d => d.type !== 'procedure').slice().sort((a, b) => Number(b.epingle) - Number(a.epingle) || a.position - b.position),
    [documents],
  )
  const isDoc = !['home', 'procedures', 'notes'].includes(section) && !isTube
  const currentDoc = isDoc ? documents.find(d => d.id === section) ?? null : null
  const docBackTo = currentDoc?.type === 'procedure' ? 'procedures' : 'notes'
  const linkedMateriel = currentDoc ? materiel.filter(m => links.some(l => l.document_id === currentDoc.id && l.materiel_id === m.id)) : []

  const hasQuery = query.trim().length > 0
  const favMateriel = useMemo(() => materiel.filter(m => isFav(m.id)), [materiel, isFav])

  const [view, setView] = useState<'table' | 'cards'>(() => {
    try { return localStorage.getItem('dexlab-mat-view') === 'cards' ? 'cards' : 'table' } catch { return 'table' }
  })
  const changeView = (v: 'table' | 'cards') => { setView(v); try { localStorage.setItem('dexlab-mat-view', v) } catch { /* indispo */ } }
  const [sort, setSort] = useState<MaterielSort | null>(null)
  const onSort = (key: MaterielSortKey) => setSort(s => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }))

  const selectTube = (m: Materiel) => setSection(`tube:${m.id}`)
  const handleDelete = async (m: Materiel) => {
    if (!window.confirm(`Supprimer « ${m.nom} » ? Action irréversible.`)) return
    try {
      await onDeleteMateriel(m)
      setSection('home')
    } catch {
      window.alert('Échec de la suppression. Vérifie ta connexion et réessaie.')
    }
  }
  const handleDeleteDoc = async (d: DocItem) => {
    if (!window.confirm(`Supprimer « ${d.titre} » ? Action irréversible.`)) return
    try {
      await onDeleteDocument(d)
      setSection(d.type === 'procedure' ? 'procedures' : 'notes')
    } catch {
      window.alert('Échec de la suppression. Vérifie ta connexion et réessaie.')
    }
  }

  const renderMatList = (items: Materiel[], mode: 'table' | 'cards') =>
    mode === 'table'
      ? <MaterielTable tubes={sortMateriel(items, sort)} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} sort={sort} onSort={onSort} />
      : <TubeGrid tubes={items} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />

  const renderHome = (mode: 'table' | 'cards') => {
    if (materielError) return (
      <div className="rounded-xl border border-red/30 bg-red-soft p-4 text-[0.82rem] text-red">
        Impossible de charger le matériel : {materielError}.
        <button onClick={refetchMateriel} className="ml-2 font-medium underline">Réessayer</button>
      </div>
    )
    if (loading && materiel.length === 0) return <p className="py-12 text-center text-[0.82rem] text-ink-3">Chargement…</p>
    if (hasQuery) return filteredMateriel.length > 0
      ? (
        <div className="mb-6">
          <p className="mb-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Résultats ({filteredMateriel.length})</p>
          {renderMatList(filteredMateriel, mode)}
        </div>
      )
      : <p className="py-8 text-center text-[0.82rem] text-ink-3">Aucun résultat pour « {query} »</p>
    if (materiel.length === 0) return <p className="py-12 text-center text-[0.82rem] text-ink-3">Aucun matériel pour l'instant.</p>
    if (mode === 'cards') return (
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
    )
    return <div className="mb-6">{renderMatList(materiel, 'table')}</div>
  }

  return (
    <>
      {section === 'home' && (
        <div className="fade-up">
          <div className="mb-5 flex items-center gap-2.5">
            <h1 className="hidden text-lg font-bold text-ink md:block">Matériel</h1>
            {materiel.length > 0 && (
              <span className="hidden items-center rounded-full border border-line bg-canvas-2 px-2 py-0.5 text-[0.68rem] font-medium tabular-nums text-ink-2 md:inline-flex">{materiel.length}</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {materiel.length > 0 && (
                <div className="hidden items-center rounded-lg border border-line bg-canvas-2 p-0.5 md:flex">
                  <button onClick={() => changeView('table')} aria-pressed={view === 'table'} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.74rem] font-medium transition-colors duration-150 ${view === 'table' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'}`}>
                    <Table2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Tableau
                  </button>
                  <button onClick={() => changeView('cards')} aria-pressed={view === 'cards'} className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.74rem] font-medium transition-colors duration-150 ${view === 'cards' ? 'bg-canvas text-ink shadow-sm' : 'text-ink-3 hover:text-ink-2'}`}>
                    <LayoutGrid aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Cartes
                  </button>
                </div>
              )}
              <button onClick={onNewMateriel} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[0.78rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.98]">
                <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Nouveau
              </button>
            </div>
          </div>

          <div className="md:hidden">{renderHome('cards')}</div>
          <div className="hidden md:block">{renderHome(view)}</div>
        </div>
      )}

      {isTube && selectedTube && (
        <TubeFiche tube={selectedTube} isFav={isFav(selectedTube.id)} onToggleFav={() => toggleFav(selectedTube.id)} onBack={() => setSection('home')} onEdit={() => onEditMateriel(selectedTube)} onDelete={() => handleDelete(selectedTube)} linkedDocs={documents.filter(d => links.some(l => l.materiel_id === selectedTube.id && l.document_id === d.id))} onEditLinks={() => onEditMaterielLinks(selectedTube)} onOpenDoc={(id) => setSection(id)} profiles={profiles} onShowHistory={() => onShowHistory('materiel', selectedTube.id, selectedTube.nom)} />
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
        <div className="fade-up mt-2">
          <div className="mb-3 flex justify-end">
            <button onClick={() => onNewDocument('procedure')} className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[0.78rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.98]">
              <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Nouvelle procédure
            </button>
          </div>
          <div className="space-y-1.5">
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
        </div>
      )}

      {isDoc && currentDoc && (
        <div className="fade-up">
          <div className="print-hide mb-4 flex items-center gap-2">
            <button onClick={() => setSection(docBackTo)} className="flex items-center gap-1.5 text-[0.78rem] font-medium text-accent">
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => onEditDocument(currentDoc)} aria-label="Éditer" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink">
                <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
              </button>
              <button onClick={() => handleDeleteDoc(currentDoc)} aria-label="Supprimer" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-red-soft hover:text-red">
                <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
              </button>
              <button onClick={() => window.print()} aria-label="Imprimer" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink">
                <Printer aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
              </button>
            </div>
          </div>
          <h2 className="mb-1 text-base font-bold text-ink">{currentDoc.titre}</h2>
          <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1">
            <MetaLine item={currentDoc} profiles={profiles} />
            <button onClick={() => onShowHistory('documents', currentDoc.id, currentDoc.titre)} className="print-hide inline-flex items-center gap-1 text-[0.68rem] font-medium text-accent transition-colors duration-150 hover:text-accent-ink">
              <History aria-hidden="true" className="h-3 w-3" strokeWidth={SW} /> Historique
            </button>
          </div>
          {currentDoc.contenu.trim()
            ? <Markdown>{currentDoc.contenu}</Markdown>
            : <p className="text-[0.82rem] text-ink-3">Ce document est vide.</p>}

          <MediaGallery key={currentDoc.id} documentId={currentDoc.id} />

          <div className="mt-6 border-t border-line pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Matériel lié</span>
              <button onClick={() => onEditDocLinks(currentDoc)} className="print-hide flex items-center gap-1 text-[0.72rem] font-medium text-accent">
                <Link2 aria-hidden="true" className="h-3 w-3" strokeWidth={SW} /> Lier
              </button>
            </div>
            {linkedMateriel.length === 0 ? (
              <p className="text-[0.75rem] text-ink-3">Aucun matériel lié.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {linkedMateriel.map(m => (
                  <button key={m.id} onClick={() => setSection(`tube:${m.id}`)} className="flex items-center gap-1.5 rounded-lg border border-line bg-canvas-2 px-2.5 py-1 text-[0.72rem] text-ink-2 transition-colors duration-150 hover:text-ink">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.couleur }} /> {m.nom}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isDoc && !currentDoc && (
        <div className="fade-up">
          <button onClick={() => setSection('home')} className="mb-3 mt-1 flex items-center gap-1 text-[0.78rem] font-medium text-accent">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
          </button>
          <p className="py-10 text-center text-[0.82rem] text-ink-3">{documentsLoading ? 'Chargement…' : 'Document introuvable.'}</p>
        </div>
      )}

      {section === 'notes' && (
        <div className="fade-up">
          <div className="mb-6 flex items-center gap-3">
            <h1 className="hidden text-lg font-bold text-ink md:block">Notes &amp; mémos</h1>
            <button onClick={() => onNewDocument('note')} className="ml-auto flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[0.78rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.98]">
              <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Nouvelle note
            </button>
          </div>
          {documentsError ? (
            <div className="rounded-xl border border-red/30 bg-red-soft p-4 text-[0.82rem] text-red">
              Impossible de charger les notes : {documentsError}.
              <button onClick={refetchDocuments} className="ml-2 font-medium underline">Réessayer</button>
            </div>
          ) : documentsLoading && noteDocs.length === 0 ? (
            <p className="py-12 text-center text-[0.82rem] text-ink-3">Chargement…</p>
          ) : noteDocs.length === 0 ? (
            <p className="py-12 text-center text-[0.82rem] text-ink-3">Aucune note pour l'instant.</p>
          ) : (
            <div className="space-y-2">
              {noteDocs.map(d => (
                <div key={d.id} className="group relative">
                  <button onClick={() => setSection(d.id)} className="state-hover flex w-full items-start gap-2.5 rounded-xl border border-line bg-canvas px-4 py-3 pr-11 text-left transition-colors duration-150">
                    <StickyNote aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={SW} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[0.85rem] font-medium text-ink">{d.titre}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-ink-3">
                        <span className="uppercase tracking-wide">{d.type === 'memo' ? 'Mémo' : 'Note'}</span>
                        {d.tags.length > 0 && <span className="truncate">· {d.tags.join(' · ')}</span>}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => onTogglePinDocument(d)} aria-label={d.epingle ? 'Désépingler' : 'Épingler'} aria-pressed={d.epingle} className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 ${d.epingle ? 'text-amber-500' : 'text-ink-3/50 hover:text-ink-3'}`}>
                    <Pin aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} fill={d.epingle ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          )}
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

// Ligne de traçabilité « Créé/Modifié par X le … »
function MetaLine({ item, profiles }: { item: Materiel | DocItem; profiles: Record<string, string> }) {
  const when = item.updatedAt ?? item.createdAt
  if (!when) return null
  const modified = Boolean(item.updatedAt && item.createdAt && item.updatedAt !== item.createdAt)
  const byId = (modified ? item.updatedBy : item.createdBy) ?? null
  const name = byId ? profiles[byId] : null
  return (
    <span className="text-[0.68rem] text-ink-3">
      {modified ? 'Modifié' : 'Créé'}{name ? ` par ${name}` : ''} le {formatDate(when)}
    </span>
  )
}

function TubeFiche({ tube, isFav, onToggleFav, onBack, onEdit, onDelete, linkedDocs, onEditLinks, onOpenDoc, profiles, onShowHistory }: { tube: Materiel; isFav: boolean; onToggleFav: () => void; onBack: () => void; onEdit: () => void; onDelete: () => void; linkedDocs: DocItem[]; onEditLinks: () => void; onOpenDoc: (id: string) => void; profiles: Record<string, string>; onShowHistory: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggle = (k: string) => setOpen(p => ({ ...p, [k]: !p[k] }))

  const casCount = tube.casParticuliers.length + tube.alertes.length
  const hasNotes = tube.notes.length > 0 || Boolean(tube.codeReserve)

  return (
    <div className="fade-up">
      <button onClick={onBack} className="print-hide mb-4 flex items-center gap-1.5 text-[0.78rem] font-medium text-accent">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
      </button>

      <div className="mb-6 flex items-start gap-3.5">
        <span className="h-12 w-12 shrink-0 rounded-full border-[0.5px] border-black/10 dark:border-white/15" style={{ background: tube.couleur }} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink">{tube.nom}</h1>
          {tube.sousTitre && <p className="mt-0.5 font-mono text-[0.75rem] text-ink-3">{tube.sousTitre}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <MetaLine item={tube} profiles={profiles} />
            <button onClick={onShowHistory} className="print-hide inline-flex items-center gap-1 text-[0.68rem] font-medium text-accent transition-colors duration-150 hover:text-accent-ink">
              <History aria-hidden="true" className="h-3 w-3" strokeWidth={SW} /> Historique
            </button>
          </div>
        </div>
        <div className="print-hide flex shrink-0 items-center gap-1">
          <button onClick={onToggleFav} aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isFav} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 ${isFav ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' : 'text-ink-3 hover:bg-canvas-2 hover:text-ink-2'}`}>
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </button>
          <button onClick={onEdit} aria-label="Éditer" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink">
            <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
          </button>
          <button onClick={onDelete} aria-label="Supprimer" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-red-soft hover:text-red">
            <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
          </button>
          <button onClick={() => window.print()} aria-label="Imprimer" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink">
            <Printer aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
          </button>
        </div>
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
          <span className={`inline-block rounded-md px-2.5 py-1 text-[0.85rem] font-bold ${centriColor[tube.centrifugation] ?? centriColor.na}`}>
            {centriLabel[tube.centrifugation] ?? tube.centrifugation}
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

      <MediaGallery key={tube.id} materielId={tube.id} />

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

      <div className="mt-2 border-t border-line pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Documents liés</span>
          <button onClick={onEditLinks} className="print-hide flex items-center gap-1 text-[0.72rem] font-medium text-accent">
            <Link2 aria-hidden="true" className="h-3 w-3" strokeWidth={SW} /> Lier
          </button>
        </div>
        {linkedDocs.length === 0 ? (
          <p className="text-[0.75rem] text-ink-3">Aucun document lié.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {linkedDocs.map(d => (
              <button key={d.id} onClick={() => onOpenDoc(d.id)} className="rounded-lg border border-line bg-canvas-2 px-2.5 py-1 text-[0.72rem] text-ink-2 transition-colors duration-150 hover:text-ink">{d.titre}</button>
            ))}
          </div>
        )}
      </div>
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
      <div className={`pb-4 pl-6 ${isOpen ? '' : 'hidden print:block'}`}>{children}</div>
    </div>
  )
}
