import { useEffect, useRef, useState } from 'react'
import { X, History } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { formatDateTime } from '@/lib/format'

const SW = 1.75

interface AuditEntry {
  id: number
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  changed_by: string | null
  changed_at: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
}

interface Props {
  table: 'materiel' | 'documents'
  rowId: string
  title: string
  profiles: Record<string, string>
  onClose: () => void
}

// Colonnes techniques exclues du diff affiché
const IGNORED = new Set(['id', 'position', 'created_at', 'updated_at', 'created_by', 'updated_by'])

const FIELD_LABELS: Record<string, string> = {
  type: 'Type', nom: 'Nom', sous_titre: 'Sous-titre', etiquette: 'Étiquette',
  couleur: 'Couleur', centrifugation: 'Centrifugation', centrifugation_detail: 'Détail centrifugation',
  code_exces: 'Code excès', code_sans_analyse: 'Code sans analyse', code_reserve: 'Code réserve',
  destinations: 'Destinations', notes: 'Notes', alertes: 'Alertes', cas_particuliers: 'Cas particuliers',
  titre: 'Titre', contenu: 'Contenu', tags: 'Tags', epingle: 'Épinglage',
}

const ACTION_META: Record<AuditEntry['action'], { label: string; cls: string }> = {
  INSERT: { label: 'Création', cls: 'bg-grn-soft text-grn' },
  UPDATE: { label: 'Modification', cls: 'bg-blu-soft text-blu' },
  DELETE: { label: 'Suppression', cls: 'bg-red-soft text-red' },
}

const CENTRI_LABELS: Record<string, string> = {
  oui: 'Oui', obligatoire: 'Obligatoire', non: 'Non', variable: 'Variable', na: 'N/A',
}

// Représentation lisible d'une valeur de champ pour l'affichage avant/après.
function fmtValue(key: string, v: unknown): string {
  if (v === null || v === undefined || v === '') return '(vide)'
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non'
  if (key === 'centrifugation' && typeof v === 'string') return CENTRI_LABELS[v] ?? v
  if (Array.isArray(v)) {
    if (v.length === 0) return '(vide)'
    return v.map(item => {
      if (item && typeof item === 'object') {
        const label = (item as Record<string, unknown>).label
        const detail = (item as Record<string, unknown>).detail
        if (typeof label === 'string') return label + (typeof detail === 'string' && detail ? ` (${detail})` : '')
        return JSON.stringify(item)
      }
      return String(item)
    }).join(' · ')
  }
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function truncate(s: string, n = 180): string {
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s
}

interface FieldDiff { key: string; label: string; before: string; after: string }

function computeDiffs(old: Record<string, unknown> | null, neu: Record<string, unknown> | null): FieldDiff[] {
  if (!old || !neu) return []
  const keys = new Set([...Object.keys(old), ...Object.keys(neu)])
  const out: FieldDiff[] = []
  for (const k of keys) {
    if (IGNORED.has(k)) continue
    if (JSON.stringify(old[k]) !== JSON.stringify(neu[k])) {
      out.push({
        key: k,
        label: FIELD_LABELS[k] ?? k,
        before: truncate(fmtValue(k, old[k])),
        after: truncate(fmtValue(k, neu[k])),
      })
    }
  }
  return out
}

export function HistoryPanel({ table, rowId, title, profiles, onClose }: Props) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useFocusTrap(panelRef)

  useEffect(() => {
    if (!supabase) return
    let alive = true
    void supabase
      .from('audit_log')
      .select('id, action, changed_by, changed_at, old_data, new_data')
      .eq('table_name', table)
      .eq('row_id', rowId)
      .order('changed_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (!alive) return
        if (err) setError(err.message)
        else setEntries((data ?? []) as AuditEntry[])
      })
    return () => { alive = false }
  }, [table, rowId])

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); onClose() } }
    window.addEventListener('keydown', h, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h, true); document.body.style.overflow = prev; trigger?.focus?.() }
  }, [onClose])

  const who = (id: string | null) => (id ? (profiles[id] ?? 'Utilisateur inconnu') : 'Système')

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 py-[6vh]" role="dialog" aria-modal="true" aria-label={`Historique — ${title}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div ref={panelRef} className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-canvas shadow-2xl animate-[pop-in_150ms_ease-out]">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <History aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-3" strokeWidth={SW} />
            <h2 className="truncate text-[0.92rem] font-semibold text-ink">Historique — {title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors duration-150 hover:bg-canvas-2 hover:text-ink">
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={SW} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!supabase ? (
            <p className="px-1 py-10 text-center text-[0.82rem] text-ink-3">Base de données non configurée.</p>
          ) : error ? (
            <p role="alert" className="px-1 py-8 text-center text-[0.82rem] text-red">Impossible de charger l’historique : {error}</p>
          ) : entries === null ? (
            <p className="px-1 py-10 text-center text-[0.82rem] text-ink-3">Chargement…</p>
          ) : entries.length === 0 ? (
            <p className="px-1 py-10 text-center text-[0.82rem] text-ink-3">Aucune modification enregistrée pour cet élément.</p>
          ) : (
            <ol className="space-y-3">
              {entries.map(e => {
                const meta = ACTION_META[e.action]
                const diffs = e.action === 'UPDATE' ? computeDiffs(e.old_data, e.new_data) : []
                return (
                  <li key={e.id} className="relative rounded-xl border border-line bg-canvas-2/40 p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.04em] ${meta.cls}`}>{meta.label}</span>
                      <span className="text-[0.78rem] font-medium text-ink">{who(e.changed_by)}</span>
                      <span className="ml-auto text-[0.7rem] text-ink-3">{formatDateTime(e.changed_at)}</span>
                    </div>
                    {e.action === 'UPDATE' && (
                      diffs.length > 0 ? (
                        <div className="mt-2.5 space-y-2.5">
                          {diffs.map(d => (
                            <div key={d.key}>
                              <div className="text-[0.6rem] font-semibold uppercase tracking-[0.04em] text-ink-3">{d.label}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.72rem]">
                                <span className="rounded-md bg-red-soft px-1.5 py-0.5 text-red line-through decoration-red/40 [overflow-wrap:anywhere]">{d.before}</span>
                                <span className="shrink-0 text-ink-3">→</span>
                                <span className="rounded-md bg-grn-soft px-1.5 py-0.5 text-grn [overflow-wrap:anywhere]">{d.after}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-1.5 text-[0.7rem] text-ink-3">Aucun champ visible modifié.</p>
                      )
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
