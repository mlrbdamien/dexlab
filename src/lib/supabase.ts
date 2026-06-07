import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Variables d'environnement (cf. .env.local en dev, secrets GitHub Actions en prod) :
//   VITE_SUPABASE_URL       = https://<ref>.supabase.co
//   VITE_SUPABASE_ANON_KEY  = clé "anon public" (jamais la service_role)
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

// Client null tant que non configuré (évite tout crash au chargement).
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
