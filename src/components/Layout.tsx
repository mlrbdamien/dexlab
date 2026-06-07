import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Moon, Sun, Droplets, Crosshair, BookOpen } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useSearch } from '@/hooks/useSearch'
import { SearchBar } from '@/components/SearchBar'
import { TickerBanner } from '@/components/TickerBanner'
import { Changelog } from '@/components/Changelog'
import { procedures } from '@/lib/navigation'
import type { LucideIcon } from 'lucide-react'
import type { Section, LayoutCtx } from '@/lib/navigation'

const SW = 1.75

export function Layout() {
  const { theme, toggle } = useTheme()
  const [section, setSection] = useState<Section>('home')
  const { query, setQuery, filteredTubes } = useSearch()

  const isProc = !['home','procedures'].includes(section) && !section.startsWith('tube:')
  const mobileTab = isProc || section === 'procedures' ? 'procedures' : 'identify'

  const go = (tab: string) => {
    const map: Record<string, Section> = { identify:'home', procedures:'procedures' }
    setSection(map[tab] ?? 'home')
  }

  const ctx: LayoutCtx = { section, setSection, query, setQuery, filteredTubes }

  return (
    <div className="flex min-h-screen bg-canvas text-ink">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:w-[188px] md:flex-col md:fixed md:inset-y-0 md:left-0 border-r border-line bg-canvas-3 z-40">
        <div className="flex items-center gap-2.5 px-4 h-14 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <Droplets className="h-3.5 w-3.5 text-white" strokeWidth={SW} />
          </div>
          <span className="text-[0.78rem] font-semibold text-ink">Dexlab</span>
        </div>

        <nav aria-label="Navigation principale" className="flex-1 overflow-y-auto px-2 pt-0.5 pb-2 space-y-px">
          <NavItem icon={Crosshair} label="Identifier" active={section === 'home' || section.startsWith('tube:')} onClick={() => setSection('home')} />

          <div className="my-2 mx-2 h-px bg-line" />
          <p className="px-2.5 pb-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Procédures</p>

          {procedures.map(p => (
            <NavItem key={p.id} icon={p.icon} label={p.label} active={section === p.id} onClick={() => setSection(p.id)} />
          ))}
        </nav>

        <div className="shrink-0 border-t border-line px-3 py-2">
          <button onClick={toggle} className="state-hover flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[0.72rem] text-ink-3 hover:text-ink-2">
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" strokeWidth={SW} /> : <Moon className="h-3.5 w-3.5" strokeWidth={SW} />}
            {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 md:ml-[188px] min-h-screen flex flex-col">
        <header className="md:hidden sticky top-0 z-40 flex h-12 items-center justify-between px-4 bg-canvas border-b border-line">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-accent">
              <Droplets className="h-3 w-3 text-white" strokeWidth={SW} />
            </div>
            <span className="text-[0.78rem] font-semibold text-ink">Dexlab</span>
          </div>
          <button onClick={toggle} aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'} className="flex h-7 w-7 items-center justify-center rounded text-ink-2 hover:text-ink hover:bg-canvas-3 transition-colors">
            {theme === 'dark' ? <Sun aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> : <Moon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} />}
          </button>
        </header>

        <TickerBanner />

        <div className="sticky top-12 md:top-0 z-30 border-b border-line bg-canvas px-4 md:px-6 py-3">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <main className="flex-1 px-4 md:px-6 pt-4 pb-24 md:pb-8 mx-auto w-full max-w-4xl">
          <Outlet context={ctx} />
          <Changelog />
        </main>
      </div>

      {/* ── Mobile Bottom Bar ── */}
      <nav aria-label="Navigation mobile" className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-canvas border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex h-14">
          <BTab icon={Crosshair}  label="Identifier"  active={mobileTab === 'identify'}   onClick={() => go('identify')} />
          <BTab icon={BookOpen}   label="Procédures"   active={mobileTab === 'procedures'} onClick={() => go('procedures')} />
        </div>
      </nav>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`state-hover flex w-full items-center gap-2 rounded-md px-2.5 py-[7px] text-[0.75rem] font-medium transition-colors ${
        active ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:text-ink'
      }`}
    >
      <Icon aria-hidden="true" className="h-[15px] w-[15px] shrink-0" strokeWidth={SW} />
      <span className="truncate leading-tight">{label}</span>
    </button>
  )
}

function BTab({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-current={active ? 'page' : undefined} className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${active ? 'text-accent' : 'text-ink-3'}`}>
      <Icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={active ? 2 : SW} />
      <span className="text-[0.58rem] font-medium">{label}</span>
    </button>
  )
}
