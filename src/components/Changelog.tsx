import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const entries = [
  {
    date: '07.06.2026 — v2.1',
    items: [
      'Retrait de l’annuaire téléphonique interne (données non destinées à un hébergement public)',
    ],
  },
  {
    date: '07.06.2026 — v2.0',
    items: [
      'Migration React + Vite + TypeScript',
      'Navigation sidebar desktop et barre mobile',
      'Recherche fuzzy (Fuse.js) sur les tubes',
      'Déploiement automatisé via GitHub Actions',
    ],
  },
  {
    date: '21.03.2026 — v1.4',
    items: [
      "Refonte complète de l'interface (typographie DM Sans/DM Mono, tokens unifiés, dark mode amélioré)",
      'Cartes tubes : hauteur fixe, indicateur centrifugation intégré, shimmer subtil',
      'Modales : layout restructuré, badges sémantiques cohérents, animation springy',
      'Accordéons unifiés, table styles cohérents, chips destinations',
    ],
  },
  {
    date: '21.03.2026 — v1.3',
    items: [
      'Ajout des cartes téléphones internes (section dédiée, filtrables)',
      'Ajout du système de favoris (épingler les tubes fréquents)',
      'Ajout du changelog',
    ],
  },
  {
    date: '20.03.2026 — v1.2',
    items: [
      "Intégration du contenu FP-7679 (étiquettes DGLab) dans l'onglet Étiquettes",
      'Séparation centrifugation / destinations dans les fiches tubes',
    ],
  },
  {
    date: '20.03.2026 — v1.1',
    items: ['Intégration complète du Mémo Poste C'],
  },
  {
    date: '20.03.2026 — v1.0',
    items: ['Version initiale basée sur PR-6387 v4'],
  },
]

export function Changelog() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-8 border-t border-line pt-4">
      <button
        onClick={() => setOpen(v => !v)}
        className="state-hover flex items-center gap-2 text-[0.75rem] font-medium text-ink-3 hover:text-ink-2"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? '' : '-rotate-90'}`} strokeWidth={1.75} />
        Historique des modifications
      </button>
      {open && (
        <div className="mt-3 space-y-4 pl-5">
          {entries.map(e => (
            <div key={e.date}>
              <p className="text-[0.68rem] font-semibold text-ink-2 mb-1">{e.date}</p>
              <ul className="ml-3 list-disc space-y-0.5 text-[0.72rem] text-ink-3">
                {e.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
