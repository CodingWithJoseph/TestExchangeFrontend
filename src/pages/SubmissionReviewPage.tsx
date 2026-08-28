import { AlertTriangle, ArrowLeft, Bot, Check, CheckCircle2, CircleAlert, FileCheck2, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import { ApiError } from '../api/client'
import type { Assignment, Campaign, QualityCheck, Review, ReviewDecision, Submission, TestingContract } from '../api/types'
import { ConversationPanel } from '../components/ConversationPanel'
import { createEvidenceSignedUrl } from '../features/testing/evidenceStorage'
import { formatDate } from '../features/testing/workflowFormat'

type ReviewData = { campaign: Campaign; contract: TestingContract; assignment: Assignment; submission: Submission; review: Review | null; qualityCheck: QualityCheck | null }

export function SubmissionReviewPage() {
  const { campaignId, submissionId } = useParams()
  const api = useApi()
  const { refreshAccount } = useAccount()
  const [data, setData] = useState<ReviewData | null>(null)
  const [mode, setMode] = useState<ReviewDecision>('approved')
  const [notes, setNotes] = useState('Completed all required contract tasks.')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [evidenceUrls, setEvidenceUrls] = useState<Record<string, string>>({})

  const loadReview = useCallback(async () => {
    if (!campaignId || !submissionId) return
    setIsLoading(true)
    setError(null)
    try {
      const [campaigns, assignments, contract] = await Promise.all([api.listOwnedCampaigns(), api.listAssignments(), api.getOwnedContract(campaignId)])
      const campaign = campaigns.find((item) => item.id === campaignId)
      if (!campaign) throw new Error('Campaign not found.')
      const campaignAssignments = assignments.filter((item) => item.campaign_id === campaignId)
      const submissionGroups = await Promise.all(campaignAssignments.map(async (assignment) => ({ assignment, submissions: await api.listSubmissions(assignment.id) })))
      const group = submissionGroups.find((item) => item.submissions.some((submission) => submission.id === submissionId))
      const submission = group?.submissions.find((item) => item.id === submissionId)
      if (!group || !submission) throw new Error('Submission not found.')
      const reviews = await api.listReviews(submission.id)
      let qualityCheck: QualityCheck | null = null
      try {
        qualityCheck = await api.getQualityCheck(submission.id)
      } catch (requestError) {
        // Keep the review workspace usable while an older backend is being rolled forward.
        if (!(requestError instanceof ApiError) || requestError.status !== 404) throw requestError
      }
      setData({ campaign, contract, assignment: group.assignment, submission, review: reviews[0] || null, qualityCheck })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load this submission.')
    } finally {
      setIsLoading(false)
    }
  }, [api, campaignId, submissionId])

  useEffect(() => { void loadReview() }, [loadReview])

  useEffect(() => {
    if (!data) return
    let active = true
    void Promise.all(data.submission.items.filter((item) => item.storage_key).map(async (item) => [item.id, await createEvidenceSignedUrl(item.storage_key!)] as const))
      .then((entries) => {
        if (!active) return
        setEvidenceUrls(Object.fromEntries(entries.filter((entry): entry is [string, string] => Boolean(entry[1]))))
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to open evidence files.')
      })
    return () => { active = false }
  }, [data])

  if (!campaignId || !submissionId) return <Navigate to="/console/my-campaigns" replace />
  if (isLoading) return <div className="empty-state"><p>Loading submission…</p></div>
  if (error || !data) return <div className="empty-state"><h2>Couldn’t open this submission</h2><p>{error || 'Submission not found.'}</p><Link className="button button-outline" to={`/console/my-campaigns/${campaignId}`}>Back to campaign</Link></div>

  const { campaign, contract, assignment, submission, review, qualityCheck } = data
  const decide = async () => {
    if (notes.trim().length < 5 || saving || review) return
    setSaving(true)
    setError(null)
    try {
      await api.createReview(submission.id, mode, notes.trim())
      await Promise.all([loadReview(), refreshAccount()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to record this decision.')
    } finally {
      setSaving(false)
    }
  }

  const outcome = review?.decision || submission.status

  return (
    <div className="page-stack review-page">
      <div className="workspace-breadcrumb"><Link to={`/console/my-campaigns/${campaign.id}`}><ArrowLeft size={15} /> {campaign.name}</Link><span>/</span><span>Submission review</span></div>
      <header className="review-header">
        <div className="workspace-app"><span className="avatar large-avatar">{assignment.tester_id.slice(0, 2).toUpperCase()}</span><div><span className="page-eyebrow">SUBMISSION REVIEW · VERSION {submission.version}</span><h1>Tester {assignment.tester_id.slice(0, 8)}</h1><p>Submitted {formatDate(submission.submitted_at)} · {campaign.platform}</p></div></div>
        <div className="review-deadline"><span><small>REWARD</small><strong>{campaign.reward_credits} credits</strong></span><span className={`status-pill ${outcome.replaceAll('_', '-')}`}>{outcome.replaceAll('_', ' ')}</span></div>
      </header>
      {error && <div className="form-error">{error}</div>}
      {review && <div className={`review-outcome ${review.decision === 'approved' ? 'approved' : review.decision === 'changes_requested' ? 'changes' : 'escalated'}`}>{review.decision === 'approved' ? <CheckCircle2 size={19} /> : review.decision === 'changes_requested' ? <RotateCcw size={19} /> : <ShieldAlert size={19} />}<div><strong>Decision recorded: {review.decision.replaceAll('_', ' ')}</strong><p>{review.notes}</p></div></div>}

      <div className="review-layout">
        <main className="review-evidence">
          <section className="workspace-panel review-summary-panel"><div className="workspace-panel-head"><div><span className="panel-icon"><ShieldCheck size={18} /></span><span><strong>Locked contract comparison</strong><small>Contract version {contract.version}</small></span></div><span className="completion-label"><Check size={13} /> {submission.items.length}/{contract.tasks.length} addressed</span></div><p>{submission.summary}</p></section>
          <section className="workspace-panel"><div className="workspace-panel-head"><div><span className="panel-icon purple"><FileCheck2 size={18} /></span><span><strong>Task evidence</strong><small>Compare each response with the original requirement</small></span></div></div><div className="evidence-list">{submission.items.map((item, index) => { const task = contract.tasks.find((entry) => entry.id === item.task_id); const signedUrl = item.storage_key ? evidenceUrls[item.id] : null; return <article key={item.id}><span><Check size={14} /></span><div><small>TASK {index + 1}{item.kind === 'screenshot' ? ' · PHOTO' : ''}</small><strong>{task?.title || 'Additional evidence'}</strong>{task && <p>{task.instructions}</p>}{item.note && <p><strong>Tester response:</strong> {item.note}</p>}{item.external_url && <p><a className="text-button" href={item.external_url} target="_blank" rel="noreferrer">Open external evidence</a></p>}{signedUrl && (item.kind === 'screenshot' ? <a className="evidence-photo-link" href={signedUrl} target="_blank" rel="noreferrer"><img className="evidence-photo" src={signedUrl} alt="Tester-provided screenshot" /><span>Open full-size photo</span></a> : <p><a className="text-button" href={signedUrl} target="_blank" rel="noreferrer">Open private attachment</a></p>)}</div></article> })}</div></section>
          <section className="workspace-panel quality-panel"><div className="workspace-panel-head"><div><span className="panel-icon orange"><Bot size={18} /></span><span><strong>Automated quality pre-check</strong><small>{qualityCheck ? `${qualityCheck.score}% · ${qualityCheck.status.replaceAll('_', ' ')}` : 'Waiting for backend quality check'}</small></span></div><span className="ai-label">ADVISORY ONLY</span></div>{qualityCheck ? <div className="quality-list">{qualityCheck.checks.map((item) => <div className={item.status} key={item.code}>{item.status === 'passed' ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}<span><strong>{item.label}</strong><small>{item.detail}</small></span></div>)}<p className="quality-disclaimer">{qualityCheck.disclaimer}</p></div> : <div className="quality-list"><div className="flagged"><CircleAlert size={17} /><span><strong>Manual contract review required</strong><small>The developer remains responsible for every approval, correction request, or rejection.</small></span></div></div>}</section>
        </main>

        <aside className="review-sidebar">
          <section className="decision-card">
            <span className="section-kicker">YOUR DECISION</span><h2>Review against the contract</h2><p>Approval releases credits atomically. Corrections and rejections must identify an unmet contract requirement.</p>
            {!review ? <>
              <label className={`decision-button approve ${mode === 'approved' ? 'selected' : ''}`}><input type="radio" name="decision" checked={mode === 'approved'} onChange={() => { setMode('approved'); setNotes('Completed all required contract tasks.') }} /><CheckCircle2 size={18} /><span><strong>Approve submission</strong><small>Release {campaign.reward_credits} credits</small></span></label>
              <label className={`decision-button ${mode === 'changes_requested' ? 'selected' : ''}`}><input type="radio" name="decision" checked={mode === 'changes_requested'} onChange={() => { setMode('changes_requested'); setNotes('') }} /><RotateCcw size={18} /><span><strong>Request a correction</strong><small>Keep credits reserved</small></span></label>
              <label className={`decision-button danger ${mode === 'rejected' ? 'selected' : ''}`}><input type="radio" name="decision" checked={mode === 'rejected'} onChange={() => { setMode('rejected'); setNotes('') }} /><ShieldAlert size={18} /><span><strong>Reject submission</strong><small>Tester may open a dispute</small></span></label>
              <div className={`decision-form ${mode === 'rejected' ? 'danger' : ''}`}><label>Decision explanation<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Reference the locked contract and the submitted evidence." /></label><small>{notes.trim().length < 5 ? 'An explanation of at least 5 characters is required.' : 'This explanation is preserved and visible to the tester.'}</small><button className={`button ${mode === 'rejected' ? 'button-danger' : 'button-dark'} button-full`} disabled={notes.trim().length < 5 || saving} onClick={() => void decide()}>{saving ? 'Recording…' : mode === 'approved' ? <><CheckCircle2 size={15} /> Approve and release credits</> : mode === 'changes_requested' ? <><RotateCcw size={15} /> Request correction</> : <><AlertTriangle size={15} /> Reject submission</>}</button></div>
            </> : <div className="decision-complete"><ShieldCheck size={22} /><strong>Decision recorded</strong><p>The outcome and any credit movement are preserved in the audit history.</p></div>}
            <div className="decision-protection"><ShieldCheck size={15} /><p>Automated checks never transfer credits or reject a tester.</p></div>
          </section>
          <ConversationPanel assignmentId={assignment.id} title="Message this tester" />
        </aside>
      </div>
    </div>
  )
}
