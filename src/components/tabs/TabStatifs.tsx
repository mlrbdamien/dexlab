import { statifs } from '@/data/protocoles'

export function TabStatifs() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(155px,1fr))] gap-2">
      {statifs.map(s => (
        <div key={s.nom} className="flex items-center gap-2.5 rounded-[9px] border-[0.5px] border-line bg-canvas p-3">
          <span className="h-7 w-7 shrink-0 rounded-full border-[0.5px] border-black/8 dark:border-white/12" style={{ background: s.couleurFond }} />
          <div>
            <div className="text-[0.78rem] font-semibold text-ink">{s.emoji} {s.nom}</div>
            <div className="text-[0.68rem] text-ink-3 leading-snug">{s.destination}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
