import { ArrowRight, FlaskConical, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { user, signIn, signUp, configurationError } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from ?? '/console'

  if (user) return <Navigate to={destination} replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setNotice(null)
    try {
      if (mode === 'sign-in') {
        await signIn(email, password)
        navigate(destination, { replace: true })
      } else {
        const signedIn = await signUp(email, password, displayName)
        if (signedIn) navigate(destination, { replace: true })
        else setNotice('Check your email to confirm your account, then sign in.')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand centered"><span className="brand-mark">T</span><span>TestExchange</span></div>
        <span className="login-icon"><FlaskConical size={26} /></span>
        <h1>{mode === 'sign-in' ? 'Welcome back' : 'Join the exchange'}</h1>
        <p>{mode === 'sign-in' ? 'Sign in to test software, earn credits, and manage your campaigns.' : 'Create an account to contribute useful testing work and recruit testers of your own.'}</p>
        <div className="tabs login-tabs" role="tablist">
          <button type="button" className={mode === 'sign-in' ? 'active' : ''} onClick={() => setMode('sign-in')}>Sign in</button>
          <button type="button" className={mode === 'sign-up' ? 'active' : ''} onClick={() => setMode('sign-up')}>Create account</button>
        </div>
        <form className="login-form" onSubmit={submit}>
          {mode === 'sign-up' && <label><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={1} maxLength={100} required /></label>}
          <label><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label><span>Password</span><input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></label>
          {(configurationError || error) && <div className="form-error">{configurationError || error}</div>}
          {notice && <div className="inline-success">{notice}</div>}
          <button className="button button-dark button-full" disabled={submitting || Boolean(configurationError)}>{submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button>
        </form>
        <div className="login-note"><ShieldCheck size={16} /><span>Authentication is handled by Supabase. TestExchange never receives your password.</span></div>
      </section>
    </main>
  )
}
