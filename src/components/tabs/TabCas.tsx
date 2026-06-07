import { casParticuliers } from '@/data/protocoles'

export function TabCas() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {casParticuliers.map(c => (
        <div key={c.titre} className="rounded-[9px] border-[0.5px] border-line bg-canvas p-3.5">
          <h4 className="text-[0.82rem] font-semibold text-ink">{c.icone} {c.titre}</h4>
          <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-2">{c.description}</p>
        </div>
      ))}
    </div>
  )
}
