import { checklist } from '@/data/protocoles'

export function TickerBanner() {
  const items = checklist.map(c => `✓ ${c}`)

  return (
    <div className="ticker-banner shrink-0 border-b border-accent/20 bg-accent-soft overflow-hidden">
      <div className="ticker-track flex w-max">
        {[0, 1].map(copy => (
          <div key={copy} className="ticker-content flex items-center gap-0 px-4 py-2" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center shrink-0">
                <span className="ticker-item whitespace-nowrap text-[0.72rem] text-accent-ink">{item}</span>
                {i < items.length - 1 && <span className="ticker-sep mx-3 text-accent/40">•</span>}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
