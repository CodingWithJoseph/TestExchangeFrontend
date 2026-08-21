import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileCheck2,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ConversationPanel } from '../components/ConversationPanel'
import { calmCardsContract, calmCardsSubmission, workflowStatusClass, type WorkflowStatus } from '../features/testing/testingWorkflow'

type ReviewMode = 'changes' | 'reject' | null

export function SubmissionReviewPage() {
  const { campaignId, submissionId } = useParams()
  const [status, setStatus] = useState<WorkflowStatus>(calmCardsSubmission.status)
  const [mode, setMode] = useState<ReviewMode>(null)
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('Contract task not completed')

  if (campaignId !== 'calm-cards' || submissionId !== calmCardsSubmission.id) return <Navigate to="/console/my-campaigns" replace />

  const completeReview = (nextStatus: WorkflowStatus) => {
    if (nextStatus !== 'Approved' && note.trim().length < 15) return
    setStatus(nextStatus)
    setMode(null)
  }

  return (
    <div className="page-stack review-page">
      <div className="workspace-breadcrumb"><Link to="/console/my-campaigns/calm-cards"><ArrowLeft size={15} /> Calm Cards</Link><span>/</span><span>Submission review</span></div>
      <header className="review-header">
        <div className="workspace-app"><span className="avatar large-avatar">{calmCardsSubmission.testerInitials}</span><div><span className="page-eyebrow">SUBMISSION REVIEW</span><h1>{calmCardsSubmission.testerName}</h1><p>{calmCardsSubmission.device} · submitted {calmCardsSubmission.submitted}</p></div></div>
        <div className="review-deadline"><Clock3 size={17} /><span><small>REVIEW DUE</small><strong>46 hours remaining</strong></span><span className={`status-pill ${workflowStatusClass(status)}`}>{status}</span></div>
      </header>

      {status !== 'In review' && (
        <div className={`review-outcome ${status === 'Approved' ? 'approved' : status === 'Changes requested' ? 'changes' : 'escalated'}`}>
          {status === 'Approved' ? <CheckCircle2 size={19} /> : status === 'Changes requested' ? <RotateCcw size={19} /> : <ShieldAlert size={19} />}
          <div><strong>{status === 'Approved' ? 'Submission approved' : status === 'Changes requested' ? 'Changes requested from Maya' : 'Submission sent to dispute review'}</strong><p>{status === 'Approved' ? '2 credits were released to Maya and recorded in both credit ledgers.' : status === 'Changes requested' ? `Maya can update only the requested evidence: ${note}` : `${reason}. Reserved credits remain held while a neutral reviewer checks the contract and evidence.`}</p></div>
        </div>
      )}

      <div className="review-layout">
        <main className="review-evidence">
          <section className="workspace-panel review-summary-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon"><ShieldCheck size={18} /></span><span><strong>Contract completion</strong><small>The contract was locked when Maya joined on Aug 8</small></span></div><span className="completion-label"><Check size={13} /> Complete</span></div>
            <div className="review-facts"><span><strong>{calmCardsSubmission.sessionsCompleted}/{calmCardsContract.sessionsRequired}</strong><small>sessions completed</small></span><span><strong>{calmCardsSubmission.retentionDays}/{calmCardsContract.retentionDays}</strong><small>days retained</small></span><span><strong>{calmCardsSubmission.taskEvidence.length}/{calmCardsContract.tasks.length}</strong><small>tasks addressed</small></span><span><strong>{calmCardsSubmission.credits}</strong><small>credits held</small></span></div>
          </section>

          <section className="workspace-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon purple"><FileCheck2 size={18} /></span><span><strong>Task evidence</strong><small>Compare each response with the original requirement</small></span></div></div>
            <div className="evidence-list">{calmCardsSubmission.taskEvidence.map((item, index) => <article key={item.task}><span><Check size={14} /></span><div><small>TASK {index + 1}</small><strong>{item.task}</strong><p>{item.note}</p></div></article>)}</div>
          </section>

          <section className="workspace-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon blue"><Smartphone size={18} /></span><span><strong>Structured feedback</strong><small>Written feedback is required for every submission</small></span></div></div>
            <div className="feedback-review-grid full">
              <div><span>OVERALL EXPERIENCE</span><p>{calmCardsSubmission.feedback.overall}</p></div>
              <div><span>WHAT WAS CONFUSING</span><p>{calmCardsSubmission.feedback.confusing}</p></div>
              <div><span>ISSUES FOUND</span><p>{calmCardsSubmission.feedback.issues}</p></div>
              <div><span>TEST DEVICE</span><p>{calmCardsSubmission.device}</p></div>
            </div>
          </section>

          <section className="workspace-panel quality-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon orange"><Bot size={18} /></span><span><strong>Automated quality pre-check</strong><small>Advisory only · you remain responsible for the decision</small></span></div><span className="ai-label">AI ASSISTED</span></div>
            <div className="quality-list">{calmCardsSubmission.qualityChecks.map((check) => <div className={check.status} key={check.label}>{check.status === 'passed' ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}<span><strong>{check.label}</strong><small>{check.detail}</small></span></div>)}</div>
          </section>
        </main>

        <aside className="review-sidebar">
          <section className="decision-card">
            <span className="section-kicker">YOUR DECISION</span><h2>Review against the contract</h2><p>Approve useful completed work. Corrections and rejections must point to an unmet contract item.</p>
            {status === 'In review' ? (
              <>
                <button className="decision-button approve" onClick={() => completeReview('Approved')}><CheckCircle2 size={18} /><span><strong>Approve submission</strong><small>Release 2 credits to Maya</small></span></button>
                <button className={`decision-button ${mode === 'changes' ? 'selected' : ''}`} onClick={() => setMode(mode === 'changes' ? null : 'changes')}><RotateCcw size={18} /><span><strong>Request a correction</strong><small>Keep credits held during resubmission</small></span></button>
                <button className={`decision-button danger ${mode === 'reject' ? 'selected' : ''}`} onClick={() => setMode(mode === 'reject' ? null : 'reject')}><ShieldAlert size={18} /><span><strong>Reject and escalate</strong><small>Send the full record to dispute review</small></span></button>

                {mode && <div className={`decision-form ${mode === 'reject' ? 'danger' : ''}`}>
                  {mode === 'reject' && <label>Contract-based reason<select value={reason} onChange={(event) => setReason(event.target.value)}><option>Contract task not completed</option><option>Required evidence is missing</option><option>Submission appears fraudulent</option><option>Tester did not maintain access</option></select></label>}
                  <label>{mode === 'changes' ? 'What exact evidence needs correction?' : 'Explain how the submission failed the contract'}<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder={mode === 'changes' ? 'Reference one existing task and the smallest correction needed…' : 'Reference the locked contract and evidence…'} /></label>
                  <small>{note.trim().length < 15 ? 'A specific explanation of at least 15 characters is required.' : 'This explanation will be visible to the tester and dispute reviewer.'}</small>
                  <button className={`button ${mode === 'reject' ? 'button-danger' : 'button-dark'} button-full`} disabled={note.trim().length < 15} onClick={() => completeReview(mode === 'changes' ? 'Changes requested' : 'Disputed')}>{mode === 'changes' ? <><RotateCcw size={15} /> Send correction request</> : <><AlertTriangle size={15} /> Escalate rejection</>}</button>
                </div>}
              </>
            ) : (
              <div className="decision-complete"><ShieldCheck size={22} /><strong>Decision recorded</strong><p>The status, explanation, messages, and credit event are preserved in the activity record.</p></div>
            )}
            <div className="decision-protection"><ShieldCheck size={15} /><p>TestExchange’s automated check never transfers credits or rejects a tester.</p></div>
          </section>
          <ConversationPanel threadId={`submission-${calmCardsSubmission.id}`} initialMessages={calmCardsSubmission.messages} currentRole="developer" title="Message Maya" />
        </aside>
      </div>
    </div>
  )
}
