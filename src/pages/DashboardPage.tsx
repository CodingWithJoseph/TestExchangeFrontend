import { ArrowRight, BadgeDollarSign, CircleCheckBig, FlaskConical, Rocket, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import type { Assignment, Campaign, CreditLedgerEntry } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { platformLabel } from '../features/community/campaignPresentation'

export function DashboardPage() {
  const api = useApi()
  const { user } = useAuth()
  const { profile, balance } = useAccount()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [available, setAvailable] = useState<Campaign[]>([])
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([api.listOwnedCampaigns(), api.listAssignments(), api.listPublicCampaigns(), api.getCreditLedger()])
      .then(([owned, assignmentItems, publicCampaigns, entries]) => {
        if (!active) return
        setCampaigns(owned)
        setAssignments(assignmentItems)
        setAvailable(publicCampaigns.filter((campaign) => campaign.owner_id !== user?.id))
        setLedger(entries)
      })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [api, user?.id])

  const activeCampaign = campaigns.find((campaign) => campaign.status === 'published')
  const activeAssignments = activeCampaign ? assignments.filter((item) => item.campaign_id === activeCampaign.id) : []
  const joined = activeAssignments.filter((item) => !['applied', 'cancelled', 'rejected'].includes(item.status)).length
  const completedAsTester = assignments.filter((item) => item.tester_id === user?.id && item.status === 'approved').length
  const ownedCampaignIds = useMemo(() => new Set(campaigns.map((campaign) => campaign.id)), [campaigns])
  const testersHelped = assignments.filter((item) => ownedCampaignIds.has(item.campaign_id) && item.status === 'approved').length
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  if (isLoading) return <div className="empty-state"><p>Loading dashboard…</p></div>

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
        title={`${greeting}, ${profile?.display_name || user?.name || 'builder'}`}
        description="Keep testing real software to earn credits and move your campaign forward."
        action={<Link className="button button-dark" to="/console/available-tests"><FlaskConical size={17} /> Find a test</Link>}
      />
      {error && <div className="form-error">{error}</div>}

      <section className="stats-grid" aria-label="Account overview">
        <StatCard label="Available credits" value={String(balance)} detail="Ready to spend on a campaign" icon={BadgeDollarSign} tone="green" />
        <StatCard label="Tests completed" value={String(completedAsTester)} detail="Approved tester submissions" icon={CircleCheckBig} tone="purple" />
        <StatCard label="Active campaigns" value={String(campaigns.filter((item) => item.status === 'published').length)} detail="Currently recruiting testers" icon={Rocket} tone="orange" />
        <StatCard label="Testers helped" value={String(testersHelped)} detail="Approved on your campaigns" icon={Users} tone="blue" />
      </section>

      <div className="dashboard-grid">
        {activeCampaign ? (
          <section className="panel campaign-focus">
            <div className="panel-header"><div><span className="section-kicker">ACTIVE CAMPAIGN</span><h2>{activeCampaign.name}</h2></div><span className="badge badge-active"><span /> Live</span></div>
            <p className="muted">{platformLabel(activeCampaign.platform)} · {activeCampaign.category}</p>
            <div className="campaign-number-row">
              <div><strong>{joined}</strong><span>testers joined</span></div>
              <div><strong>{Math.max(activeCampaign.target_testers - joined, 0)}</strong><span>still needed</span></div>
              <div><strong>{activeAssignments.filter((item) => item.status === 'applied').length}</strong><span>applications</span></div>
            </div>
            <div className="segment-progress" aria-label={`${joined} of ${activeCampaign.target_testers} testers joined`}>
              {Array.from({ length: activeCampaign.target_testers }).map((_, index) => <span className={index < joined ? 'filled' : ''} key={index} />)}
            </div>
            <div className="focus-footer"><span>Review applicants and submitted evidence in the campaign workspace.</span><Link to={`/console/my-campaigns/${activeCampaign.id}`}>Manage campaign <ArrowRight size={15} /></Link></div>
          </section>
        ) : (
          <section className="panel campaign-focus"><span className="section-kicker">DEVELOPER WORKSPACE</span><h2>No active campaign</h2><p className="muted">Create a testing contract when you’re ready to recruit testers.</p><Link className="button button-outline" to="/console/my-campaigns/new">Create campaign</Link></section>
        )}

        <section className="panel activity-panel">
          <div className="panel-header"><h2>Recent credit activity</h2><Link to="/console/credits">View ledger</Link></div>
          <div className="activity-list">
            {ledger.slice(0, 4).map((item) => (
              <div className="activity-item" key={item.id}>
                <span className={`activity-dot ${item.delta > 0 ? 'green' : 'orange'}`} />
                <div><strong>{item.note || item.entry_type.replaceAll('_', ' ')}</strong><p>{item.delta > 0 ? '+' : ''}{item.delta} credits</p></div>
                <time>{new Date(item.created_at).toLocaleDateString()}</time>
              </div>
            ))}
            {!ledger.length && <div className="empty-state"><p>No credit activity yet.</p></div>}
          </div>
        </section>
      </div>

      <section>
        <div className="section-heading"><div><span className="section-kicker">EARN CREDITS</span><h2>Tests ready for you</h2></div><Link to="/console/available-tests">Browse all tests <ArrowRight size={15} /></Link></div>
        {available.length ? <div className="quick-tests-grid">
          {available.slice(0, 3).map((test) => (
            <Link to={`/console/available-tests?test=${test.slug}`} className="quick-test" key={test.id}>
              <span className="app-icon mint">{test.name.slice(0, 2).toUpperCase()}</span>
              <div><strong>{test.name}</strong><span>{platformLabel(test.platform)} · {test.category}</span></div>
              <span className="credit-reward">+{test.reward_credits}</span><ArrowRight className="quick-arrow" size={17} />
            </Link>
          ))}
        </div> : <div className="empty-state"><p>No public tests are currently available from other developers.</p></div>}
      </section>
    </div>
  )
}
