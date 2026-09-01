import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import { useAuth } from '../auth/AuthContext'
import { useAccount } from './AccountContext'

export function RequireAccount() {
  const { profile, isLoading, error, refreshAccount } = useAccount()
  const { user, signOut } = useAuth()
  const api = useApi()
  const [notice, setNotice] = useState<string | null>(null)
  if (isLoading) return <div className="app-loading">Preparing your TestExchange account…</div>
  if (error) return <div className="app-loading"><div><strong>Account setup failed</strong><p>{error}</p>{notice && <p>{notice}</p>}<div className="form-actions"><button className="button button-dark" onClick={() => void refreshAccount()}>Try again</button>{error.toLowerCase().includes('waitlist') && user?.email && <button className="button button-outline" onClick={() => void api.joinBetaWaitlist(user.email).then(() => setNotice('You’re on the beta waitlist.')).catch((requestError) => setNotice(requestError instanceof Error ? requestError.message : 'Unable to join the waitlist.'))}>Join waitlist</button>}<button className="button button-outline" onClick={() => void signOut()}>Sign out</button></div></div></div>
  if (!profile) return <div className="app-loading">Preparing your TestExchange account…</div>
  return <Outlet />
}
