import { ArrowLeft, Check, CheckCircle2, Clock3, ExternalLink, FileCheck2, LockKeyhole, RotateCcw, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import { ConversationPanel } from '../components/ConversationPanel'
import { useAssignmentWorkspace } from '../features/testing/useAssignmentWorkspace'
import { assignmentStatusClass, assignmentStatusLabel, formatDate } from '../features/testing/workflowFormat'

function urlFrom(value: string | null | undefined) {
  if (!value) return null
  return value.match(/https?:\/\/\S+/)?.[0] || null
}

export function TestWorkspacePage() {
  const { assignmentId } = useParams()
  const api = useApi()
  const { refreshAccount } = useAccount()
  const { workspace, isLoading, error: loadError, refresh } = useAssignmentWorkspace(assignmentId)
  const [summary, setSummary] = useState('')
  const [evidence, setEvidence] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const latestSubmission = workspace?.submissions[0]
  const latestReview = workspace?.reviews.find((review) => review.submission_id === latestSubmission?.id)

  useEffect(() => {
    if (!workspace?.contract) return
    const notes = Object.fromEntries(workspace.contract.tasks.map((task) => {
      const existing = latestSubmission?.items.find((item) => item.task_id === task.id)?.note || ''
      return [task.id, existing]
    }))
    setEvidence(notes)
    setSummary(latestSubmission?.summary || '')
  }, [latestSubmission, workspace?.contract])

  const canSubmit = useMemo(() => {
    if (!workspace?.contract || summary.trim().length < 20) return false
    return workspace.contract.tasks.every((task) => !task.evidence_required || (evidence[task.id] || '').trim().length > 0)
  }, [evidence, summary, workspace?.contract])

  if (!assignmentId) return <Navigate to="/console/my-tests" replace />
  if (isLoading) return <div className="empty-state"><p>Loading private workspace…</p></div>
  if (loadError || !workspace) return <div className="empty-state"><h2>Couldn’t open this test</h2><p>{loadError || 'Assignment not found.'}</p><Link className="button button-outline" to="/console/my-tests">Back to my tests</Link></div>
  if (workspace.isOwner) return <Navigate to={`/console/my-campaigns/${workspace.campaign.id}`} replace />

  const { assignment, campaign, contract } = workspace
  const accessUrl = urlFrom(contract?.access_instructions)

  const startTesting = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.startAssignment(assignment.id)
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start this test.')
    } finally {
      setSaving(false)
    }
  }

  const submitEvidence = async () => {
    if (!contract || !canSubmit || saving) return
    setSaving(true)
    setError(null)
    try {
      await api.createSubmission(assignment.id, summary.trim(), contract.tasks
        .filter((task) => task.evidence_required || (evidence[task.id] || '').trim())
        .map((task) => ({ task_id: task.id, kind: 'note' as const, note: evidence[task.id].trim() })))
      await Promise.all([refresh(), refreshAccount()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit this evidence.')
    } finally {
      setSaving(false)
    }
  }

  const statusNote = assignment.status === 'applied'
    ? 'The developer must accept your request before the private contract unlocks.'
    : assignment.status === 'submitted'
      ? 'The developer must review this submission against the locked contract.'
      : assignment.status === 'changes_requested'
        ? latestReview?.notes || 'The developer requested a focused correction.'
        : assignment.status === 'approved'
          ? latestReview?.notes || `${campaign.reward_credits} credits were released to your account.`
          : assignment.status === 'rejected'
            ? latestReview?.notes || 'The developer rejected this submission.'
            : null

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-breadcrumb"><Link to="/console/my-tests"><ArrowLeft size={15} /> My tests</Link><span>/</span><span>{campaign.name}</span></div>
      <header className="workspace-hero">
        <div className="workspace-app"><span className="app-icon large mint">{campaign.name.slice(0, 2).toUpperCase()}</span><div><span className="page-eyebrow">TESTER WORKSPACE · {campaign.category.toUpperCase()}</span><h1>{campaign.name}</h1><p>{campaign.platform} · {campaign.minimum_version || 'See contract requirements'}</p></div></div>
        <div className="workspace-hero-status"><span className={`status-pill ${assignmentStatusClass(assignment.status)}`}>{assignmentStatusLabel(assignment.status)}</span><strong>+{campaign.reward_credits} credits</strong><small>{assignment.status === 'approved' ? 'Released' : 'Reserved until approval'}</small></div>
      </header>

      {statusNote && <div className={`workspace-notice ${assignment.status === 'approved' ? 'success' : assignment.status === 'changes_requested' || assignment.status === 'rejected' ? 'attention' : assignment.status === 'submitted' ? 'review' : 'warning'}`}>{assignment.status === 'approved' ? <CheckCircle2 size={18} /> : assignment.status === 'submitted' ? <ShieldCheck size={18} /> : assignment.status === 'changes_requested' ? <RotateCcw size={18} /> : <Clock3 size={18} />}<div><strong>{assignmentStatusLabel(assignment.status)}</strong><p>{statusNote}</p></div></div>}
      {error && <div className="form-error">{error}</div>}

      <div className="workspace-layout">
        <div className="workspace-primary">
          {contract ? <section className="workspace-panel contract-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon"><FileCheck2 size={18} /></span><span><strong>Locked testing contract</strong><small>Version {contract.version} · requirements cannot change</small></span></div><span className="locked-label"><LockKeyhole size={12} /> Locked</span></div>
            <p className="contract-summary">{contract.tester_instructions}</p>
            {contract.access_instructions && <div className="brief-box"><strong>Private access instructions</strong><p>{contract.access_instructions}</p>{accessUrl && <a className="text-button" href={accessUrl} target="_blank" rel="noreferrer">Open test access <ExternalLink size={14} /></a>}</div>}
            <div className="task-checklist">{contract.tasks.map((task, index) => <div key={task.id}><span>{index + 1}</span><strong>{task.title}</strong><small>{task.instructions}</small></div>)}</div>
            <div className="brief-box"><strong>Evidence requirements</strong><p>{contract.evidence_requirements}</p>{contract.device_requirements && <small>{contract.device_requirements}</small>}</div>
            {assignment.status === 'accepted' && <button className="button button-dark" disabled={saving} onClick={() => void startTesting()}>{saving ? 'Starting…' : 'I have access · Start testing'}</button>}
          </section> : <section className="workspace-panel empty-work-panel"><LockKeyhole size={24} /><h2>Private contract locked</h2><p>Your request is waiting for developer acceptance. Only the public recruitment brief is visible right now.</p></section>}

          {contract && ['in_progress', 'changes_requested'].includes(assignment.status) && <section className="workspace-panel submission-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon purple"><FileCheck2 size={18} /></span><span><strong>{assignment.status === 'changes_requested' ? 'Submit your correction' : 'Submit testing evidence'}</strong><small>Address every required task with specific, truthful observations</small></span></div></div>
            <label className="builder-field"><span>Overall testing summary</span><textarea rows={5} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Describe what you tested, what happened, and the most useful result." /></label>
            <div className="evidence-list">{contract.tasks.map((task, index) => <article key={task.id}><span>{index + 1}</span><div><small>TASK {index + 1}{task.evidence_required ? ' · REQUIRED' : ''}</small><strong>{task.title}</strong><p>{task.instructions}</p><textarea rows={3} value={evidence[task.id] || ''} onChange={(event) => setEvidence((current) => ({ ...current, [task.id]: event.target.value }))} placeholder="What happened? Include exact behavior, errors, or observations." /></div></article>)}</div>
            <div className="form-actions"><small>{canSubmit ? 'Ready to submit for developer review.' : 'Write a summary of at least 20 characters and address every required task.'}</small><button className="button button-dark" disabled={!canSubmit || saving} onClick={() => void submitEvidence()}>{saving ? 'Submitting…' : assignment.status === 'changes_requested' ? 'Resubmit correction' : 'Submit evidence'}</button></div>
          </section>}

          {latestSubmission && !['in_progress', 'changes_requested'].includes(assignment.status) && <section className="workspace-panel submission-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon purple"><FileCheck2 size={18} /></span><span><strong>Submission version {latestSubmission.version}</strong><small>Submitted {formatDate(latestSubmission.submitted_at)}</small></span></div><span className={`status-pill ${latestSubmission.status.replaceAll('_', '-')}`}>{latestSubmission.status.replaceAll('_', ' ')}</span></div>
            <p>{latestSubmission.summary}</p>
            <div className="evidence-list">{latestSubmission.items.map((item) => { const task = contract?.tasks.find((entry) => entry.id === item.task_id); return <article key={item.id}><span><Check size={14} /></span><div><strong>{task?.title || 'Additional evidence'}</strong><p>{item.note || item.external_url || item.storage_key}</p></div></article> })}</div>
          </section>}
        </div>

        <aside className="workspace-side">
          <section className="credit-hold-card"><span className="panel-icon"><ShieldCheck size={18} /></span><div><span>CREDIT STATUS</span><strong>{campaign.reward_credits} credits {assignment.status === 'approved' ? 'released' : 'reserved'}</strong><p>{assignment.status === 'approved' ? 'Added to your available balance.' : 'Released only after the developer approves completed work.'}</p></div></section>
          <ConversationPanel assignmentId={assignment.id} />
        </aside>
      </div>
    </div>
  )
}
