import type {
  EtiquetteDescription,
  EtiquetteFormat,
  EtiquetteReimpression,
  RegleCollage,
} from '../lib/types';

// ============================================================
// Étiquettes — FP-7679 v3, extrait de _reference/index.html
// ============================================================

// --- Description des étiquettes ---

export const etiquettesDescription: EtiquetteDescription[] = [
  { titre: 'Chiffre → Tube primaire', description: 'Les tubes mères sont étiquetés avec des étiquettes commençant par un chiffre (1, 4, 5, 6, 7, 8…)' },
  { titre: 'Lettre → Tube secondaire', description: 'Indique le labo destinataire : H Hémato · C Chimie · IS Immuno · MM MM · G Génétique' },
  { titre: 'Avec > → Ne pas décanter', description: 'Transférer l\'étiquette à l\'unité concernée .' },
  { titre: 'Avec ! → Avertir', description: 'Avertir le laboratoire concerné oralement ou par téléphone immédiatement.' },
  { titre: 'Transferts par labo', description: 'C XXX> Chimie · H XXX> Hémato · IS XXX> IS · MM XXX> MM · G XXX> Génétique' },
  { titre: 'LSITE', description: 'Site exécutant des analyses liées à cette étiquette.' },
  { titre: 'Infos diverses', description: 'Au fond à gauche : textes d\'info (LCR, Pas_8100, etc.)' },
];

// --- Format visuel ---

export const etiquettesFormat: EtiquetteFormat[] = [
  { titre: 'À centrifuger', description: 'Format standard, chiffres sur fond blanc.', icone: '✅' },
  { titre: 'Ne pas centrifuger', description: 'N° d\'étiquette sur fond noir.', icone: '⛔' },
  { titre: 'Centrifuger à froid', description: '*** visible sur l\'étiquette.', icone: '❄' },
  { titre: 'Abri de la lumière', description: 'Identité sur fond noir.', icone: '🌑' },
  { titre: 'Ne pas centri. + Abri lumière', description: 'Identité + N° d\'étiquette sur fond noir.', icone: '🌑⛔' },
  { titre: 'Décantage', description: 'Étiquette spécifique de décantage.', icone: '🔄' },
  { titre: 'Envois', description: 'Étiquette spécifique pour les envois externes.', icone: '📦' },
  { titre: 'Information', description: 'Étiquette d\'information (ex : FORMULAIRE/COPIE).', icone: 'ℹ️' },
];

// --- Ré-impression (écran 105 DGLab) ---

export const etiquettesReimpression: EtiquetteReimpression[] = [
  { etiquette: '1', numero: '101' },
  { etiquette: '1\'', numero: '115' },
  { etiquette: '2', numero: '102' },
  { etiquette: '5', numero: '150' },
  { etiquette: '6 non centri', numero: '161' },
  { etiquette: '6 centri', numero: '160' },
  { etiquette: 'SERO 9', numero: '909' },
  { etiquette: 'IS AUT', numero: '901' },
  { etiquette: 'IS PRUN', numero: '902' },
  { etiquette: 'IS IF', numero: '903' },
  { etiquette: 'M-AER', numero: '951' },
  { etiquette: 'M-ANA', numero: '952' },
];

// --- Règles de collage & vérifications ---

export const reglesCollage: RegleCollage[] = [
  { titre: 'Positionnement', description: 'Coller en laissant visibles le nom et prénom inscrits sur le tube. Tubes bleu clair → laisser une fenêtre visible.', icone: '📌' },
  { titre: 'Feuille lecteur optique', description: 'Coller une étiquette ✱ sur la demande (verticalement en haut à gauche).', icone: '✱' },
  { titre: 'Échantillon manquant', description: 'Prévenir immédiatement le requérant → imprimer l\'étiquette du tube manquant, inscrire « ∅ » → transmettre au labo concerné.', icone: '∅' },
  { titre: 'Confidentialité', description: 'Étiquettes surnuméraires + ruban encreur → poubelles jaunes.', icone: '🗑' },
  { titre: 'Vérifications', description: 'Concordance nom, prénom et NLab entre étiquettes, feuille et tube. Vérifier le remplissage. Viser la feuille de demande.', icone: '✓' },
];

export const reimpressionNote = 'Cocher « Seul. suppl. » et saisir le N° dans le champ « Supplémentaires ».';
