import { gestionParLabo } from '@/data/protocoles'

export function TabGestion() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {gestionParLabo.map(g => (
        <div key={g.labo} className="rounded-[9px] border-[0.5px] border-line bg-canvas p-3.5">
          <h4 className="text-[0.82rem] font-semibold text-ink">{g.icone} {g.labo}</h4>
          <ul className="mt-1.5 ml-3.5 list-disc space-y-0.5 text-[0.75rem] leading-relaxed text-ink-2">
            {g.regles.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}
