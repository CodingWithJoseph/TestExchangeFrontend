import { ArrowLeft, Check, CheckCircle2, Clock3, ExternalLink, FileCheck2, Gavel, LockKeyhole, RotateCcw, ShieldCheck, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import { ConversationPanel } from '../components/ConversationPanel'
import {
  evidenceAcceptAttribute,
  evidenceKindForFile,
  removeEvidenceFiles,
  uploadEvidenceFile,
  validateEvidenceFile,
} from '../features/testing/evidenceStorage'
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
  const [attachments, setAttachments] = useState<Record<string, File[]>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [openingDispute, setOpeningDispute] = useState(false)
  const [sessionNote, setSessionNote] = useState('')
  const [recordingSession, setRecordingSession] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const latestSubmission = workspace?.submissions[0]
  const latestReview = workspace?.reviews.find((review) => review.submission_id === latestSubmission?.id)
  const dispute = workspace?.disputes[0]

  useEffect(() => {
    if (!workspace?.contract) return
    const notes = Object.fromEntries(workspace.contract.tasks.map((task) => {
      const existing = latestSubmission?.items.find((item) => item.task_id === task.id)?.note || ''
      return [task.id, existing]
    }))
    setEvidence(notes)
    setSummary(latestSubmission?.summary || '')
  }, [latestSubmission, workspace?.contract])

  const participationReady = useMemo(() => {
    if (!workspace?.contract || !workspace.assignment.started_at) return false
    const elapsedMilliseconds = Date.now() - new Date(workspace.assignment.started_at).getTime()
    const elapsedDays = Math.floor(elapsedMilliseconds / (24 * 60 * 60 * 1000))
    return elapsedDays >= workspace.contract.minimum_duration_days && workspace.sessions.length >= workspace.contract.required_sessions
  }, [workspace?.assignment.started_at, workspace?.contract, workspace?.sessions.length])

  const canSubmit = useMemo(() => {
    if (!workspace?.contract || summary.trim().length < 20 || !participationReady) return false
    return workspace.contract.tasks.every((task) => {
      const note = (evidence[task.id] || '').trim()
      return !task.evidence_required || note.length > 0
    })
  }, [evidence, participationReady, summary, workspace?.contract])

  if (!assignmentId) return <Navigate to="/console/my-tests" replace />
  if (isLoading) return <div className="empty-state"><p>Loading private workspace…</p></div>
  if (loadError || !workspace) return <div className="empty-state"><h2>Couldn’t open this test</h2><p>{loadError || 'Assignment not found.'}</p><Link className="button button-outline" to="/console/my-tests">Back to my tests</Link></div>
  if (workspace.isOwner) return <Navigate to={`/console/my-campaigns/${workspace.campaign.id}`} replace />

  const { assignment, campaign, contract, sessions } = workspace
  const accessUrl = urlFrom(contract?.access_instructions)
  const elapsedDays = assignment.started_at ? Math.max(0, Math.floor((Date.now() - new Date(assignment.started_at).getTime()) / (24 * 60 * 60 * 1000))) : 0
  const sessionRecordedToday = sessions.some((session) => session.session_date === new Date().toISOString().slice(0, 10))

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
    setUploading(false)
    setError(null)
    const uploadedKeys: string[] = []
    try {
      const items = []
      for (const task of contract.tasks) {
        const note = (evidence[task.id] || '').trim()
        if (task.evidence_required || note) {
          items.push({ task_id: task.id, kind: 'note' as const, note })
        }
        for (const file of attachments[task.id] || []) {
          setUploading(true)
          const storageKey = await uploadEvidenceFile(assignment.id, file)
          uploadedKeys.push(storageKey)
          items.push({ task_id: task.id, kind: evidenceKindForFile(file), storage_key: storageKey })
        }
      }
      await api.createSubmission(assignment.id, summary.trim(), items)
      await Promise.all([refresh(), refreshAccount()])
      setAttachments({})
    } catch (requestError) {
      try {
        await removeEvidenceFiles(uploadedKeys)
      } catch (cleanupError) {
        setError(`${requestError instanceof Error ? requestError.message : 'Unable to submit this evidence.'} ${cleanupError instanceof Error ? cleanupError.message : ''}`.trim())
        return
      }
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit this evidence.')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  const attachFiles = (taskId: string, files: File[]) => {
    const validationError = files.map(validateEvidenceFile).find(Boolean)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setAttachments((current) => ({ ...current, [taskId]: files }))
  }

  const openDispute = async () => {
    if (!latestSubmission || disputeReason.trim().length < 20 || openingDispute) return
    setOpeningDispute(true)
    setError(null)
    try {
      await api.openDispute(assignment.id, latestSubmission.id, disputeReason.trim())
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to open this dispute.')
    } finally {
      setOpeningDispute(false)
    }
  }

  const recordSession = async () => {
    if (recordingSession) return
    setRecordingSession(true)
    setError(null)
    try {
      await api.recordTestingSession(assignment.id, sessionNote.trim() || null)
      setSessionNote('')
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to record this session.')
    } finally {
      setRecordingSession(false)
    }
  }

  const withdraw = async () => {
    if (withdrawing || !window.confirm(assignment.status === 'applied' ? 'Withdraw this application?' : 'Leave this test? Your current assignment will be closed and cannot be resumed.')) return
    setWithdrawing(true)
    setError(null)
    try {
      await api.withdrawAssignment(assignment.id)
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to withdraw from this test.')
    } finally {
      setWithdrawing(false)
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
            : assignment.status === 'cancelled'
              ? 'This application or assignment is closed. No further testing work is required.'
            : null

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-breadcrumb"><Link to="/console/my-tests"><ArrowLeft size={15} /> My tests</Link><span>/</span><span>{campaign.name}</span></div>
      <header className="workspace-hero">
        <div className="workspace-app"><span className="app-icon large mint">{campaign.name.slice(0, 2).toUpperCase()}</span><div><span className="page-eyebrow">TESTER WORKSPACE · {campaign.category.toUpperCase()}</span><h1>{campaign.name}</h1><p>{campaign.platform} · {campaign.minimum_version || 'See contract requirements'}</p></div></div>
        <div className="workspace-hero-status"><span className={`status-pill ${assignmentStatusClass(assignment.status)}`}>{assignmentStatusLabel(assignment.status)}</span><strong>+{campaign.reward_credits} credits</strong><small>{assignment.status === 'approved' ? 'Awarded' : 'Promised for approved work'}</small></div>
      </header>

      {statusNote && <div className={`workspace-notice ${assignment.status === 'approved' ? 'success' : assignment.status === 'changes_requested' || assignment.status === 'rejected' ? 'attention' : assignment.status === 'submitted' ? 'review' : 'warning'}`}>{assignment.status === 'approved' ? <CheckCircle2 size={18} /> : assignment.status === 'submitted' ? <ShieldCheck size={18} /> : assignment.status === 'changes_requested' ? <RotateCcw size={18} /> : <Clock3 size={18} />}<div><strong>{assignmentStatusLabel(assignment.status)}</strong><p>{statusNote}</p></div></div>}
      {error && <div className="form-error">{error}</div>}
      {['applied', 'accepted', 'in_progress', 'changes_requested'].includes(assignment.status) && <div className="campaign-controls"><small>{assignment.status === 'applied' ? 'No longer interested? Remove your pending application.' : 'If you cannot complete the locked contract, leave the test so the developer can plan around the open spot.'}</small><button className="button button-danger" disabled={withdrawing} onClick={() => void withdraw()}><XCircle size={16} /> {withdrawing ? 'Withdrawing…' : assignment.status === 'applied' ? 'Withdraw application' : 'Leave this test'}</button></div>}

      <div className="workspace-layout">
        <div className="workspace-primary">
          {contract ? <section className="workspace-panel contract-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon"><FileCheck2 size={18} /></span><span><strong>Locked testing contract</strong><small>Version {contract.version} · requirements cannot change</small></span></div><span className="locked-label"><LockKeyhole size={12} /> Locked</span></div>
            <p className="contract-summary">{contract.tester_instructions}</p>
            {contract.access_instructions && <div className="brief-box"><strong>Private access instructions</strong><p>{contract.access_instructions}</p>{accessUrl && <a className="text-button" href={accessUrl} target="_blank" rel="noreferrer">Open test access <ExternalLink size={14} /></a>}</div>}
            <div className="task-checklist">{contract.tasks.map((task, index) => <div key={task.id}><span>{index + 1}</span><strong>{task.title}</strong><small>{task.instructions}</small></div>)}</div>
            <div className="brief-box"><strong>Evidence requirements</strong><p>{contract.evidence_requirements}</p>{contract.device_requirements && <small>{contract.device_requirements}</small>}</div>
            {assignment.status === 'accepted' && <button className="button button-dark" disabled={saving} onClick={() => void startTesting()}>{saving ? 'Starting…' : 'I have access · Start testing'}</button>}
            {['in_progress', 'changes_requested'].includes(assignment.status) && <div className="participation-card"><div><strong>Participation progress</strong><p>{Math.min(elapsedDays, contract.minimum_duration_days)} of {contract.minimum_duration_days} required days · {sessions.length} of {contract.required_sessions} distinct sessions</p><small>This records TestExchange activity only; it does not verify external store opt-in status.</small></div>{sessions.length < contract.required_sessions && <div><input value={sessionNote} maxLength={1000} onChange={(event) => setSessionNote(event.target.value)} placeholder="What did you test in this session?" /><button className="button button-outline" disabled={recordingSession || sessionRecordedToday} onClick={() => void recordSession()}>{recordingSession ? 'Recording…' : sessionRecordedToday ? 'Today recorded' : 'Record today’s session'}</button></div>}</div>}
          </section> : <section className="workspace-panel empty-work-panel"><LockKeyhole size={24} /><h2>Private contract locked</h2><p>Your request is waiting for developer acceptance. Only the public recruitment brief is visible right now.</p></section>}

          {contract && ['in_progress', 'changes_requested'].includes(assignment.status) && <section className="workspace-panel submission-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon purple"><FileCheck2 size={18} /></span><span><strong>{assignment.status === 'changes_requested' ? 'Submit your correction' : 'Submit testing evidence'}</strong><small>Address every required task with specific, truthful observations</small></span></div></div>
            <label className="builder-field"><span>Overall testing summary</span><textarea rows={5} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Describe what you tested, what happened, and the most useful result." /></label>
            <div className="evidence-list">{contract.tasks.map((task, index) => <article key={task.id}><span>{index + 1}</span><div><small>TASK {index + 1}{task.evidence_required ? ' · REQUIRED' : ''}</small><strong>{task.title}</strong><p>{task.instructions}</p><textarea rows={3} value={evidence[task.id] || ''} onChange={(event) => setEvidence((current) => ({ ...current, [task.id]: event.target.value }))} placeholder="What happened? Include exact behavior, errors, or observations." /><label className="evidence-attachment"><span>Attach screenshots or files <em>optional</em></span><input type="file" multiple accept={evidenceAcceptAttribute()} onChange={(event) => attachFiles(task.id, Array.from(event.target.files || []))} /><small>PNG, JPEG, WebP, MP4, or TXT · 50 MB maximum per file</small></label>{(attachments[task.id] || []).length > 0 && <div className="evidence-file-list">{attachments[task.id].map((file) => <span key={`${file.name}-${file.lastModified}`}>{file.name}</span>)}</div>}</div></article>)}</div>
            <div className="form-actions"><small>{uploading ? 'Uploading private evidence…' : !participationReady ? `Complete ${contract.minimum_duration_days} days and ${contract.required_sessions} distinct sessions before submitting.` : canSubmit ? 'Ready to submit for developer review.' : 'Write a summary of at least 20 characters and address every required task.'}</small><button className="button button-dark" disabled={!canSubmit || saving} onClick={() => void submitEvidence()}>{uploading ? 'Uploading…' : saving ? 'Submitting…' : assignment.status === 'changes_requested' ? 'Resubmit correction' : 'Submit evidence'}</button></div>
          </section>}

          {latestSubmission && !['in_progress', 'changes_requested'].includes(assignment.status) && <section className="workspace-panel submission-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon purple"><FileCheck2 size={18} /></span><span><strong>Submission version {latestSubmission.version}</strong><small>Submitted {formatDate(latestSubmission.submitted_at)}</small></span></div><span className={`status-pill ${latestSubmission.status.replaceAll('_', '-')}`}>{latestSubmission.status.replaceAll('_', ' ')}</span></div>
            <p>{latestSubmission.summary}</p>
            <div className="evidence-list">{latestSubmission.items.map((item) => { const task = contract?.tasks.find((entry) => entry.id === item.task_id); return <article key={item.id}><span><Check size={14} /></span><div><strong>{task?.title || 'Additional evidence'}</strong><p>{item.note || item.external_url || item.storage_key}</p></div></article> })}</div>
          </section>}

          {assignment.status === 'rejected' && latestSubmission && <section className="workspace-panel dispute-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon orange"><Gavel size={18} /></span><span><strong>Contract dispute</strong><small>A moderator reviews the locked contract, evidence, messages, and original decision</small></span></div>{dispute && <span className={`status-pill ${dispute.status.replaceAll('_', '-')}`}>{dispute.status.replaceAll('_', ' ')}</span>}</div>
            {dispute ? <div className="brief-box"><strong>{dispute.remedy === 'award_tester' ? 'Moderator awarded the tester' : dispute.status === 'rejected' ? 'Original rejection upheld' : 'Dispute submitted'}</strong><p>{dispute.resolution || dispute.reason}</p>{dispute.status === 'resolved' && dispute.remedy === 'award_tester' && <small>The assignment and submission were approved and {campaign.reward_credits} credits were awarded exactly once.</small>}</div> : <div className="decision-form danger"><label>Why does the evidence satisfy the locked contract?<textarea rows={5} value={disputeReason} maxLength={8000} onChange={(event) => setDisputeReason(event.target.value)} placeholder="Reference the exact contract task, submitted evidence, and the developer’s rejection reason." /></label><small>{disputeReason.trim().length < 20 ? 'Write at least 20 characters. One dispute may be opened for this assignment.' : 'A human moderator will review the complete private audit trail.'}</small><button className="button button-danger" disabled={disputeReason.trim().length < 20 || openingDispute} onClick={() => void openDispute()}>{openingDispute ? 'Opening dispute…' : 'Open contract dispute'}</button></div>}
          </section>}
        </div>

        <aside className="workspace-side">
          <section className="credit-hold-card"><span className="panel-icon"><ShieldCheck size={18} /></span><div><span>REWARD STATUS</span><strong>{campaign.reward_credits} credits {assignment.status === 'approved' ? 'awarded' : 'promised'}</strong><p>{assignment.status === 'approved' ? 'Added to your available balance.' : 'Awarded after owner approval or a moderator-upheld dispute.'}</p></div></section>
          <ConversationPanel assignmentId={assignment.id} />
        </aside>
      </div>
    </div>
  )
}
