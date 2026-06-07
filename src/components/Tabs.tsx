import { useState } from 'react'

export interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  children: (activeId: string) => React.ReactNode
}

export function Tabs({ tabs, children }: Props) {
  const [active, setActive] = useState(tabs[0].id)

  return (
    <div className="mt-7">
      {/* M3 Secondary Tabs */}
      <div className="flex gap-0 overflow-x-auto border-b border-outline-variant scrollbar-none">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`m3-state-layer relative -mb-px shrink-0 whitespace-nowrap px-5 py-3.5 text-[0.8rem] font-medium m3-motion ${
              active === t.id
                ? 'text-primary'
                : 'text-on-surface-variant'
            }`}
          >
            {t.label}
            {/* M3 rounded indicator — 3px with pill ends */}
            {active === t.id && (
              <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-5 m3-fade-in">
        {children(active)}
      </div>
    </div>
  )
}
