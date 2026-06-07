import {
  ClipboardList, FileText, LayoutGrid, Tag,
  CheckCircle, Snowflake, Building2, AlertTriangle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Tube } from '@/lib/types'

// --- Navigation des procédures ---

export interface ProcNav { id: string; label: string; icon: LucideIcon }

export const procedures: ProcNav[] = [
  { id: 'enregistrement', label: 'Enregistrement',          icon: ClipboardList },
  { id: 'feuilles',       label: 'Feuilles à transmettre',  icon: FileText },
  { id: 'statifs',        label: 'Statifs de tri',          icon: LayoutGrid },
  { id: 'etiquettes',     label: 'Étiquettes',              icon: Tag },
  { id: 'checkin',        label: 'Check-in',                icon: CheckCircle },
  { id: 'serotheque',     label: 'Sérothèque',              icon: Snowflake },
  { id: 'gestion',        label: 'Gestion par labo',        icon: Building2 },
  { id: 'cas',            label: 'Cas particuliers',        icon: AlertTriangle },
]

// --- Contexte de mise en page (Outlet) ---

export type Section = string

export interface LayoutCtx {
  section: Section
  setSection: (s: Section) => void
  query: string
  setQuery: (q: string) => void
  filteredTubes: Tube[]
}
