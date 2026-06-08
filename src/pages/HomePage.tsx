import { useEffect, useMemo, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Activity, ArrowRightCircle, FileText, Plus, Pencil, Trash2, StickyNote, Pin, Link2, Printer, History } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { TubeGrid } from '@/components/TubeGrid'
import { MaterielList, MaterielListSkeleton, MaterielEmptyState } from '@/components/MaterielList'
import { Markdown } from '@/components/Markdown'
import { MediaGallery } from '@/components/MediaGallery'
import { formatDate } from '@/lib/format'
import type { LayoutCtx } from '@/lib/navigation'
import type { Materiel, CentrifugationStatus, DocItem } from '@/lib/types'

const SW = 1.75

export function HomePage() {
  const { section, setSection, query, materiel, filteredMateriel, documents, loading, documentsLoading, materielError, refetchMateriel, onNewMateriel, onEditMateriel, onDeleteMateriel, documentsError, refetchDocuments, onNewDocument, onEditDocument, onDeleteDocument, onTogglePinDocument, links, onEditMaterielLinks, onEditDocLinks, profiles, onShowHistory } = useOutletContext<LayoutCtx>()
  const { isFav, toggle: toggleFav } = useFavorites()
  const isDesktop = useMediaQuery('(min-width: 768px)')

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

  // Liste affichée dans le panneau gauche (filtrée par la recherche globale)
  const listTubes = hasQuery ? filteredMateriel : materiel
  const listRef = useRef(listTubes)
  useEffect(() => { listRef.current = listTubes }, [listTubes])

  // Navigation clavier dans l'espace Matériel : ↑/↓ pour parcourir, Échap pour fermer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (section !== 'home' && !section.startsWith('tube:')) return
      if (e.key === 'Escape') {
        if (section.startsWith('tube:')) { e.preventDefault(); setSection('home') }
        return
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const list = listRef.current
      if (list.length === 0) return
      e.preventDefault()
      const curId = section.startsWith('tube:') ? section.slice(5) : null
      const idx = curId ? list.findIndex(m => m.id === curId) : -1
      const next = Math.max(0, Math.min(list.length - 1, e.key === 'ArrowDown' ? idx + 1 : idx - 1))
      const target = list[next]
      if (target) setSection(`tube:${target.id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section, setSection])

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

  // Mobile : grille de cartes (avec favoris / résultats de recherche)
  const renderCards = () => {
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
          <TubeGrid tubes={filteredMateriel} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
        </div>
      )
      : <p className="py-8 text-center text-[0.82rem] text-ink-3">Aucun résultat pour « {query} »</p>
    if (materiel.length === 0) return <p className="py-12 text-center text-[0.82rem] text-ink-3">Aucun matériel pour l'instant.</p>
    return (
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
  }

  // Desktop : panneau gauche du workspace
  const renderListPane = () => {
    if (materielError) return (
      <div className="p-4 text-[0.8rem] text-red">
        Erreur de chargement.
        <button onClick={refetchMateriel} className="ml-2 font-medium underline">Réessayer</button>
      </div>
    )
    if (loading && materiel.length === 0) return <MaterielListSkeleton />
    if (materiel.length === 0) return <p className="px-4 py-10 text-center text-[0.8rem] text-ink-3">Aucun matériel.</p>
    if (hasQuery && filteredMateriel.length === 0) return <p className="px-4 py-10 text-center text-[0.8rem] text-ink-3">Aucun résultat pour « {query} ».</p>
    return <MaterielList tubes={listTubes} selectedId={selectedTube?.id ?? null} isFav={isFav} onToggleFav={toggleFav} onSelect={selectTube} />
  }

  return (
    <>
      {(section === 'home' || isTube) && (isDesktop ? (
        /* ── Desktop : workspace master-detail (liste + fiche) ── */
        <div className="workspace flex h-[calc(100vh-9rem)] gap-5">
          <aside className="flex w-80 shrink-0 flex-col">
            <div className="mb-3 flex items-center gap-2.5">
              <h1 className="text-base font-bold text-ink">Matériel</h1>
              {materiel.length > 0 && (
                <span className="inline-flex items-center rounded-full border border-line bg-canvas-2 px-2 py-0.5 text-[0.66rem] font-medium tabular-nums text-ink-2">{materiel.length}</span>
              )}
              <button onClick={onNewMateriel} className="ml-auto flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[0.74rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.98]">
                <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Nouveau
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line bg-canvas">
              {renderListPane()}
            </div>
          </aside>

          <section className="workspace-detail min-w-0 flex-1 overflow-y-auto pb-6">
            {selectedTube ? (
              <div key={selectedTube.id} className="fade-up relative max-w-4xl pl-5">
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] rounded-full" style={{ background: selectedTube.couleur }} />
                <TubeFiche tube={selectedTube} embedded isFav={isFav(selectedTube.id)} onToggleFav={() => toggleFav(selectedTube.id)} onBack={() => setSection('home')} onEdit={() => onEditMateriel(selectedTube)} onDelete={() => handleDelete(selectedTube)} linkedDocs={documents.filter(d => links.some(l => l.materiel_id === selectedTube.id && l.document_id === d.id))} onEditLinks={() => onEditMaterielLinks(selectedTube)} onOpenDoc={(id) => setSection(id)} profiles={profiles} onShowHistory={() => onShowHistory('materiel', selectedTube.id, selectedTube.nom)} />
              </div>
            ) : isTube ? (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <p className="text-[0.82rem] text-ink-3">{loading ? 'Chargement…' : 'Échantillon introuvable.'}</p>
              </div>
            ) : (
              <MaterielEmptyState />
            )}
          </section>
        </div>
      ) : (
        /* ── Mobile : cartes, ou fiche plein écran ── */
        isTube ? (
          selectedTube ? (
            <TubeFiche tube={selectedTube} isFav={isFav(selectedTube.id)} onToggleFav={() => toggleFav(selectedTube.id)} onBack={() => setSection('home')} onEdit={() => onEditMateriel(selectedTube)} onDelete={() => handleDelete(selectedTube)} linkedDocs={documents.filter(d => links.some(l => l.materiel_id === selectedTube.id && l.document_id === d.id))} onEditLinks={() => onEditMaterielLinks(selectedTube)} onOpenDoc={(id) => setSection(id)} profiles={profiles} onShowHistory={() => onShowHistory('materiel', selectedTube.id, selectedTube.nom)} />
          ) : (
            <div className="fade-up">
              <button onClick={() => setSection('home')} className="mb-4 flex items-center gap-1.5 text-[0.78rem] font-medium text-accent">
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
              </button>
              <p className="py-10 text-center text-[0.82rem] text-ink-3">{loading ? 'Chargement…' : 'Échantillon introuvable.'}</p>
            </div>
          )
        ) : (
          <div className="fade-up">
            <div className="mb-5 flex items-center">
              <button onClick={onNewMateriel} className="ml-auto flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[0.78rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.98]">
                <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Nouveau
              </button>
            </div>
            {renderCards()}
          </div>
        )
      ))}

      {section === 'procedures' && (
        <div className="fade-up mt-2 mx-auto max-w-3xl">
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
        <div className="fade-up mx-auto max-w-3xl">
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
        <div className="fade-up mx-auto max-w-3xl">
          <button onClick={() => setSection('home')} className="mb-3 mt-1 flex items-center gap-1 text-[0.78rem] font-medium text-accent">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
          </button>
          <p className="py-10 text-center text-[0.82rem] text-ink-3">{documentsLoading ? 'Chargement…' : 'Document introuvable.'}</p>
        </div>
      )}

      {section === 'notes' && (
        <div className="fade-up mx-auto max-w-3xl">
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
const centriBand: Record<CentrifugationStatus, { band: string; text: string; bar: string }> = {
  oui:         { band: 'bg-grn-soft', text: 'text-grn', bar: 'border-grn' },
  obligatoire: { band: 'bg-org-soft', text: 'text-org', bar: 'border-org' },
  non:         { band: 'bg-red-soft', text: 'text-red', bar: 'border-red' },
  variable:    { band: 'bg-canvas-2', text: 'text-ink-2', bar: 'border-ink-3' },
  na:          { band: 'bg-canvas-2', text: 'text-ink-2', bar: 'border-ink-3' },
}

// Un code (étiquette / excès / sans analyse) : valeur mono proéminente
// + détail entre parenthèses en petit. Tous au même niveau d'importance.
function CodeStat({ label, value }: { label: string; value: string }) {
  const m = value.match(/^(.*?)\s*\((.*)\)\s*$/)
  const main = m ? m[1] : value
  const detail = m ? m[2] : null
  return (
    <div className="min-w-0">
      <div className="mb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</div>
      <div className="font-mono text-xl font-bold leading-tight text-ink">{main || '—'}</div>
      {detail && <div className="mt-1 font-mono text-[0.7rem] text-ink-3">{detail}</div>}
    </div>
  )
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

function TubeFiche({ tube, isFav, onToggleFav, onBack, onEdit, onDelete, linkedDocs, onEditLinks, onOpenDoc, profiles, onShowHistory, embedded = false }: { tube: Materiel; isFav: boolean; onToggleFav: () => void; onBack: () => void; onEdit: () => void; onDelete: () => void; linkedDocs: DocItem[]; onEditLinks: () => void; onOpenDoc: (id: string) => void; profiles: Record<string, string>; onShowHistory: () => void; embedded?: boolean }) {
  const casCount = tube.casParticuliers.length + tube.alertes.length
  const hasNotes = tube.notes.length > 0 || Boolean(tube.codeReserve)
  const cb = centriBand[tube.centrifugation] ?? centriBand.na

  return (
    <div className="fade-up">
      {!embedded && (
        <button onClick={onBack} className="print-hide mb-4 flex items-center gap-1.5 text-[0.78rem] font-medium text-accent">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={SW} /> Retour
        </button>
      )}

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

      <div className="mb-6">
        {/* Centrifugation — bandeau coloré (héros, flashe selon le statut) */}
        <div className={`mb-4 flex items-start gap-3 rounded-xl border-l-[3px] px-4 py-3 ${cb.bar} ${cb.band}`}>
          <Activity aria-hidden="true" className={`mt-0.5 h-5 w-5 shrink-0 ${cb.text}`} strokeWidth={2} />
          <div className="min-w-0">
            <div className={`text-[0.58rem] font-bold uppercase tracking-[0.1em] opacity-80 ${cb.text}`}>Centrifuger</div>
            <div className={`text-lg font-bold leading-tight ${cb.text}`}>{centriLabel[tube.centrifugation] ?? tube.centrifugation}</div>
            {tube.centrifugationDetail && <p className="mt-1 text-[0.72rem] leading-snug text-ink-2">{tube.centrifugationDetail}</p>}
          </div>
        </div>

        {/* Codes — étiquette, excès, sans analyse (importance égale) */}
        <div className="mb-5 flex flex-wrap gap-x-10 gap-y-4">
          <CodeStat label="Étiquette" value={tube.etiquette || '—'} />
          {tube.codeExces && <CodeStat label="Excès" value={tube.codeExces} />}
          {tube.codeSansAnalyse && <CodeStat label="Sans analyse" value={tube.codeSansAnalyse} />}
        </div>

        {tube.destinations.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ArrowRightCircle aria-hidden="true" className="h-3.5 w-3.5 text-ink-3" strokeWidth={SW} />
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Destinations</span>
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

      {casCount > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Cas particuliers</span>
            <span className="rounded-md bg-org-soft px-1.5 py-0.5 text-[0.58rem] font-bold text-org">{casCount}</span>
          </div>
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
        </div>
      )}

      {hasNotes && (
        <div className="mt-4 border-t border-line pt-4">
          <div className="mb-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Notes &amp; codes</div>
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

