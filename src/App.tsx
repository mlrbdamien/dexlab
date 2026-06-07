import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Login } from '@/components/Login'
import { useAuth } from '@/hooks/useAuth'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-[0.85rem] text-ink-3">
        Chargement…
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
