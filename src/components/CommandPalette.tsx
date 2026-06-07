import { useEffect, useMemo, useRef, useState } from 'react'
import Fuse from 'fuse.js'
import { Search, FileText, Crosshair, Sun, Moon, CornerDownLeft, TestTube, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { tubes } from '@/data/tubes'
import { procedures } from '@/lib/navigation'
import type { Section } from '@/lib/navigation'
import type { LucideIcon } from 'lucide-react'

const SW = 1.75
type Theme = 'light' | 'dark'

interface Cmd {
  id: string
  label: string
  group: string
  icon: LucideIcon
  keywords: string
  run: () => void
}

interface Props {
  onClose: () => void
  onNavigate: (s: Section) => void
  onToggleTheme: () => void
  theme: Theme
}

// Monté uniquement lorsqu'ouvert (état frais à chaque ouverture).
export function CommandPalette({ onClose, onNavigate, onToggleTheme, theme }: Props) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])

  const commands: Cmd[] = useMemo(() => {
    const go = (s: Section) => () => { onNavigate(s); onClose() }
    const nav: Cmd[] = [
      { id: 'nav-home', label: 'Matériel', group: 'Aller à', icon: Crosshair, keywords: 'accueil home materiel tubes identifier', run: go('home') },
      { id: 'nav-proc', label: 'Procédures', group: 'Aller à', icon: FileText, keywords: 'procedures', run: go('procedures') },
      { id: 'action-theme', label: theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre', group: 'Action', icon: theme === 'dark' ? Sun : Moon, keywords: 'theme mode sombre clair dark light', run: () => { onToggleTheme(); onClose() } },
      { id: 'action-logout', label: 'Se déconnecter', group: 'Action', icon: LogOut, keywords: 'deconnexion logout quitter session', run: () => { void supabase?.auth.signOut(); onClose() } },
    ]
    const procs: Cmd[] = procedures.map(p => ({ id: `proc-${p.id}`, label: p.label, group: 'Procédure', icon: p.icon, keywords: `procedure ${p.label}`, run: go(p.id) }))
    const tubeCmds: Cmd[] = tubes.map(t => ({ id: `tube-${t.id}`, label: t.nom, group: 'Tube', icon: TestTube, keywords: `${t.nom} ${t.sousTitre} ${t.motsCles} ${t.etiquette}`, run: go(`tube:${t.id}`) }))
    return [...nav, ...procs, ...tubeCmds]
  }, [theme, onNavigate, onToggleTheme, onClose])

  const fuse = useMemo(() => new Fuse(commands, { keys: ['label', 'keywords'], threshold: 0.4, ignoreLocation: true }), [commands])

  const results: Cmd[] = useMemo(() => {
    const q = query.trim()
    if (!q) return commands.slice(0, 7)
    return fuse.search(q).map(r => r.item).slice(0, 12)
  }, [query, fuse, commands])

  // Focus + verrou du scroll de fond (au montage)
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 0)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { clearTimeout(t); document.body.style.overflow = prevOverflow }
  }, [])

  // Navigation clavier
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
      else if (e.key === 'Enter') { e.preventDefault(); results[active]?.run() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [results, active, onClose])

  // Maintient l'élément actif visible
  useEffect(() => { itemsRef.current[active]?.scrollIntoView({ block: 'nearest' }) }, [active])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fade-in_120ms_ease-out]" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-canvas/90 shadow-2xl backdrop-blur-2xl animate-[pop-in_150ms_ease-out]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={SW} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0) }}
            placeholder="Rechercher un tube, une procédure, une action…"
            aria-label="Rechercher une commande"
            className="h-12 w-full bg-transparent text-[0.9rem] text-ink outline-none placeholder:text-ink-3"
          />
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-[0.82rem] text-ink-3">Aucun résultat</p>
          ) : (
            results.map((c, i) => (
              <button
                key={c.id}
                ref={el => { itemsRef.current[i] = el }}
                onClick={() => c.run()}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
                  i === active ? 'bg-accent-soft' : ''
                }`}
              >
                <c.icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${i === active ? 'text-accent' : 'text-ink-3'}`} strokeWidth={SW} />
                <span className="flex-1 truncate text-[0.85rem] text-ink">{c.label}</span>
                <span className="shrink-0 text-[0.6rem] font-medium uppercase tracking-[0.08em] text-ink-2">{c.group}</span>
                {i === active && <CornerDownLeft aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-ink-3" strokeWidth={SW} />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
