import { StrictMode } from 'react'
import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AccountProvider } from './account/AccountContext'
import { ApiProvider } from './api/ApiContext'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { initializeMonitoring } from './monitoring'
import './styles.css'

initializeMonitoring()

function SessionProviders() {
  const { user } = useAuth()
  // Drop private page/account state and pending autosaves when the identity changes.
  return <ApiProvider key={user?.id ?? 'anonymous'}><AccountProvider><App /></AccountProvider></ApiProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<main className="app-loading"><div><strong>TestExchange hit an unexpected error.</strong><p>Reload the page. If it continues, contact support.</p></div></main>}>
      <BrowserRouter>
        <AuthProvider>
          <SessionProviders />
        </AuthProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
