import { SectionHead } from '@/components/SectionHead'
import { etiquettesDescription, etiquettesFormat, etiquettesReimpression, reglesCollage, reimpressionNote } from '@/data/etiquettes'

export function TabEtiquettes() {
  return (
    <div>
      <SectionHead>Description des étiquettes (FP-7679 v3)</SectionHead>
      <Cards items={etiquettesDescription.map(e => ({ title: e.titre, body: e.description }))} />

      <SectionHead>Format visuel</SectionHead>
      <Cards items={etiquettesFormat.map(e => ({ title: `${e.icone} ${e.titre}`, body: e.description }))} />

      <SectionHead>Ré-impression (écran 105 DGLab)</SectionHead>
      <div className="overflow-x-auto rounded-[9px] border-[0.5px] border-line bg-canvas">
        <table className="w-full text-[0.78rem]">
          <thead>
            <tr className="border-b border-line bg-canvas-2">
              <th className="px-3 py-2.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Étiquette</th>
              <th className="px-3 py-2.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-3">N° à saisir</th>
            </tr>
          </thead>
          <tbody>
            {etiquettesReimpression.map(e => (
              <tr key={e.etiquette} className="state-hover border-b border-line last:border-b-0">
                <td className="px-3 py-2.5 font-medium text-ink">
                  <code className="rounded border-[0.5px] border-line bg-canvas-2 px-1 py-0.5 font-mono text-[0.68rem]">{e.etiquette}</code>
                </td>
                <td className="px-3 py-2.5 text-ink-2">{e.numero}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[0.72rem] text-ink-3">{reimpressionNote}</p>

      <SectionHead>Règles de collage & vérifications</SectionHead>
      <Cards items={reglesCollage.map(r => ({ title: `${r.icone} ${r.titre}`, body: r.description }))} />
    </div>
  )
}

function Cards({ items }: { items: { title: string; body: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {items.map(item => (
        <div key={item.title} className="rounded-[9px] border-[0.5px] border-line bg-canvas p-3.5">
          <h4 className="text-[0.82rem] font-semibold text-ink">{item.title}</h4>
          <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-2">{item.body}</p>
        </div>
      ))}
    </div>
  )
}
