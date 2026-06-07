import { reglesTransmission } from '@/data/protocoles'

export function TabFeuilles() {
  return (
    <div className="overflow-x-auto rounded-xl border-[0.5px] border-line bg-canvas">
      <table className="w-full text-[0.78rem]">
        <thead>
          <tr className="border-b border-line bg-canvas-2">
            <th className="px-3 py-2.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Labo</th>
            <th className="px-3 py-2.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Condition</th>
            <th className="px-3 py-2.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Où déposer</th>
            <th className="px-3 py-2.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Action spéciale</th>
          </tr>
        </thead>
        <tbody>
          {reglesTransmission.map((r, i) => (
            <tr key={i} className="state-hover border-b border-line last:border-b-0">
              <td className="px-3 py-2.5 font-semibold text-ink">{r.labo}</td>
              <td className="px-3 py-2.5 text-ink-2">{r.condition}</td>
              <td className="px-3 py-2.5 text-ink-2">{r.lieu}</td>
              <td className="px-3 py-2.5 text-ink-2">{r.actionSpeciale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
