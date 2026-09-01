import { CheckCircle2, UserRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'

export function ProfilePage() {
  const api = useApi()
  const { user } = useAuth()
  const { profile, refreshAccount } = useAccount()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setUsername(profile.username)
    setDisplayName(profile.display_name)
    setBio(profile.bio || '')
    setAvatarUrl(profile.avatar_url || '')
  }, [profile])

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await api.saveProfile({
        username: username.trim(),
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      await refreshAccount()
      setSaved(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="ACCOUNT" title="Profile" description="Choose how you appear in the public-beta testing community." />
      <form className="profile-layout" onSubmit={(event) => void saveProfile(event)}>
        <section className="panel form-panel">
          <div className="form-section-heading"><div><span className="avatar large-avatar">{displayName.slice(0, 2).toUpperCase() || 'TE'}</span><div><h2>{displayName || 'TestExchange member'}</h2><p>Member since {profile ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'}</p></div></div><span className="verified-label"><CheckCircle2 size={15} /> Authenticated account</span></div>
          <div className="form-grid">
            <label><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required maxLength={100} /></label>
            <label><span>Username</span><input value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={40} pattern="[A-Za-z0-9_-]+" /></label>
            <label className="field-full"><span>Email address</span><input type="email" value={user?.email || ''} readOnly /><small>Email is managed by Supabase Auth.</small></label>
            <label className="field-full"><span>Bio</span><textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={500} placeholder="What kinds of software do you build or test?" /></label>
            <label className="field-full"><span>Avatar URL <i>Optional</i></span><input type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://…" /></label>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">{saved && <span className="save-confirmation"><CheckCircle2 size={16} /> Saved</span>}<button className="button button-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
        </section>
        <aside className="profile-side">
          <section className="panel device-panel">
            <div className="form-section-heading"><div><span className="round-icon"><UserRound size={18} /></span><div><h2>Private account details</h2><p>Only your public profile fields are editable here.</p></div></div></div>
            <p className="muted">Your display name, username, bio, and avatar can appear publicly. Your email, private contracts, evidence, and conversations are not shown on your public profile.</p>
          </section>
          <section className="panel device-panel">
            <div className="form-section-heading"><div><span className="round-icon"><UserRound size={18} /></span><div><h2>Data and account requests</h2><p>Export, correction, or deletion</p></div></div></div>
            <p className="muted">During the beta, verified account and privacy requests are handled manually so campaign, credit, dispute, and audit obligations can be reviewed safely.</p>
            <div className="inline-actions"><Link className="button button-outline" to="/privacy">Privacy notice</Link><Link className="button button-dark" to="/support">Contact support</Link></div>
          </section>
        </aside>
      </form>
    </div>
  )
}
