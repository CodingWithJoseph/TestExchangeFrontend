import { ArrowRight, FlaskConical, ShieldCheck } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { user, signInDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from ?? '/console'

  if (user) return <Navigate to="/console" replace />

  const handleSignIn = () => {
    signInDemo()
    navigate(destination, { replace: true })
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand centered"><span className="brand-mark">T</span><span>TestExchange</span></div>
        <span className="login-icon"><FlaskConical size={26} /></span>
        <h1>Welcome back</h1>
        <p>Sign in to test apps, earn credits, and manage your testing campaigns.</p>
        <button className="button button-dark button-full" onClick={handleSignIn}>Continue to demo console <ArrowRight size={17} /></button>
        <div className="login-note"><ShieldCheck size={16} /><span>Demo authentication is active. Supabase Auth will connect here next.</span></div>
      </section>
    </main>
  )
}
