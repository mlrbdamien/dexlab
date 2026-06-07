import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  variant?: 'default' | 'danger'
}

export function Accordion({ title, children, defaultOpen = false, variant = 'default' }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={`overflow-hidden rounded-[9px] border-[0.5px] bg-canvas ${variant === 'danger' ? 'border-red/30' : 'border-line'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`state-hover flex w-full items-center justify-between px-3.5 py-3 ${variant === 'danger' ? 'text-red' : 'text-ink'}`}
      >
        <h3 className="text-[0.82rem] font-semibold">{title}</h3>
        <ChevronRight className={`h-3.5 w-3.5 text-ink-3 transition-transform duration-150 ${open ? 'rotate-90' : ''}`} strokeWidth={1.75} />
      </button>
      {open && (
        <div className="border-t border-line px-3.5 py-3.5 text-[0.82rem] text-ink-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ul]:space-y-0.5 [&_ol]:ml-4 [&_ol]:list-decimal [&_ol]:space-y-0.5 [&_li]:leading-relaxed [&_p]:leading-relaxed [&_p]:mb-2 [&_strong]:text-ink [&_code]:rounded [&_code]:border-[0.5px] [&_code]:border-line [&_code]:bg-canvas-2 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.72rem]">
          {children}
        </div>
      )}
    </div>
  )
}
