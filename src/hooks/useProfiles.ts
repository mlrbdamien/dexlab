import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ProfileRow {
  id: string
  display_name: string
}

// Charge la table profiles → table de correspondance { uuid: nom affiché }.
// Utilisée pour afficher « modifié par X » et l'historique.
export function useProfiles() {
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const seqRef = useRef(0)

  useEffect(() => {
    if (!supabase) return
    const seq = ++seqRef.current
    void supabase
      .from('profiles')
      .select('id, display_name')
      .then(({ data, error }) => {
        if (seq !== seqRef.current || error || !data) return
        const map: Record<string, string> = {}
        for (const p of data as ProfileRow[]) {
          if (p.display_name) map[p.id] = p.display_name
        }
        setProfiles(map)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- invalidation intentionnelle du jeton de séquence au démontage
    return () => { seqRef.current++ }
  }, [])

  return profiles
}
