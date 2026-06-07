import { X } from 'lucide-react'
import type { Tube, CentrifugationStatus, DestinationCategorie } from '@/lib/types'

const centriConfig: Record<CentrifugationStatus, { label: string; cls: string }> = {
  oui:         { label: '✓ Oui',          cls: 'bg-grn-soft text-grn' },
  obligatoire: { label: '⬤ Obligatoire',  cls: 'bg-org-soft text-org' },
  non:         { label: '✗ Non',           cls: 'bg-red-soft text-red' },
  variable:    { label: '⚠ Variable',      cls: 'bg-canvas-2 text-ink-2' },
  na:          { label: '— N/A',           cls: 'bg-canvas-2 text-ink-3' },
}

const destColors: Record<DestinationCategorie, string> = {
  '8100':     'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 [&_strong]:text-green-700 dark:[&_strong]:text-green-400',
  bleu:       'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 [&_strong]:text-blue-700 dark:[&_strong]:text-blue-400',
  hemato:     'bg-rose-50 border-rose-200 dark:bg-rose-950 dark:border-rose-800 [&_strong]:text-rose-700 dark:[&_strong]:text-rose-400',
  mm:         'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800 [&_strong]:text-purple-700 dark:[&_strong]:text-purple-400',
  envoi:      'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700 [&_strong]:text-slate-700 dark:[&_strong]:text-slate-300',
  is:         'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800 [&_strong]:text-orange-700 dark:[&_strong]:text-orange-400',
  chimie:     'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 [&_strong]:text-blue-800 dark:[&_strong]:text-blue-300',
  bacterio:   'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800 [&_strong]:text-amber-800 dark:[&_strong]:text-amber-300',
  genetique:  'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 [&_strong]:text-green-800 dark:[&_strong]:text-green-300',
}

interface Props { tube: Tube; onClose: () => void }

export function TubeModal({ tube, onClose }: Props) {
  const c = centriConfig[tube.centrifugation]

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center overflow-y-auto bg-black/35 px-4 pt-10 pb-8"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[580px] fade-up rounded-xl border-[0.5px] border-line bg-canvas shadow-lg">
        {/* Header */}
        <div className="flex items-start gap-3.5 p-5 pb-3">
          <span className="mt-0.5 h-10 w-10 shrink-0 rounded-full border-[0.5px] border-black/8 dark:border-white/12" style={{ background: tube.couleur }} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-ink">{tube.nom}</h2>
            {tube.sousTitre && <p className="mt-0.5 text-[0.78rem] text-ink-2">{tube.sousTitre}</p>}
            <span className="mt-1.5 inline-block rounded-md border-[0.5px] border-line bg-canvas-2 px-2 py-0.5 font-mono text-[0.68rem] text-ink-3">
              étiq. {tube.etiquette}
            </span>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-3 hover:text-ink hover:bg-canvas-3 transition-colors">
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="space-y-0 px-5 pb-5">
          <Row label="Centrifuger">
            <span className={`inline-flex items-center gap-1 rounded-[5px] px-2 py-0.5 text-[0.78rem] font-semibold ${c.cls}`}>{c.label}</span>
            <p className="mt-1 text-[0.78rem] text-ink-2">{tube.centrifugationDetail}</p>
          </Row>

          <Row label="Destinations">
            <div className="flex flex-wrap gap-1.5">
              {tube.destinations.map((d, i) => (
                <div key={i} className={`rounded-md border-[0.5px] px-2 py-0.5 text-[0.78rem] ${destColors[d.categorie]}`}>
                  <strong className="font-semibold">{d.label}</strong>
                  {d.detail && <span className="ml-1 text-[0.68rem] text-ink-2"> · {d.detail}</span>}
                </div>
              ))}
            </div>
          </Row>

          {(tube.codeExces || tube.codeSansAnalyse || tube.codeReserve) && (
            <Row label="Codes">
              <div className="space-y-1">
                {tube.codeExces && <CRow label="Tubes excès" code={tube.codeExces} />}
                {tube.codeSansAnalyse && <CRow label="Sans analyses" code={tube.codeSansAnalyse} />}
                {tube.codeReserve && <CRow label="Réserve" code={tube.codeReserve} />}
              </div>
            </Row>
          )}

          {tube.alertes.length > 0 && <Row label=""><Msg variant="danger" title="⚠ Attention" items={tube.alertes} /></Row>}
          {tube.casParticuliers.length > 0 && <Row label=""><Msg variant="info" title="Cas particuliers" items={tube.casParticuliers} /></Row>}
          {tube.notes.length > 0 && <Row label=""><Msg variant="warn" title="Notes" items={tube.notes} /></Row>}
        </div>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-3.5 first:border-t-0">
      {label ? (
        <div className="flex gap-3">
          <div className="min-w-[90px] shrink-0 pt-px text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</div>
          <div className="flex-1">{children}</div>
        </div>
      ) : children}
    </div>
  )
}

function CRow({ label, code }: { label: string; code: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="min-w-[90px] text-[0.72rem] text-ink-3">{label}</span>
      <code className="rounded border-[0.5px] border-line bg-canvas-2 px-1.5 py-0.5 font-mono text-[0.75rem]">{code}</code>
    </div>
  )
}

function Msg({ variant, title, items }: { variant: 'danger' | 'info' | 'warn'; title: string; items: string[] }) {
  const s = { danger: 'border-l-red bg-red-soft', info: 'border-l-accent bg-accent-soft', warn: 'border-l-org bg-org-soft' }
  const h = { danger: 'text-red', info: 'text-accent', warn: 'text-org' }
  return (
    <div className={`rounded-md border-l-[3px] p-3 text-[0.78rem] ${s[variant]}`}>
      <h4 className={`mb-1 text-[0.62rem] font-bold uppercase tracking-[0.06em] ${h[variant]}`}>{title}</h4>
      <ul className="ml-3.5 list-disc space-y-0.5 text-ink-2">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  )
}
