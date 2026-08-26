import { CheckCircle2, MonitorCog } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'

export function ProfilePage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="ACCOUNT" title="Profile" description="Keep your testing environments accurate so you receive relevant software testing tasks." />
      <form className="profile-layout" onSubmit={saveProfile}>
        <section className="panel form-panel">
          <div className="form-section-heading"><div><span className="avatar large-avatar">JD</span><div><h2>{user?.name}</h2><p>Member since August 2026</p></div></div><span className="verified-label"><CheckCircle2 size={15} /> Email verified</span></div>
          <div className="form-grid">
            <label><span>Display name</span><input defaultValue={user?.name} /></label>
            <label><span>Email address</span><input type="email" defaultValue={user?.email} /></label>
            <label><span>Developer or studio name</span><input defaultValue="Independent developer" /></label>
            <label><span>Country</span><select defaultValue="United States"><option>United States</option><option>Canada</option><option>United Kingdom</option><option>Australia</option></select></label>
          </div>
          <div className="form-actions">{saved && <span className="save-confirmation"><CheckCircle2 size={16} /> Saved</span>}<button className="button button-dark" type="submit">Save changes</button></div>
        </section>
        <aside className="profile-side">
          <section className="panel device-panel">
            <div className="form-section-heading"><div><span className="round-icon"><MonitorCog size={18} /></span><div><h2>Primary testing environment</h2><p>Used to match compatible tests</p></div></div></div>
            <label><span>Platform</span><select defaultValue="Android"><option>Android</option><option>iOS</option><option>Web</option><option>Desktop</option><option>API</option></select></label>
            <label><span>Environment details</span><input defaultValue="Google Pixel 8 · Android 16" /></label>
          </section>
          <section className="panel preference-panel">
            <h2>Notifications</h2>
            <label className="toggle-row"><span><strong>New test matches</strong><small>Projects that match your environments</small></span><input type="checkbox" defaultChecked /><i /></label>
            <label className="toggle-row"><span><strong>Campaign updates</strong><small>Tester joins and new feedback</small></span><input type="checkbox" defaultChecked /><i /></label>
          </section>
        </aside>
      </form>
    </div>
  )
}
