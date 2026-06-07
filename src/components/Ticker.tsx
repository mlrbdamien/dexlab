import { checklist } from '@/data/protocoles'

export function Ticker() {
  return (
    <div className="rounded-lg border-[0.5px] border-accent/20 bg-accent-soft px-3.5 py-3">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-accent mb-1.5">Mémo</p>
      <ul className="columns-1 sm:columns-2 gap-x-6 text-[0.75rem] leading-relaxed text-accent-ink space-y-0.5">
        {checklist.map((c, i) => (
          <li key={i} className="break-inside-avoid flex items-baseline gap-1.5">
            <span className="text-accent text-[0.65rem]">✓</span>
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
