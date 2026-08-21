import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileCheck2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ConversationPanel } from '../components/ConversationPanel'
import { loadJoinedAssignments, testAssignments, workflowStatusClass } from '../features/testing/testingWorkflow'

function AssignmentNotice({ status, note }: { status: string; note?: string }) {
  if (status === 'Access pending') return <div className="workspace-notice warning"><Clock3 size={18} /><div><strong>Waiting for developer access</strong><p>{note}</p></div></div>
  if (status === 'In review') return <div className="workspace-notice review"><ShieldCheck size={18} /><div><strong>Your submission is protected during review</strong><p>The developer must review it against the original contract. Requirements cannot be added now.</p></div></div>
  if (status === 'Changes requested') return <div className="workspace-notice attention"><RotateCcw size={18} /><div><strong>A focused correction was requested</strong><p>{note}</p></div></div>
  if (status === 'Approved') return <div className="workspace-notice success"><CheckCircle2 size={18} /><div><strong>Test approved and credits released</strong><p>{note}</p></div></div>
  return null
}

export function TestWorkspacePage() {
  const { assignmentId } = useParams()
  const assignment = [...loadJoinedAssignments(), ...testAssignments].find((item) => item.id === assignmentId)
  const [correction, setCorrection] = useState('')
  const [resubmitted, setResubmitted] = useState(false)

  if (!assignment) return <Navigate to="/console/my-tests" replace />

  const progress = assignment.status === 'Approved' ? 4 : assignment.status === 'In review' || resubmitted ? 3 : assignment.status === 'Changes requested' ? 3 : assignment.status === 'Access pending' ? 1 : 2
  const canWork = assignment.status !== 'Access pending'

  const resubmit = () => {
    if (correction.trim().length < 10) return
    setResubmitted(true)
  }

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-breadcrumb"><Link to="/console/my-tests"><ArrowLeft size={15} /> My tests</Link><span>/</span><span>{assignment.appName}</span></div>

      <header className="workspace-hero">
        <div className="workspace-app"><span className="app-icon large mint">{assignment.appInitials}</span><div><span className="page-eyebrow">TESTER WORKSPACE · {assignment.category.toUpperCase()}</span><h1>{assignment.appName}</h1><p>{assignment.developer} · {assignment.device}</p></div></div>
        <div className="workspace-hero-status"><span className={`status-pill ${workflowStatusClass(resubmitted ? 'In review' : assignment.status)}`}>{resubmitted ? 'In review' : assignment.status}</span><strong>+{assignment.credits} credits</strong><small>{assignment.status === 'Approved' ? 'Released' : 'Protected until review'}</small></div>
      </header>

      <div className="workflow-steps" aria-label="Testing progress">
        {[
          ['1', 'Joined', assignment.joined],
          ['2', 'Testing', `${assignment.sessionsCompleted}/${assignment.sessionsRequired} sessions`],
          ['3', 'Review', assignment.submitted ?? 'Not submitted'],
          ['4', 'Credits', assignment.status === 'Approved' ? 'Released' : 'Pending'],
        ].map(([number, label, detail], index) => (
          <div className={index < progress ? 'complete' : index === progress ? 'current' : ''} key={label}>
            <span>{index < progress ? <Check size={14} /> : number}</span><div><strong>{label}</strong><small>{detail}</small></div>
          </div>
        ))}
      </div>

      <AssignmentNotice status={resubmitted ? 'In review' : assignment.status} note={assignment.reviewNote ?? assignment.accessNote} />

      <div className="workspace-layout">
        <div className="workspace-primary">
          <section className="workspace-panel contract-panel">
            <div className="workspace-panel-head"><div><span className="panel-icon"><FileCheck2 size={18} /></span><span><strong>Testing contract</strong><small>Accepted when you joined · requirements are locked</small></span></div><span className="locked-label"><LockKeyhole size={12} /> Locked</span></div>
            <p className="contract-summary">{assignment.contractSummary}</p>
            <div className="task-checklist">
              {assignment.tasks.map((task, index) => <div key={task.title}><span className={task.complete ? 'done' : ''}>{task.complete ? <Check size={14} /> : index + 1}</span><strong>{task.title}</strong><small>{task.complete ? 'Complete' : canWork ? 'Not complete' : 'Available after access'}</small></div>)}
            </div>
            <div className="contract-facts">
              <span><CalendarDays size={15} /><small>Retention</small><strong>{assignment.daysCompleted}/{assignment.retentionDays} days</strong></span>
              <span><CircleDashed size={15} /><small>Sessions</small><strong>{assignment.sessionsCompleted}/{assignment.sessionsRequired}</strong></span>
              <span><Smartphone size={15} /><small>Device</small><strong>{assignment.device}</strong></span>
            </div>
          </section>

          {assignment.feedback ? (
            <section className="workspace-panel submission-panel">
              <div className="workspace-panel-head"><div><span className="panel-icon purple"><FileCheck2 size={18} /></span><span><strong>{assignment.status === 'Changes requested' && !resubmitted ? 'Your submission needs an update' : 'Submitted evidence'}</strong><small>{assignment.submitted ? `Submitted ${assignment.submitted}` : 'Not submitted'}</small></span></div><span className={`status-pill ${workflowStatusClass(resubmitted ? 'In review' : assignment.status)}`}>{resubmitted ? 'In review' : assignment.status}</span></div>
              <div className="feedback-review-grid">
                <div><span>OVERALL EXPERIENCE</span><p>{assignment.feedback.overall}</p></div>
                <div><span>WHAT WAS CONFUSING</span><p>{assignment.feedback.confusing}</p></div>
                <div><span>ISSUES FOUND</span><p>{assignment.feedback.issues}</p></div>
                <div><span>DEVICE DETAILS</span><p>{assignment.feedback.device}</p></div>
              </div>
              {assignment.status === 'Changes requested' && !resubmitted && (
                <div className="correction-box">
                  <label htmlFor="correction-note">Correction evidence</label>
                  <textarea id="correction-note" value={correction} onChange={(event) => setCorrection(event.target.value)} rows={4} placeholder="Describe what happened when you retried the requested step. Include the exact error or what the screenshot shows." />
                  <div><small>{correction.trim().length < 10 ? 'Add enough detail for the developer to review.' : 'Ready to resubmit this correction.'}</small><button className="button button-dark" onClick={resubmit} disabled={correction.trim().length < 10}><RotateCcw size={15} /> Resubmit correction</button></div>
                </div>
              )}
              {resubmitted && <div className="inline-success"><CheckCircle2 size={16} /><span><strong>Correction resubmitted</strong><small>The developer’s 48-hour review window restarted just now.</small></span></div>}
            </section>
          ) : (
            <section className="workspace-panel empty-work-panel">
              <LockKeyhole size={24} /><h2>{canWork ? 'Complete the contract before submitting' : 'Testing starts after access is granted'}</h2><p>{canWork ? 'Your progress and evidence form will appear here as contract tasks are completed.' : 'The private Play link will be revealed here only after the developer confirms your testing account.'}</p>
            </section>
          )}
        </div>

        <aside className="workspace-side">
          <section className="credit-hold-card">
            <span className="panel-icon"><ShieldCheck size={18} /></span><div><span>CREDIT STATUS</span><strong>{assignment.credits} credits {assignment.status === 'Approved' ? 'released' : 'held'}</strong><p>{assignment.status === 'Approved' ? 'Added to your available balance.' : 'Reserved for you while the contract is active and during review.'}</p></div>
          </section>
          <ConversationPanel threadId={`assignment-${assignment.id}`} initialMessages={assignment.messages} currentRole="tester" />
        </aside>
      </div>
    </div>
  )
}
