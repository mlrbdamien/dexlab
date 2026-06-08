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
  // Traçabilité (renseignés par la base ; jamais envoyés en écriture)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

// Champs éditables (création / mise à jour) — sans id, position ni traçabilité.
export type MaterielInput = Omit<
  Materiel,
  'id' | 'position' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

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
  // Traçabilité (renseignés par la base ; jamais envoyés en écriture)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export type DocInput = Omit<
  DocItem,
  'id' | 'position' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

// --- Liaison Matériel ↔ Document (références croisées) ---

export interface MaterielDocumentLink {
  materiel_id: string;
  document_id: string;
}

// --- Médias (images / pièces jointes) ---
// Rattaché à UN matériel OU UN document (jamais les deux).

export interface MediaItem {
  id: string;
  materielId: string | null;
  documentId: string | null;
  path: string;             // chemin de l'objet dans le bucket privé « media »
  caption: string;
  position: number;
  createdAt?: string;
}

// MediaItem enrichi d'une URL signée (éphémère) pour l'affichage.
export interface MediaWithUrl extends MediaItem {
  url: string;
}
