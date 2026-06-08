import type { Materiel, DocItem, DocType, MaterielDocumentLink } from '@/lib/types'

// --- Contexte de mise en page (Outlet) ---

export type Section = string

export interface LayoutCtx {
  section: Section
  setSection: (s: Section) => void
  query: string
  setQuery: (q: string) => void
  materiel: Materiel[]
  filteredMateriel: Materiel[]
  documents: DocItem[]
  loading: boolean
  documentsLoading: boolean
  materielError: string | null
  refetchMateriel: () => void
  onNewMateriel: () => void
  onEditMateriel: (m: Materiel) => void
  onDeleteMateriel: (m: Materiel) => Promise<void>
  documentsError: string | null
  refetchDocuments: () => void
  onNewDocument: (type: DocType) => void
  onEditDocument: (d: DocItem) => void
  onDeleteDocument: (d: DocItem) => Promise<void>
  links: MaterielDocumentLink[]
  onEditMaterielLinks: (m: Materiel) => void
  onEditDocLinks: (d: DocItem) => void
}
