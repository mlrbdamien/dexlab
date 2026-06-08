// Rappels du bandeau défilant (constante d'UI). La checklist éditable
// existe par ailleurs en tant que mémo dans la base (section Notes).
const checklist = [
  'Vérifier identité tubes = feuille (y.c. micro-tubes)',
  'Lecteur optique : nb codes = nb coches',
  'Prescr. connectée : nb tubes = nb écran, étiquettes OK, NLab OK',
  'Post-it actif (billet jaune) ?',
  'Annotations → Données cliniques > Libellé',
  'Codes manuscrits → ajouter manuellement',
  'Code introuvable DGLab → fichier ANASPB',
  'Visa HAUT = étiquetage · Visa BAS = enregistrement',
  'Vérifier remplissage des tubes',
  'Échantillon manquant → prévenir requérant, inscrire ∅',
]

export function TickerBanner() {
  const items = checklist.map(c => `✓ ${c}`)

  return (
    <div role="region" aria-label="Rappels" className="ticker-banner shrink-0 border-b border-accent/20 bg-accent-soft overflow-hidden">
      <div className="ticker-track flex w-max">
        {[0, 1].map(copy => (
          <div key={copy} className="ticker-content flex items-center gap-0 px-4 py-2" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={`${copy}-${i}`} className="flex items-center shrink-0">
                <span className="ticker-item whitespace-nowrap text-[0.72rem] text-accent-ink">{item}</span>
                {i < items.length - 1 && <span className="ticker-sep mx-3 text-accent/40">•</span>}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
