import {
  FileText, ClipboardList, ClipboardCheck, FileCheck,
  Beaker, FlaskConical, TestTube, Microscope, Droplet, Droplets,
  Syringe, Dna, Pill, Stethoscope, HeartPulse, Activity,
  Thermometer, Snowflake, Truck, Package, AlertTriangle, ShieldAlert,
  Clock, Biohazard,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Bibliothèque d'icônes (lucide) proposées pour les procédures.
export const DOC_ICONS: Record<string, LucideIcon> = {
  FileText, ClipboardList, ClipboardCheck, FileCheck,
  Beaker, FlaskConical, TestTube, Microscope, Droplet, Droplets,
  Syringe, Dna, Pill, Stethoscope, HeartPulse, Activity,
  Thermometer, Snowflake, Truck, Package, AlertTriangle, ShieldAlert,
  Clock, Biohazard,
}

export const DOC_ICON_NAMES = Object.keys(DOC_ICONS)
export const DEFAULT_DOC_ICON = 'FileText'

// Nom d'icône → composant lucide (repli sur FileText).
export function docIcon(name?: string | null): LucideIcon {
  return (name && DOC_ICONS[name]) || FileText
}
