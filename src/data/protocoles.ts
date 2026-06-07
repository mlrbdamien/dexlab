import type {
  EtapeProtocole,
  RegleTransmission,
  Statif,
  RegleCheckin,
  CodeSerotheque,
  GestionLabo,
  CasParticulier,
  ChecklistItem,
} from '../lib/types';

// ============================================================
// Protocoles & procédures — extrait de _reference/index.html
// ============================================================

// --- Bandeau ticker (rappels défilants) ---

export const checklist: ChecklistItem[] = [
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
];

// --- Onglet Enregistrement (accordéons) ---

export const etapesEnregistrement: EtapeProtocole[] = [
  {
    id: 'hopitaux',
    titre: '1.1 Demande des hôpitaux',
    variante: 'default',
    contenuHtml: `
      <p>Un dito doit être lu informatiquement. Si ce n'est pas le cas :</p>
      <ul>
        <li>Vérifier que l'établissement soit correct </li>
        <li>Si incorrect → dérouler le menu, chercher l'établissement correct, doucher le n° d'admission</li>
      </ul>`,
  },
  {
    id: 'prive',
    titre: '1.2 Demande requérant privé',
    variante: 'default',
    contenuHtml: `
      <ul>
        <li>Ligne de cas existe déjà (écran 309) → sélectionner celle-là</li>
        <li>Petits ditos (liste dans Établissements) → sélectionner établissement, doucher code-barre ou N° patient</li>
        <li>N°admission avec # → modifier et changer avec N° patient du dito</li>
        <li>Labo privé avec N° référence → écran 100, Généralité → Référence</li>
      </ul>`,
  },
  {
    id: 'rajout',
    titre: '1.4 Rajout d\'analyses',
    variante: 'default',
    contenuHtml: `
      <p>Feuilles sans prélèvement = rajout. Toujours sur demande contenant le matériel.</p>
      <p><strong>Non facturée :</strong></p>
      <ul>
        <li>Prescr. connectée : ajouter codes, enregistrer, imprimer étoile, tracer NLab, coller</li>
        <li>Lecteur optique : cocher « B », passer au lecteur, choisir demande avec matériel</li>
      </ul>
      <p><strong>Facturée :</strong></p>
      <ul>
        <li>Nouvelle demande, même date prélèvement</li>
        <li>« rajout sur NLAB XXX-XXXXX » dans Données cliniques > Libellé</li>
        <li>Transmettre étiquettes au labo</li>
      </ul>
      <p><em>Requérant différent → mettre en copie. Étiq. « rajout » pour hémato et MM uniquement.</em></p>`,
  },
  {
    id: 'activee',
    titre: '1.5 Demande activée ou inexistante',
    variante: 'default',
    contenuHtml: `
      <ol>
        <li>Pré-demandes (écran 114) ou effacées (écran 117)</li>
        <li>Appeler service : &lt;5-6 analyses → nouvelle demande · &gt;5-6 → nouvelle feuille ou tubes en réserve</li>
        <li>Requérant injoignable → sérum <code>S-TUB</code>, tube hémato → voir hématologie</li>
      </ol>`,
  },
  {
    id: 'copies',
    titre: '1.6 Copies',
    variante: 'default',
    contenuHtml: `
      <ul>
        <li><strong>Par mail</strong> : Diffusion → croix jaune → « + ». Introuvable → copies libres</li>
        <li><strong>Privé → méd. hospitalier</strong> : copie libre + mail annuaire</li>
        <li><strong>Service → méd. hospitalier</strong> : pas nécessaire</li>
        <li><strong>Service → privé</strong> : « + ». Introuvable → bac feuilles à problème</li>
        <li><strong>Copie patient</strong> : « 1 » sous Patient, onglet Diffusion</li>
        <li><strong>Patient par mail</strong> : écran 310, Transmission résultats, Diffusion 1 = mail</li>
      </ul>
      <p><em>Introuvable → enregistrer sans copie + bac vert feuilles à problème.</em></p>`,
  },
  {
    id: 'ne-pas-enregistrer',
    titre: '⚠ Demandes à NE PAS enregistrer',
    variante: 'danger',
    contenuHtml: `
      <ul>
        <li>Bactériologie (sauf codes GeneXpert)</li>
        <li>Produits sanguins sans tube → Immunohématologie</li>
      </ul>
      <p><em>Doute requérant → temporaire 02 + bac vert. Attention multiples feuilles.</em></p>`,
  },
];

// --- Onglet Feuilles à transmettre ---

export const reglesTransmission: RegleTransmission[] = [
  { labo: 'HÉMATO', condition: 'Commande produits sanguins', lieu: 'Entrée labo hémato', actionSpeciale: 'Pas de tube → transmettre sans enregistrer' },
  { labo: 'HÉMATO', condition: 'Étiquette He>', lieu: 'Entrée labo hémato', actionSpeciale: 'Copie + originale en hémato' },
  { labo: 'HÉMATO', condition: 'Immunohémato + commande PSL', lieu: 'Entrée labo hémato', actionSpeciale: '⚠ Vérifier signature ! Sinon copie + renvoyer + incident' },
  { labo: 'CHIMIE', condition: 'LCR, micro-tubes, temps prélèv., tests spéciaux', lieu: 'Table du 8100', actionSpeciale: 'Micro-tubes : dans pochette' },
  { labo: 'MM', condition: 'Toujours', lieu: 'Bac sous statif violet', actionSpeciale: '—' },
  { labo: 'IS', condition: 'Toujours', lieu: 'Bac sous statif orange', actionSpeciale: '—' },
  { labo: 'TOXICOLOGIE', condition: 'Étiq. « C Copie> » « Tox ! »', lieu: 'Bac Toxicologie', actionSpeciale: '—' },
  { labo: 'FERTILITÉ', condition: 'Dépistages prénataux 1er+2ème trim.', lieu: 'Bac prénataux', actionSpeciale: 'Copie → bac feuilles à contrôler' },
  { labo: 'GÉNÉTIQUE', condition: 'Toujours', lieu: 'Bac génétique frigo côté 8100', actionSpeciale: 'T° ambiante → panier blanc. Commun → copie' },
];

// --- Onglet Statifs de tri ---

export const statifs: Statif[] = [
  { nom: 'Bleu', emoji: '🔵', destination: 'Non 8100 → table du 8100', couleurFond: '#1E88E5', couleurTexte: '#fff' },
  { nom: 'Violet', emoji: '🟣', destination: 'MM → poste 1 enreg.', couleurFond: '#8E24AA', couleurTexte: '#fff' },
  { nom: 'Orange', emoji: '🟠', destination: 'IS → poste 1 enreg.', couleurFond: '#FB8C00', couleurTexte: '#fff' },
  { nom: 'Rouge', emoji: '🔴', destination: 'Hémato → entrée labo', couleurFond: '#E53935', couleurTexte: '#fff' },
  { nom: 'Jaune', emoji: '🟡', destination: 'Archivage → table poste 1', couleurFond: '#F9A825', couleurTexte: '#333' },
  { nom: 'Gris', emoji: '⚪', destination: 'Envois → frigo côté 8100', couleurFond: '#607D8B', couleurTexte: '#fff' },
];

// --- Onglet Check-in ---

export const reglesCheckin: RegleCheckin[] = [
  { titre: 'Automatique', description: 'Tubes conformes 8100 sans pré-analytique particulière.', icone: '✓' },
  { titre: 'Manuel', description: 'Tous les autres tubes.', icone: '✋' },
  { titre: 'Congelés IS/MM/Tox', description: 'Sortir sagex → congélateur poste envois → étiq. au labo.', icone: '❄' },
  { titre: 'Congelés Chimie/Hémato', description: 'Laisser dans sagex → statif du labo.', icone: '❄' },
];

// --- Onglet Sérothèque ---

export const codesSerotheque: CodeSerotheque[] = [
  { nom: 'Sérum réserve', code: 'SRES' },
  { nom: 'LCR réserve', code: 'LQRES' },
  { nom: 'Tous tubes sérum', code: 'SREST', detail: '(Neuro, Hôp. jour) Étiq. « 1 » + feuille/étiq/tubes → poste 8100.' },
];

// --- Onglet Gestion par labo ---

export const gestionParLabo: GestionLabo[] = [
  {
    labo: 'Chimie',
    icone: '🔬',
    regles: [
      'Conformes → 8100 (sauf: pas centri., pré-analytique spéc., étiq. sec., matériel insuffisant)',
      'Non conformes → statif bleu',
      'Micro-tubes : étiq. « 1 » (ne PAS coller), pochette côté statif bleu, avertir 8100',
      'Thermos → statif bleu + avertir TAB chimie',
      'Pas sur 8100 si : matériel insuffisant, surnageant rougeâtre, gel oblique, étiq. fond noir, non conforme, étiq. secondaire',
      'Tiroirs : Non centri. → « Non-Centrifugés » · Centri. → « Centrifugés » · Faux-fond → « B-lines avec bouchons »',
      'Faux-fond + brun même patient → faux-fond chaîne, brun statif jaune',
    ],
  },
  {
    labo: 'Hématologie',
    icone: '🩸',
    regles: [
      'EDTA sans étiq. sec. + gris foncés → rouleau',
      'Bleu clair, stérile, autres → statif rouge',
    ],
  },
  {
    labo: 'Immuno-sérologie',
    icone: '🧫',
    regles: [
      'Sérum conforme → 8100 si assez matériel',
      'Autres sérum → statif bleu · Autre tube → statif orange',
    ],
  },
  {
    labo: 'MM',
    icone: '🧬',
    regles: [
      'Tous → statif violet',
    ],
  },
  {
    labo: 'Bactério',
    icone: '🦠',
    regles: [
      'Pochette+feuille → bac noir · LCR → tél. (heures ouverture)',
    ],
  },
  {
    labo: 'Génétique',
    icone: '🧪',
    regles: [
      'T° ambiante → panier blanc · Sinon → chambre froide · « Tel gen » → contacter',
    ],
  },
  {
    labo: 'Envois',
    icone: '📦',
    regles: [
      'Selon étiq.: chaîne, frigo, congélateur ou T° ambiante · ANASPB si besoin',
      'WE/nuit : frigo statif gris · Congelés → congélateur envois · T° amb. → bac Centralisation',
    ],
  },
];

// --- Onglet Cas particuliers ---

export const casParticuliers: CasParticulier[] = [
  { titre: 'Cytologie', description: 'Tubes coniques jaunes → codes CXXX (pas FXXX).', icone: '🔬' },
  { titre: 'CHUV neuro-immuno', description: 'Si seul → pochette frigo + message bac feuilles à problème.', icone: '🏥' },
  { titre: 'LAI, LAA, LAM', description: 'Maternité, invalidité, accident, militaire → enregistrer + bac feuilles à problème.', icone: '💰' },
  { titre: 'Accidents professionnels', description: '→ Procédure Wiki', icone: '🚑' },
];
