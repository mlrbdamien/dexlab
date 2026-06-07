import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-ink-3" strokeWidth={1.75} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Rechercher un tube, un service…"
        className="h-10 w-full rounded-lg border-[0.5px] border-line bg-canvas pl-9 pr-16 text-[0.82rem] text-ink outline-none transition placeholder:text-ink-3 focus:border-accent focus:ring-1 focus:ring-accent/25"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border-[0.5px] border-line bg-canvas-2 px-1.5 py-0.5 font-mono text-[0.6rem] text-ink-3">⌘K</kbd>
    </div>
  )
}
