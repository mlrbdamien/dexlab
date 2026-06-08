import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Moon, Sun, Droplets, Crosshair, BookOpen, PanelLeft, PanelLeftClose, LogOut, FileText, StickyNote } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'
import { useSearch } from '@/hooks/useSearch'
import { useMateriel } from '@/hooks/useMateriel'
import { useDocuments } from '@/hooks/useDocuments'
import { useLinks } from '@/hooks/useLinks'
import { SearchBar } from '@/components/SearchBar'
import { TickerBanner } from '@/components/TickerBanner'
import { Changelog } from '@/components/Changelog'
import { CommandPalette } from '@/components/CommandPalette'
import { MaterielForm } from '@/components/MaterielForm'
import { DocumentForm } from '@/components/DocumentForm'
import { LinkPicker } from '@/components/LinkPicker'
import { createMateriel, updateMateriel, deleteMateriel } from '@/lib/materielApi'
import { createDocument, updateDocument, deleteDocument } from '@/lib/documentApi'
import { setMaterielLinks, setDocumentLinks } from '@/lib/linkApi'
import type { LucideIcon } from 'lucide-react'
import type { Section, LayoutCtx } from '@/lib/navigation'
import type { Materiel, MaterielInput, DocItem, DocInput, DocType } from '@/lib/types'

const SW = 1.75

export function Layout() {
  const { theme, toggle } = useTheme()
  const [section, setSection] = useState<Section>('home')
  const { materiel, loading, error: materielError, refetch } = useMateriel()
  const { documents, loading: documentsLoading, error: documentsError, refetch: refetchDocuments } = useDocuments()
  const { links, refetch: refetchLinks } = useLinks()
  const procedureDocs = documents.filter(d => d.type === 'procedure')
  const { query, setQuery, filteredMateriel } = useSearch(materiel)

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('lumen-sidebar') === 'collapsed' } catch { return false }
  })
  const toggleCollapsed = () => setCollapsed(c => {
    const next = !c
    try { localStorage.setItem('lumen-sidebar', next ? 'collapsed' : 'expanded') } catch { /* indisponible */ }
    return next
  })

  const [paletteOpen, setPaletteOpen] = useState(false)
  const openPalette = useCallback(() => setPaletteOpen(true), [])
  const closePalette = useCallback(() => setPaletteOpen(false), [])

  // Formulaire Matériel (création / édition)
  const [form, setForm] = useState<{ open: boolean; editing: Materiel | null }>({ open: false, editing: null })
  const openNewMateriel = useCallback(() => setForm({ open: true, editing: null }), [])
  const openEditMateriel = useCallback((m: Materiel) => setForm({ open: true, editing: m }), [])
  const closeForm = useCallback(() => setForm({ open: false, editing: null }), [])
  const saveMateriel = useCallback(async (input: MaterielInput) => {
    if (form.editing) {
      await updateMateriel(form.editing.id, input)
    } else {
      const nextPos = materiel.length ? Math.max(...materiel.map(m => m.position)) + 1 : 0
      await createMateriel(input, nextPos)
    }
    setForm({ open: false, editing: null })
    await refetch()
  }, [form.editing, materiel, refetch])
  const handleDeleteMateriel = useCallback(async (m: Materiel) => {
    await deleteMateriel(m.id)
    await refetch()
  }, [refetch])

  // Formulaire Document (création / édition)
  const [docForm, setDocForm] = useState<{ open: boolean; editing: DocItem | null; type: DocType }>({ open: false, editing: null, type: 'note' })
  const openNewDocument = useCallback((type: DocType) => setDocForm({ open: true, editing: null, type }), [])
  const openEditDocument = useCallback((d: DocItem) => setDocForm({ open: true, editing: d, type: d.type }), [])
  const closeDocForm = useCallback(() => setDocForm({ open: false, editing: null, type: 'note' }), [])
  const saveDocument = useCallback(async (input: DocInput) => {
    if (docForm.editing) {
      await updateDocument(docForm.editing.id, input)
    } else {
      const nextPos = documents.length ? Math.max(...documents.map(d => d.position)) + 1 : 0
      await createDocument(input, nextPos)
    }
    setDocForm({ open: false, editing: null, type: 'note' })
    await refetchDocuments()
  }, [docForm.editing, documents, refetchDocuments])
  const handleDeleteDocument = useCallback(async (d: DocItem) => {
    await deleteDocument(d.id)
    await refetchDocuments()
  }, [refetchDocuments])
  const handleTogglePin = useCallback(async (d: DocItem) => {
    await updateDocument(d.id, { type: d.type, titre: d.titre, contenu: d.contenu, tags: d.tags, epingle: !d.epingle })
    await refetchDocuments()
  }, [refetchDocuments])

  // Liens croisés Matériel ↔ Document
  const [linkPicker, setLinkPicker] = useState<{ kind: 'materiel' | 'document'; id: string } | null>(null)
  const openMaterielLinks = useCallback((m: Materiel) => setLinkPicker({ kind: 'materiel', id: m.id }), [])
  const openDocLinks = useCallback((d: DocItem) => setLinkPicker({ kind: 'document', id: d.id }), [])
  const closeLinkPicker = useCallback(() => setLinkPicker(null), [])
  const saveLinks = useCallback(async (desiredIds: string[]) => {
    if (!linkPicker) return
    if (linkPicker.kind === 'materiel') {
      const current = links.filter(l => l.materiel_id === linkPicker.id).map(l => l.document_id)
      await setMaterielLinks(linkPicker.id, desiredIds, current)
    } else {
      const current = links.filter(l => l.document_id === linkPicker.id).map(l => l.materiel_id)
      await setDocumentLinks(linkPicker.id, desiredIds, current)
    }
    setLinkPicker(null)
    await refetchLinks()
  }, [linkPicker, links, refetchLinks])

  // Raccourci global ⌘K / Ctrl+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const currentDoc = documents.find(d => d.id === section)
  const isNotesArea = section === 'notes' || currentDoc?.type === 'note' || currentDoc?.type === 'memo'
  const isProcArea = section === 'procedures' || currentDoc?.type === 'procedure'
  const mobileTab = isNotesArea ? 'notes' : isProcArea ? 'procedures' : 'identify'
  const go = (tab: string) => {
    const map: Record<string, Section> = { identify: 'home', procedures: 'procedures', notes: 'notes' }
    setSection(map[tab] ?? 'home')
  }

  const ctx: LayoutCtx = { section, setSection, query, setQuery, materiel, filteredMateriel, documents, loading, documentsLoading, materielError, refetchMateriel: refetch, onNewMateriel: openNewMateriel, onEditMateriel: openEditMateriel, onDeleteMateriel: handleDeleteMateriel, documentsError, refetchDocuments, onNewDocument: openNewDocument, onEditDocument: openEditDocument, onDeleteDocument: handleDeleteDocument, onTogglePinDocument: handleTogglePin, links, onEditMaterielLinks: openMaterielLinks, onEditDocLinks: openDocLinks }

  return (
    <div className="flex min-h-screen bg-canvas text-ink">

      {/* ── Sidebar desktop (repliable) ── */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 z-40 border-r border-line bg-canvas-3 transition-[width] duration-200 ease-out ${
          collapsed ? 'md:w-16' : 'md:w-60'
        }`}
      >
        <div className={`flex h-16 shrink-0 items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-5'}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent">
            <Droplets aria-hidden="true" className="h-4 w-4 text-white" strokeWidth={SW} />
          </div>
          {!collapsed && <span className="text-[0.88rem] font-semibold tracking-tight text-ink">Dexlab</span>}
        </div>

        <nav aria-label="Navigation principale" className={`flex-1 overflow-y-auto py-2 ${collapsed ? 'px-2' : 'px-3'} space-y-1`}>
          <SideItem icon={Crosshair} label="Matériel" collapsed={collapsed} active={section === 'home' || section.startsWith('tube:')} onClick={() => setSection('home')} />

          {!collapsed && <p className="px-3 pt-5 pb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-3">Procédures</p>}
          {collapsed && <div className="mx-2 my-2 h-px bg-line" />}

          {procedureDocs.map(d => (
            <SideItem key={d.id} icon={FileText} label={d.titre} collapsed={collapsed} active={section === d.id} onClick={() => setSection(d.id)} />
          ))}

          <div className="mx-2 my-2 h-px bg-line" />
          <SideItem icon={StickyNote} label="Notes" collapsed={collapsed} active={isNotesArea} onClick={() => setSection('notes')} />
        </nav>

        <div className={`mt-auto shrink-0 border-t border-line py-3 ${collapsed ? 'px-2' : 'px-3'} space-y-1`}>
          <SideItem icon={collapsed ? PanelLeft : PanelLeftClose} label={collapsed ? 'Déplier le menu' : 'Replier le menu'} collapsed={collapsed} onClick={toggleCollapsed} />
          <SideItem icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'} collapsed={collapsed} onClick={toggle} />
          <SideItem icon={LogOut} label="Se déconnecter" collapsed={collapsed} onClick={() => { void supabase?.auth.signOut() }} />
        </div>
      </aside>

      {/* ── Zone principale ── */}
      <div className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out ${collapsed ? 'md:ml-16' : 'md:ml-60'}`}>
        {/* Header mobile (glass) */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line/60 bg-canvas/70 px-5 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
              <Droplets aria-hidden="true" className="h-3.5 w-3.5 text-white" strokeWidth={SW} />
            </div>
            <span className="text-[0.85rem] font-semibold tracking-tight text-ink">Dexlab</span>
          </div>
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors duration-150 hover:bg-canvas-3 hover:text-ink"
          >
            {theme === 'dark' ? <Sun aria-hidden="true" className="h-4 w-4" strokeWidth={SW} /> : <Moon aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />}
          </button>
        </header>

        <TickerBanner />

        {/* Barre de recherche (glass, sticky) */}
        <div className="sticky top-14 z-30 border-b border-line/60 bg-canvas/70 px-5 py-4 backdrop-blur-xl md:top-0 md:px-10">
          <div className="mx-auto w-full max-w-5xl">
            <SearchBar value={query} onChange={setQuery} onOpenPalette={openPalette} />
          </div>
        </div>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-8 pb-28 md:px-10 md:pb-14">
          <Outlet context={ctx} />
          <Changelog />
        </main>
      </div>

      {/* ── Barre mobile (glass) ── */}
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line/60 bg-canvas/80 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex h-16">
          <BTab icon={Crosshair} label="Matériel" active={mobileTab === 'identify'} onClick={() => go('identify')} />
          <BTab icon={BookOpen} label="Procédures" active={mobileTab === 'procedures'} onClick={() => go('procedures')} />
          <BTab icon={StickyNote} label="Notes" active={mobileTab === 'notes'} onClick={() => go('notes')} />
        </div>
      </nav>

      {paletteOpen && <CommandPalette materiel={materiel} documents={documents} onClose={closePalette} onNavigate={setSection} onToggleTheme={toggle} onNewMateriel={openNewMateriel} onNewDocument={openNewDocument} theme={theme} />}

      {form.open && <MaterielForm initial={form.editing} onSave={saveMateriel} onClose={closeForm} />}

      {docForm.open && <DocumentForm initial={docForm.editing} defaultType={docForm.type} onSave={saveDocument} onClose={closeDocForm} />}

      {linkPicker && (
        <LinkPicker
          title={linkPicker.kind === 'materiel' ? 'Documents liés' : 'Matériel lié'}
          options={linkPicker.kind === 'materiel'
            ? documents.map(d => ({ id: d.id, label: d.titre, sub: d.type === 'procedure' ? 'Procédure' : d.type === 'memo' ? 'Mémo' : 'Note' }))
            : materiel.map(m => ({ id: m.id, label: m.nom, sub: m.sousTitre }))}
          selected={linkPicker.kind === 'materiel'
            ? links.filter(l => l.materiel_id === linkPicker.id).map(l => l.document_id)
            : links.filter(l => l.document_id === linkPicker.id).map(l => l.materiel_id)}
          onSave={saveLinks}
          onClose={closeLinkPicker}
        />
      )}
    </div>
  )
}

function SideItem({ icon: Icon, label, collapsed, active = false, onClick }: { icon: LucideIcon; label: string; collapsed: boolean; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={`state-hover flex w-full items-center rounded-xl text-[0.82rem] font-medium transition-colors duration-150 ${
        collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
      } ${active ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:text-ink'}`}
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={SW} />
      {!collapsed && <span className="truncate leading-tight">{label}</span>}
    </button>
  )
}

function BTab({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150 ${active ? 'text-accent' : 'text-ink-3'}`}
    >
      <Icon aria-hidden="true" className="h-[20px] w-[20px]" strokeWidth={active ? 2 : SW} />
      <span className="text-[0.6rem] font-medium">{label}</span>
    </button>
  )
}
