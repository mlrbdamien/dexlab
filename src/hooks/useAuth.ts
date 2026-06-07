import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  // Si Supabase n'est pas configuré, rien à charger.
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return
    // onAuthStateChange émet INITIAL_SESSION au montage (session courante ou null),
    // puis à chaque changement → setState uniquement dans ce callback d'abonnement.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return { session, loading }
}
