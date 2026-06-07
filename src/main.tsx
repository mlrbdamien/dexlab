import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Lumen theme: light par défaut
try {
  const saved = localStorage.getItem('lumen-theme')
  document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : 'light')
} catch {
  document.documentElement.setAttribute('data-theme', 'light')
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
