import { Accordion } from '@/components/Accordion'
import { etapesEnregistrement } from '@/data/protocoles'

export function TabEnregistrement() {
  return (
    <div className="space-y-2.5">
      {etapesEnregistrement.map(e => (
        <Accordion key={e.id} title={e.titre} variant={e.variante === 'danger' ? 'danger' : 'default'}>
          <div dangerouslySetInnerHTML={{ __html: e.contenuHtml }} />
        </Accordion>
      ))}
    </div>
  )
}
