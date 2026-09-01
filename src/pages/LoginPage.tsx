import { ArrowRight, FlaskConical, ShieldCheck } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { BetaStatus } from '../api/types'
import { useAuth } from '../auth/AuthContext'

export function LoginPage() {
  const { user, signIn, signUp, configurationError } = useAuth()
  const api = useApi()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [betaStatus, setBetaStatus] = useState<BetaStatus | null>(null)
  const [betaStatusError, setBetaStatusError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from ?? '/console'

  useEffect(() => {
    let active = true
    void api.getBetaStatus().then((status) => {
      if (active) setBetaStatus(status)
    }).catch(() => {
      if (active) setBetaStatusError('New account availability is temporarily unavailable. Existing members can still sign in.')
    })
    return () => { active = false }
  }, [api])

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
      } else if (!betaStatus?.enabled || betaStatus.is_full) {
        await api.joinBetaWaitlist(email)
        setNotice('You’re on the beta waitlist. We’ll use this address when space opens.')
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

  const registrationUnavailable = mode === 'sign-up' && (!betaStatus?.enabled || betaStatus.is_full)

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand centered"><span className="brand-mark">T</span><span>TestExchange</span></div>
        <span className="login-icon"><FlaskConical size={26} /></span>
        <h1>{mode === 'sign-in' ? 'Welcome back' : 'Join the exchange'}</h1>
        <p>{mode === 'sign-in' ? 'Sign in to test software, earn credits, and manage your campaigns.' : registrationUnavailable ? 'The current public-beta cohort is full. Join the waitlist and we’ll contact you when space opens.' : 'Create an account to contribute useful testing work and recruit testers of your own.'}</p>
        <div className="tabs login-tabs" role="tablist">
          <button type="button" className={mode === 'sign-in' ? 'active' : ''} onClick={() => setMode('sign-in')}>Sign in</button>
          <button type="button" className={mode === 'sign-up' ? 'active' : ''} onClick={() => setMode('sign-up')}>Create account</button>
        </div>
        <form className="login-form" onSubmit={submit}>
          {mode === 'sign-up' && !registrationUnavailable && <label><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} minLength={1} maxLength={100} required /></label>}
          <label><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          {!registrationUnavailable && <label><span>Password</span><input type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required /></label>}
          {((configurationError && !registrationUnavailable) || error || (mode === 'sign-up' && betaStatusError)) && <div className="form-error">{(configurationError && !registrationUnavailable ? configurationError : null) || error || betaStatusError}</div>}
          {notice && <div className="inline-success">{notice}</div>}
          <button className="button button-dark button-full" disabled={submitting || (Boolean(configurationError) && !registrationUnavailable) || (mode === 'sign-up' && !betaStatus && !betaStatusError)}>{submitting ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : registrationUnavailable ? 'Join waitlist' : 'Create account'} <ArrowRight size={17} /></button>
        </form>
        <div className="login-note"><ShieldCheck size={16} /><span>Authentication is handled by Supabase. TestExchange never receives your password.</span></div>
      </section>
    </main>
  )
}
