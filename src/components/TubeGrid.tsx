import type { Tube } from '@/lib/types'
import { TubeCard } from '@/components/TubeCard'

interface Props {
  tubes: Tube[]
  isFav: (id: string) => boolean
  onToggleFav: (id: string) => void
  onSelect: (tube: Tube) => void
}

export function TubeGrid({ tubes, isFav, onToggleFav, onSelect }: Props) {
  if (tubes.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(132px,1fr))]">
      {tubes.map(t => (
        <TubeCard
          key={t.id}
          tube={t}
          isFav={isFav(t.id)}
          onToggleFav={() => onToggleFav(t.id)}
          onClick={() => onSelect(t)}
        />
      ))}
    </div>
  )
}
