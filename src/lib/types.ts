// ============================================================
// Types métier — Dexlab
// ============================================================

// --- Matériel ---

export type CentrifugationStatus =
  | 'oui'          // Peut être centrifugé
  | 'obligatoire'  // Obligatoirement centrifugé
  | 'non'          // Ne peut pas être centrifugé
  | 'variable'     // Selon destination et volume
  | 'na';          // Non applicable (urines, selles, etc.)

export interface MaterielDestination {
  label: string;
  detail: string;
}

export interface Materiel {
  id: string;
  type: string;             // 'tube' | 'consommable' | 'contenant' | …
  nom: string;
  sousTitre: string;
  etiquette: string;
  couleur: string;          // hex — pastille
  centrifugation: CentrifugationStatus;
  centrifugationDetail: string;
  codeExces: string;
  codeSansAnalyse: string;
  codeReserve: string;
  destinations: MaterielDestination[];
  notes: string[];
  alertes: string[];
  casParticuliers: string[];
  position: number;
}

// Champs éditables (création / mise à jour) — sans id ni position.
export type MaterielInput = Omit<Materiel, 'id' | 'position'>;

// --- Documents (notes / mémos / procédures) ---

export type DocType = 'note' | 'memo' | 'procedure';

export interface DocItem {
  id: string;
  type: DocType;
  titre: string;
  contenu: string;          // markdown
  tags: string[];
  epingle: boolean;
  position: number;
}

export type DocInput = Omit<DocItem, 'id' | 'position'>;

// --- Liaison Matériel ↔ Document (références croisées) ---

export interface MaterielDocumentLink {
  materiel_id: string;
  document_id: string;
}
