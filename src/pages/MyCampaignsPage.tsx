import { ArrowRight, CheckCircle2, Plus, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Assignment, Campaign } from '../api/types'
import { PageHeader } from '../components/PageHeader'
import { loadCampaignDrafts } from '../features/campaigns/campaignDraft'

export function MyCampaignsPage() {
  const api = useApi()
  const location = useLocation()
  const createdCampaign = (location.state as { createdCampaign?: string } | null)?.createdCampaign
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const storedDrafts = loadCampaignDrafts()

  useEffect(() => {
    let active = true
    void Promise.all([api.listOwnedCampaigns(), api.listAssignments()])
      .then(([campaignItems, assignmentItems]) => { if (active) { setCampaigns(campaignItems); setAssignments(assignmentItems) } })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load campaigns.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [api])

  return (
    <div className="page-stack">
      <PageHeader eyebrow="DEVELOPER WORKSPACE" title="My campaigns" description="Recruit committed testers, collect feedback, and keep every software test on track." action={<Link className="button button-dark" to="/console/my-campaigns/new"><Plus size={17} /> New campaign</Link>} />
      {createdCampaign && <div className="campaign-created-banner"><CheckCircle2 size={18} /><div><strong>{createdCampaign} is live.</strong><p>Its contract is locked and the publishing credits have been spent.</p></div></div>}
      {error && <div className="form-error">{error}</div>}
      {isLoading ? <div className="empty-state"><p>Loading campaigns…</p></div> : <div className="campaigns-grid">
        {storedDrafts.map((draft) => <article className="campaign-card" key={draft.id}>
          <div className="campaign-card-head"><span className="app-icon mint">{(draft.projectName || 'DR').slice(0, 2).toUpperCase()}</span><span className="status-pill draft">Draft</span></div>
          <h2>{draft.projectName || 'Untitled campaign'}</h2><p>{draft.platform} · browser draft</p>
          <div className="campaign-details"><span><small>TESTER GOAL</small><strong>{draft.testerGoal}</strong></span><span><small>PUBLISHING COST</small><strong>{draft.testerGoal * draft.creditsPerTester}</strong></span></div>
          <Link className="button button-outline button-full" to={`/console/my-campaigns/new?draft=${draft.id}`}>Finish setup <ArrowRight size={16} /></Link>
        </article>)}
        {campaigns.map((campaign) => {
          const campaignAssignments = assignments.filter((assignment) => assignment.campaign_id === campaign.id)
          const accepted = campaignAssignments.filter((assignment) => !['applied', 'cancelled', 'rejected'].includes(assignment.status)).length
          const percent = Math.min(100, Math.round((accepted / campaign.target_testers) * 100))
          return <article className="campaign-card" key={campaign.id}>
            <div className="campaign-card-head"><span className="app-icon mint">{campaign.name.slice(0, 2).toUpperCase()}</span><span className={`status-pill ${campaign.status}`}>{campaign.status}</span></div>
            <h2>{campaign.name}</h2><p>{campaign.platform} · {campaign.category}</p>
            <div className="campaign-progress-label"><span><Users size={16} /> <strong>{accepted}</strong> of {campaign.target_testers} testers</span><strong>{percent}%</strong></div>
            <div className="progress-track large"><span style={{ width: `${percent}%` }} /></div>
            <div className="campaign-details"><span><small>APPLICATIONS</small><strong>{campaignAssignments.length}</strong></span><span><small>CREDITS SPENT</small><strong>{campaign.target_testers * campaign.reward_credits}</strong></span></div>
            <Link className="button button-outline button-full" to={`/console/my-campaigns/${campaign.id}`}>Manage campaign <ArrowRight size={16} /></Link>
          </article>
        })}
        <article className="campaign-card new-campaign"><span className="new-campaign-icon"><Plus size={24} /></span><h2>Start a testing campaign</h2><p>Define a real test brief and recruit the testers your software project needs.</p><Link className="text-button" to="/console/my-campaigns/new">Create campaign <ArrowRight size={15} /></Link></article>
      </div>}
      <aside className="info-banner"><span className="info-icon">i</span><div><strong>Publishing permanently spends the full campaign cost.</strong><p>Pausing or closing never returns credits. Approved testers receive the promised reward without charging you again.</p></div><Link to="/console/available-tests">Earn more credits <ArrowRight size={15} /></Link></aside>
    </div>
  )
}
