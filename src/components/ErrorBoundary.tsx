import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur de rendu capturée par ErrorBoundary :', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center text-ink">
          <p className="text-base font-semibold">Une erreur est survenue</p>
          <p className="max-w-sm text-[0.82rem] text-ink-3">
            L'application a rencontré un problème inattendu. Recharge la page pour réessayer.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-accent px-4 py-2 text-[0.82rem] font-medium text-white"
          >
            Recharger
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
