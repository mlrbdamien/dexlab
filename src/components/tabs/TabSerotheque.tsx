import { codesSerotheque } from '@/data/protocoles'

export function TabSerotheque() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {codesSerotheque.map(c => (
        <div key={c.code} className="rounded-xl border-[0.5px] border-line bg-canvas p-3.5">
          <h4 className="text-[0.82rem] font-semibold text-ink">{c.nom}</h4>
          <code className="mt-1.5 inline-block rounded border-[0.5px] border-line bg-canvas-2 px-1.5 py-0.5 font-mono text-[0.75rem]">{c.code}</code>
          {c.detail && <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-2">{c.detail}</p>}
        </div>
      ))}
    </div>
  )
}
