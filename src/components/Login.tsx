import { useState } from 'react'
import { Droplets } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) { setError('Configuration Supabase manquante.'); return }
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError('Identifiants invalides.')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-line bg-canvas-2/40 p-8 shadow-xl backdrop-blur-xl animate-[pop-in_150ms_ease-out]"
      >
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
            <Droplets aria-hidden="true" className="h-4 w-4 text-white" strokeWidth={1.75} />
          </div>
          <span className="text-lg font-semibold tracking-tight">Dexlab</span>
        </div>

        <h1 className="text-[0.95rem] font-semibold">Connexion</h1>
        <p className="mt-0.5 mb-5 text-[0.8rem] text-ink-3">Accès réservé au personnel.</p>

        <label htmlFor="email" className="mb-1 block text-[0.72rem] font-medium text-ink-2">E-mail</label>
        <input
          id="email" type="email" autoComplete="email" required value={email}
          onChange={e => setEmail(e.target.value)}
          className="mb-3 h-11 w-full rounded-xl border border-line bg-canvas px-3 text-[0.85rem] outline-none transition duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        <label htmlFor="password" className="mb-1 block text-[0.72rem] font-medium text-ink-2">Mot de passe</label>
        <input
          id="password" type="password" autoComplete="current-password" required value={password}
          onChange={e => setPassword(e.target.value)}
          className="h-11 w-full rounded-xl border border-line bg-canvas px-3 text-[0.85rem] outline-none transition duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        {error && <p className="mt-3 text-[0.78rem] text-red">{error}</p>}
        {!isSupabaseConfigured && (
          <p className="mt-3 text-[0.78rem] text-org">⚠ Supabase non configuré (variables d'env manquantes).</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 h-11 w-full rounded-xl bg-accent text-[0.85rem] font-medium text-white transition duration-150 hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
