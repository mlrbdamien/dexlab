import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Components } from 'react-markdown'
import { Markdown } from '@/components/Markdown'

const SW = 1.75

// Compte les cases markdown ( - [ ] / - [x] ) du contenu.
const CHECKBOX_RE = /^[ \t]*[-*+]\s+\[[ xX]\]/gm

interface Props {
  id: string
  content: string
}

// Rend un document markdown avec cases à cocher INTERACTIVES : l'état est
// mémorisé localement (par appareil), une barre de progression et un bouton
// « Réinitialiser » permettent d'exécuter la procédure comme une checklist.
export function Checklist({ id, content }: Props) {
  const total = useMemo(() => (content.match(CHECKBOX_RE) || []).length, [content])
  const storeKey = `dexlab-checklist:${id}`

  const [done, setDone] = useState<Set<number>>(() => {
    try { return new Set<number>(JSON.parse(localStorage.getItem(storeKey) || '[]')) } catch { return new Set() }
  })
  const persist = (s: Set<number>) => { try { localStorage.setItem(storeKey, JSON.stringify([...s])) } catch { /* indispo */ } }
  const toggle = (i: number) => setDone(prev => {
    const n = new Set(prev)
    if (n.has(i)) n.delete(i); else n.add(i)
    persist(n)
    return n
  })
  const reset = () => { setDone(new Set()); try { localStorage.removeItem(storeKey) } catch { /* indispo */ } }

  // Index séquentiel des cases, dans l'ordre du document (rendu synchrone).
  let idx = 0
  const components: Components = {
    input() {
      const i = idx++
      return (
        <input
          type="checkbox"
          checked={done.has(i)}
          onChange={() => toggle(i)}
          aria-label={`Étape ${i + 1}`}
          className="h-4 w-4 cursor-pointer accent-[var(--c-accent)] align-middle"
        />
      )
    },
  }

  const count = [...done].filter(i => i < total).length
  const pct = total ? Math.round((count / total) * 100) : 0
  const allDone = total > 0 && count >= total

  return (
    <div>
      {total > 0 && (
        <div className="print-hide mb-4 rounded-xl border border-line bg-canvas-2/40 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[0.78rem] font-semibold text-ink">
              {count} / {total} étapes{allDone ? ' · terminé ✓' : ''}
            </span>
            <button type="button" onClick={reset} className="flex items-center gap-1.5 text-[0.72rem] font-medium text-ink-2 transition-colors duration-150 hover:text-ink">
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={SW} /> Réinitialiser
            </button>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas-3">
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <Markdown components={components}>{content}</Markdown>
    </div>
  )
}
