import { ArrowRight, CircleAlert, CircleCheck, Clock3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Assignment, Campaign } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { assignmentStatusClass, assignmentStatusLabel, formatDate } from '../features/testing/workflowFormat'

const tabs = ['All', 'Active', 'In review', 'Completed']

export function MyTestsPage() {
  const api = useApi()
  const { user } = useAuth()
  const [tab, setTab] = useState('All')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    void Promise.all([api.listAssignments(), api.listPublicCampaigns()])
      .then(([assignmentItems, campaignItems]) => {
        if (!active) return
        setAssignments(assignmentItems.filter((item) => item.tester_id === user?.id))
        setCampaigns(campaignItems)
      })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load assignments.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [api, user?.id])

  const visible = useMemo(() => assignments.filter((assignment) => {
    if (tab === 'All') return true
    if (tab === 'Completed') return assignment.status === 'approved'
    if (tab === 'Active') return ['applied', 'accepted', 'in_progress', 'changes_requested'].includes(assignment.status)
    return assignment.status === 'submitted'
  }), [assignments, tab])

  const campaignFor = (assignment: Assignment) => campaigns.find((campaign) => campaign.id === assignment.campaign_id)

  return (
    <div className="page-stack">
      <PageHeader eyebrow="YOUR CONTRIBUTIONS" title="My tests" description="Track active contracts, submit evidence, speak privately with developers, and follow every credit decision." />
      <div className="summary-strip">
        <div><Clock3 size={18} /><span><strong>{assignments.filter((item) => item.status === 'submitted').length}</strong> waiting for review</span></div>
        <div><CircleCheck size={18} /><span><strong>{assignments.filter((item) => item.status === 'approved').length}</strong> approved tests</span></div>
        <div><CircleAlert size={18} /><span><strong>{assignments.filter((item) => item.status === 'changes_requested').length}</strong> needs attention</span></div>
      </div>
      <div className="tabs" role="tablist">{tabs.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
      {isLoading ? <div className="empty-state"><p>Loading your tests…</p></div> : error ? <div className="empty-state"><h2>Couldn’t load your tests</h2><p>{error}</p></div> : visible.length === 0 ? <div className="empty-state"><h2>No tests in this view</h2><p>Browse available campaigns and request your first testing spot.</p><Link className="button button-dark" to="/console/available-tests">Find a test</Link></div> : (
        <div className="table-card">
          <div className="data-table table-header"><span>Project</span><span>Submitted / joined</span><span>Status</span><span>Reward</span><span /></div>
          {visible.map((assignment) => {
            const campaign = campaignFor(assignment)
            return <div className="data-table" key={assignment.id}>
              <span className="table-app"><span className="mini-app-icon">{campaign?.name.slice(0, 2).toUpperCase() || 'TE'}</span><span><strong>{campaign?.name || 'Campaign'}</strong><small>{campaign?.platform || 'Software test'}</small></span></span>
              <span data-label={assignment.submitted_at ? 'Submitted' : 'Joined'}>{formatDate(assignment.submitted_at || assignment.created_at)}</span>
              <span data-label="Status"><span className={`status-pill ${assignmentStatusClass(assignment.status)}`}>{assignmentStatusLabel(assignment.status)}</span></span>
              <strong data-label="Reward" className={assignment.status === 'approved' ? 'positive' : ''}>{assignment.status === 'approved' ? '+' : ''}{campaign?.reward_credits ?? 0} cr</strong>
              <Link className="icon-button" to={`/console/my-tests/${assignment.id}`} aria-label={`Open ${campaign?.name || 'test'}`}><ArrowRight size={17} /></Link>
            </div>
          })}
        </div>
      )}
    </div>
  )
}
