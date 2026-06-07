import { reglesCheckin } from '@/data/protocoles'

export function TabCheckin() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {reglesCheckin.map(r => (
        <div key={r.titre} className="rounded-[9px] border-[0.5px] border-line bg-canvas p-3.5">
          <h4 className="text-[0.82rem] font-semibold text-ink">{r.icone} {r.titre}</h4>
          <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-2">{r.description}</p>
        </div>
      ))}
    </div>
  )
}
