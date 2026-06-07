interface Props {
  children: React.ReactNode
  variant?: 'default' | 'fav'
}

export function SectionHead({ children, variant = 'default' }: Props) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5 mt-5 first:mt-0">
      <h2 className={`text-[0.62rem] font-semibold uppercase tracking-[0.08em] ${
        variant === 'fav' ? 'text-amber-500' : 'text-ink-3'
      }`}>{children}</h2>
      <div className={`h-px flex-1 ${variant === 'fav' ? 'bg-amber-200 dark:bg-amber-800' : 'bg-line'}`} />
    </div>
  )
}
