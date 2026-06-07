// ============================================================
// Types métier — Dexlab
// Source de vérité : _reference/index.html (PR-6387 v4 + FP-7679 v3)
// ============================================================

// --- Tubes ---

export type CentrifugationStatus =
  | 'oui'          // Peut être centrifugé
  | 'obligatoire'  // Obligatoirement centrifugé
  | 'non'          // Ne peut pas être centrifugé
  | 'variable'     // Selon destination et volume
  | 'na';          // Non applicable (urines, selles, etc.)

export type DestinationCategorie =
  | '8100'
  | 'bleu'
  | 'hemato'
  | 'mm'
  | 'envoi'
  | 'is'
  | 'chimie'
  | 'bacterio'
  | 'genetique';

export interface Destination {
  label: string;
  detail: string;
  categorie: DestinationCategorie;
}

export type TubeCategorie = 'sang' | 'autres';

export interface Tube {
  id: string;
  nom: string;
  sousTitre: string;
  etiquette: string;
  couleur: string;          // hex — fond de la carte
  couleurTexte: string;     // hex — texte sur la carte
  categorie: TubeCategorie;
  centrifugation: CentrifugationStatus;
  centrifugationDetail: string;
  destinations: Destination[];
  codeExces: string;        // code tube excédentaire (ex. S-SUP)
  codeSansAnalyse: string;  // code tube sans analyse (ex. S-TUB)
  codeReserve: string;      // code réserve (ex. SRES)
  notes: string[];
  alertes: string[];
  casParticuliers: string[];
  motsCles: string;         // chaîne plate pour recherche fuzzy
}

// --- Statifs de tri ---

export interface Statif {
  nom: string;
  emoji: string;
  destination: string;
  couleurFond: string;
  couleurTexte: string;
}

// --- Feuilles à transmettre ---

export interface RegleTransmission {
  labo: string;
  condition: string;
  lieu: string;
  actionSpeciale: string;
}

// --- Étiquettes ---

export interface EtiquetteDescription {
  titre: string;
  description: string;
}

export interface EtiquetteFormat {
  titre: string;
  description: string;
  icone: string;
}

export interface EtiquetteReimpression {
  etiquette: string;
  numero: string;
}

export interface RegleCollage {
  titre: string;
  description: string;
  icone: string;
}

// --- Protocoles d'enregistrement ---

export type ProtocoleVariante = 'default' | 'danger';

export interface EtapeProtocole {
  id: string;
  titre: string;
  variante: ProtocoleVariante;
  contenuHtml: string;       // HTML brut — rendu tel quel
}

// --- Check-in ---

export interface RegleCheckin {
  titre: string;
  description: string;
  icone: string;
}

// --- Sérothèque ---

export interface CodeSerotheque {
  nom: string;
  code: string;
  detail?: string;
}

// --- Gestion par labo ---

export interface GestionLabo {
  labo: string;
  icone: string;
  regles: string[];
}

// --- Cas particuliers ---

export interface CasParticulier {
  titre: string;
  description: string;
  icone: string;
}

// --- Ticker (bandeau de rappels) ---

export type ChecklistItem = string;
