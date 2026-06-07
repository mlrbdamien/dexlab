import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  onOpenPalette?: () => void
}

export function SearchBar({ value, onChange, onOpenPalette }: Props) {
  return (
    <div role="search" className="relative">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-ink-3" strokeWidth={1.75} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Rechercher un tube, un service…"
        aria-label="Rechercher un tube ou un service"
        className="h-11 w-full rounded-xl border border-line bg-canvas-2/60 pl-10 pr-16 text-[0.85rem] text-ink outline-none transition duration-150 placeholder:text-ink-3 focus:border-accent focus:bg-canvas focus:ring-2 focus:ring-accent/20"
      />
      {onOpenPalette ? (
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Ouvrir la palette de commandes (Ctrl+K)"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-line bg-canvas px-1.5 py-0.5 font-mono text-[0.62rem] text-ink-3 transition-colors duration-150 hover:text-ink-2"
        >
          ⌘K
        </button>
      ) : (
        <kbd aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-canvas-2 px-1.5 py-0.5 font-mono text-[0.62rem] text-ink-3">⌘K</kbd>
      )}
    </div>
  )
}
