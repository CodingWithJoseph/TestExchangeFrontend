import { StrictMode } from 'react'
import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { AccountProvider } from './account/AccountContext'
import { ApiProvider } from './api/ApiContext'
import { AuthProvider } from './auth/AuthContext'
import { initializeMonitoring } from './monitoring'
import './styles.css'

initializeMonitoring()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<main className="app-loading"><div><strong>TestExchange hit an unexpected error.</strong><p>Reload the page. If it continues, contact support.</p></div></main>}>
      <BrowserRouter>
        <AuthProvider>
          <ApiProvider>
            <AccountProvider>
              <App />
            </AccountProvider>
          </ApiProvider>
        </AuthProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
