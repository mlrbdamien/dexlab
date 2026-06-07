import { useState, useEffect, useCallback } from 'react'
import { Outlet } from 'react-router-dom'
import { Moon, Sun, Droplets, Crosshair, BookOpen, PanelLeft, PanelLeftClose } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useSearch } from '@/hooks/useSearch'
import { SearchBar } from '@/components/SearchBar'
import { TickerBanner } from '@/components/TickerBanner'
import { Changelog } from '@/components/Changelog'
import { CommandPalette } from '@/components/CommandPalette'
import { procedures } from '@/lib/navigation'
import type { LucideIcon } from 'lucide-react'
import type { Section, LayoutCtx } from '@/lib/navigation'

const SW = 1.75

export function Layout() {
  const { theme, toggle } = useTheme()
  const [section, setSection] = useState<Section>('home')
  const { query, setQuery, filteredTubes } = useSearch()

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

  const isProc = !['home', 'procedures'].includes(section) && !section.startsWith('tube:')
  const mobileTab = isProc || section === 'procedures' ? 'procedures' : 'identify'
  const go = (tab: string) => {
    const map: Record<string, Section> = { identify: 'home', procedures: 'procedures' }
    setSection(map[tab] ?? 'home')
  }

  const ctx: LayoutCtx = { section, setSection, query, setQuery, filteredTubes }

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
          <SideItem icon={Crosshair} label="Identifier" collapsed={collapsed} active={section === 'home' || section.startsWith('tube:')} onClick={() => setSection('home')} />

          {!collapsed && <p className="px-3 pt-5 pb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-3">Procédures</p>}
          {collapsed && <div className="mx-2 my-2 h-px bg-line" />}

          {procedures.map(p => (
            <SideItem key={p.id} icon={p.icon} label={p.label} collapsed={collapsed} active={section === p.id} onClick={() => setSection(p.id)} />
          ))}
        </nav>

        <div className={`mt-auto shrink-0 border-t border-line py-3 ${collapsed ? 'px-2' : 'px-3'} space-y-1`}>
          <SideItem icon={collapsed ? PanelLeft : PanelLeftClose} label={collapsed ? 'Déplier le menu' : 'Replier le menu'} collapsed={collapsed} onClick={toggleCollapsed} />
          <SideItem icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'} collapsed={collapsed} onClick={toggle} />
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
          <BTab icon={Crosshair} label="Identifier" active={mobileTab === 'identify'} onClick={() => go('identify')} />
          <BTab icon={BookOpen} label="Procédures" active={mobileTab === 'procedures'} onClick={() => go('procedures')} />
        </div>
      </nav>

      {paletteOpen && <CommandPalette onClose={closePalette} onNavigate={setSection} onToggleTheme={toggle} theme={theme} />}
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
