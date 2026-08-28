import { ArrowLeft, ArrowRight, FileCheck2, KeyRound, ShieldCheck, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Assignment, Campaign, Submission, TestingContract } from '../api/types'
import { assignmentStatusClass, assignmentStatusLabel, formatDate } from '../features/testing/workflowFormat'

const tabs = ['Testers', 'Submissions', 'Contract']

export function CampaignWorkspacePage() {
  const { campaignId } = useParams()
  const api = useApi()
  const [tab, setTab] = useState('Testers')
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contract, setContract] = useState<TestingContract | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  const loadWorkspace = useCallback(async () => {
    if (!campaignId) return
    setIsLoading(true)
    setError(null)
    try {
      const [campaignItems, assignmentItems, contractItem] = await Promise.all([
        api.listOwnedCampaigns(),
        api.listAssignments(),
        api.getOwnedContract(campaignId),
      ])
      const campaignItem = campaignItems.find((item) => item.id === campaignId)
      if (!campaignItem) throw new Error('Campaign not found.')
      const campaignAssignments = assignmentItems.filter((item) => item.campaign_id === campaignId)
      const submissionPairs = await Promise.all(campaignAssignments.map(async (assignment) => [assignment.id, await api.listSubmissions(assignment.id)] as const))
      setCampaign(campaignItem)
      setContract(contractItem)
      setAssignments(campaignAssignments)
      setSubmissions(Object.fromEntries(submissionPairs))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this campaign.')
    } finally {
      setIsLoading(false)
    }
  }, [api, campaignId])

  useEffect(() => { void loadWorkspace() }, [loadWorkspace])

  if (!campaignId) return <Navigate to="/console/my-campaigns" replace />
  if (isLoading) return <div className="empty-state"><p>Loading campaign workspace…</p></div>
  if (error || !campaign || !contract) return <div className="empty-state"><h2>Couldn’t open this campaign</h2><p>{error || 'Campaign not found.'}</p><Link className="button button-outline" to="/console/my-campaigns">Back to campaigns</Link></div>

  const inReview = assignments.filter((item) => item.status === 'submitted').length
  const pending = assignments.filter((item) => item.status === 'applied').length
  const approved = assignments.filter((item) => item.status === 'approved').length
  const active = assignments.filter((item) => ['accepted', 'in_progress', 'submitted', 'changes_requested', 'approved'].includes(item.status)).length
  const latestSubmission = (assignmentId: string) => submissions[assignmentId]?.[0]

  const acceptTester = async (assignmentId: string) => {
    setAccepting(assignmentId)
    setError(null)
    try {
      await api.acceptAssignment(assignmentId)
      await loadWorkspace()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to accept this tester.')
    } finally {
      setAccepting(null)
    }
  }

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-breadcrumb"><Link to="/console/my-campaigns"><ArrowLeft size={15} /> My campaigns</Link><span>/</span><span>{campaign.name}</span></div>
      <header className="workspace-hero">
        <div className="workspace-app"><span className="app-icon large peach">{campaign.name.slice(0, 2).toUpperCase()}</span><div><span className="page-eyebrow">DEVELOPER WORKSPACE · {campaign.status.toUpperCase()} CAMPAIGN</span><h1>{campaign.name}</h1><p>{campaign.platform} · Published {formatDate(campaign.published_at)}</p></div></div>
        <div className="workspace-hero-status"><span className={`status-pill ${campaign.status}`}>{campaign.status}</span><strong>{active} of {campaign.target_testers} testers</strong><small>{campaign.target_testers * campaign.reward_credits} credits reserved</small></div>
      </header>
      {error && <div className="form-error">{error}</div>}

      <div className="workspace-metrics">
        <div><span className="metric-icon green"><Users size={18} /></span><span><small>ACTIVE TESTERS</small><strong>{active} / {campaign.target_testers}</strong><em>{Math.max(campaign.target_testers - active, 0)} spots remaining</em></span></div>
        <div><span className="metric-icon orange"><FileCheck2 size={18} /></span><span><small>NEEDS REVIEW</small><strong>{inReview}</strong><em>{inReview ? 'Action required' : 'Queue clear'}</em></span></div>
        <div><span className="metric-icon blue"><KeyRound size={18} /></span><span><small>APPLICATIONS</small><strong>{pending}</strong><em>{pending ? 'Accept or leave pending' : 'No pending requests'}</em></span></div>
        <div><span className="metric-icon purple"><ShieldCheck size={18} /></span><span><small>APPROVED</small><strong>{approved}</strong><em>{approved * campaign.reward_credits} credits released</em></span></div>
      </div>

      {(pending > 0 || inReview > 0) && <section className="action-queue">
        <div className="section-heading"><div><span className="section-kicker">ACTION QUEUE</span><h2>Keep testers moving</h2></div><small>{pending + inReview} actions need attention</small></div>
        <div className="action-cards">
          {assignments.filter((item) => item.status === 'submitted').map((assignment) => { const submission = latestSubmission(assignment.id); return submission && <Link className="action-card urgent" key={assignment.id} to={`/console/my-campaigns/${campaign.id}/submissions/${submission.id}`}><span className="metric-icon orange"><FileCheck2 size={18} /></span><div><strong>Review tester {assignment.tester_id.slice(0, 8)}</strong><p>Submission version {submission.version} · {campaign.reward_credits} credits reserved</p></div><span><small>{formatDate(submission.submitted_at)}</small><ArrowRight size={16} /></span></Link> })}
          {assignments.filter((item) => item.status === 'applied').map((assignment) => <div className="action-card" key={assignment.id}><span className="metric-icon blue"><KeyRound size={18} /></span><div><strong>Tester {assignment.tester_id.slice(0, 8)} requested access</strong><p>{assignment.application_note || 'No application note provided.'}</p></div><button className="button button-outline" disabled={accepting === assignment.id} onClick={() => void acceptTester(assignment.id)}>{accepting === assignment.id ? 'Accepting…' : 'Accept tester'}</button></div>)}
        </div>
      </section>}

      <section className="workspace-panel campaign-roster-panel">
        <div className="workspace-tabs" role="tablist">{tabs.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}{item === 'Submissions' && <span>{inReview}</span>}</button>)}</div>
        {tab === 'Testers' && <div className="roster-table">
          <div className="roster-row roster-head"><span>Tester</span><span>Applied</span><span>Latest activity</span><span>Status</span><span /></div>
          {assignments.length === 0 && <div className="empty-list-row"><Users size={20} /><span><strong>No tester requests yet</strong><small>Your published campaign is ready to receive applications.</small></span></div>}
          {assignments.map((assignment) => { const submission = latestSubmission(assignment.id); return <div className="roster-row" key={assignment.id}><span className="tester-cell"><span className="avatar">{assignment.tester_id.slice(0, 2).toUpperCase()}</span><span><strong>Tester {assignment.tester_id.slice(0, 8)}</strong><small>{assignment.application_note || 'No application note'}</small></span></span><span data-label="Applied">{formatDate(assignment.created_at)}</span><span data-label="Latest activity">{formatDate(assignment.updated_at)}</span><span data-label="Status"><span className={`status-pill ${assignmentStatusClass(assignment.status)}`}>{assignmentStatusLabel(assignment.status)}</span></span><span>{submission ? <Link className="icon-button" aria-label="Open submission" to={`/console/my-campaigns/${campaign.id}/submissions/${submission.id}`}><ArrowRight size={16} /></Link> : assignment.status === 'applied' ? <button className="button button-outline" disabled={accepting === assignment.id} onClick={() => void acceptTester(assignment.id)}>Accept</button> : null}</span></div> })}
        </div>}
        {tab === 'Submissions' && <div className="submission-queue-list">
          {assignments.flatMap((assignment) => submissions[assignment.id] || []).map((submission) => <Link key={submission.id} to={`/console/my-campaigns/${campaign.id}/submissions/${submission.id}`}><span className="avatar">{submission.assignment_id.slice(0, 2).toUpperCase()}</span><span><strong>Submission version {submission.version}</strong><small>Submitted {formatDate(submission.submitted_at)}</small></span><span className={`status-pill ${submission.status.replaceAll('_', '-')}`}>{submission.status.replaceAll('_', ' ')}</span><strong>{campaign.reward_credits} cr</strong><ArrowRight size={16} /></Link>)}
          {Object.values(submissions).flat().length === 0 && <div className="empty-list-row"><FileCheck2 size={20} /><span><strong>No submissions yet</strong><small>Accepted testers can submit evidence from their private workspaces.</small></span></div>}
        </div>}
        {tab === 'Contract' && <div className="campaign-contract-view">
          <div><span>PLATFORM</span><strong>{campaign.platform}</strong></div><div><span>TESTER FIT</span><strong>{campaign.public_tester_requirements}</strong></div><div><span>ENVIRONMENT</span><strong>{contract.device_requirements || campaign.minimum_version || 'Not specified'}</strong></div><div><span>REVIEW WINDOW</span><strong>{contract.review_window_hours} hours</strong></div>
          <section><span>LOCKED CONTRACT TASKS</span><ol>{contract.tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ol></section>
        </div>}
      </section>
    </div>
  )
}
