import { ArrowRight, Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { campaigns } from '../data/mockData'

export function MyCampaignsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="DEVELOPER WORKSPACE"
        title="My campaigns"
        description="Recruit committed testers, collect feedback, and keep each closed test on track."
        action={<button className="button button-dark"><Plus size={17} /> New campaign</button>}
      />
      <div className="campaigns-grid">
        {campaigns.map((campaign) => {
          const percent = Math.round((campaign.testers / campaign.goal) * 100)
          return (
            <article className="campaign-card" key={campaign.id}>
              <div className="campaign-card-head">
                <span className="app-icon mint">{campaign.name.slice(0, 2).toUpperCase()}</span>
                <span className={`status-pill ${campaign.status.toLowerCase()}`}>{campaign.status}</span>
              </div>
              <h2>{campaign.name}</h2>
              <p>{campaign.platform}</p>
              <div className="campaign-progress-label"><span><Users size={16} /> <strong>{campaign.testers}</strong> of {campaign.goal} testers</span><strong>{percent}%</strong></div>
              <div className="progress-track large"><span style={{ width: `${percent}%` }} /></div>
              <div className="campaign-details">
                <span><small>TIME REMAINING</small><strong>{campaign.daysLeft} days</strong></span>
                <span><small>CREDITS SPENT</small><strong>{campaign.spent}</strong></span>
              </div>
              <button className="button button-outline button-full">{campaign.status === 'Draft' ? 'Finish setup' : 'Manage campaign'} <ArrowRight size={16} /></button>
            </article>
          )
        })}
        <article className="campaign-card new-campaign">
          <span className="new-campaign-icon"><Plus size={24} /></span>
          <h2>Start a testing campaign</h2>
          <p>Define a real test brief and recruit the testers your Android app needs.</p>
          <button className="text-button">Create campaign <ArrowRight size={15} /></button>
        </article>
      </div>
      <aside className="info-banner">
        <span className="info-icon">i</span>
        <div><strong>Credits are only spent when a tester joins.</strong><p>Clear testing briefs earn better feedback and help testers complete the work successfully.</p></div>
        <Link to="/console/available-tests">Earn more credits <ArrowRight size={15} /></Link>
      </aside>
    </div>
  )
}
