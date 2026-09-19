import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { requestPasswordReset, updatePassword } from '../auth/passwordRecovery'

export function PasswordRecoveryPage({ updating = false }: { updating?: boolean }) {
  const { user, isLoading, configurationError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [complete, setComplete] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setError(null)
    setNotice(null)
    if (updating && password !== confirmation) {
      setError('The passwords do not match.')
      return
    }
    setBusy(true)
    try {
      if (updating) {
        await updatePassword(password)
        setPassword('')
        setConfirmation('')
        setComplete(true)
        setNotice('Your password has been updated.')
      } else {
        await requestPasswordReset(email)
        setNotice('If an account exists for this email, you’ll receive a password reset link. Check your inbox and spam folder.')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reset your password. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="login-page"><section className="login-card">
    <div className="brand centered"><span className="brand-mark">T</span><span>TestExchange</span></div>
    <h1>{updating ? 'Choose a new password' : 'Reset your password'}</h1>
    {isLoading ? <p>Checking your reset link…</p> : updating && !user ? <p>This link is invalid or has expired. <Link to="/forgot-password">Request a new reset link</Link>.</p> : !complete && <form className="login-form" onSubmit={submit}>
      {updating ? <>
        <label><span>New password</span><input type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <label><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></label>
      </> : <label><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>}
      <button className="button button-dark button-full" disabled={busy || Boolean(configurationError)}>{busy ? 'Please wait…' : updating ? 'Save new password' : 'Send reset link'}</button>
    </form>}
    {(error || configurationError) && <div className="form-error" role="alert">{error || configurationError}</div>}
    {notice && <div className="inline-success" role="status">{notice}</div>}
    <p><Link to={complete ? '/console' : '/login'}>{complete ? 'Continue to your account' : 'Back to sign in'}</Link></p>
  </section></main>
}
