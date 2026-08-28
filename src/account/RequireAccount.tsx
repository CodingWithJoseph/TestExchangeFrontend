import { Outlet } from 'react-router-dom'
import { useAccount } from './AccountContext'

export function RequireAccount() {
  const { profile, isLoading, error, refreshAccount } = useAccount()
  if (isLoading) return <div className="app-loading">Preparing your TestExchange account…</div>
  if (error) return <div className="app-loading"><div><strong>Account setup failed</strong><p>{error}</p><button className="button button-dark" onClick={() => void refreshAccount()}>Try again</button></div></div>
  if (!profile) return <div className="app-loading">Preparing your TestExchange account…</div>
  return <Outlet />
}
