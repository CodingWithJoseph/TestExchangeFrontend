import { CheckCircle2, Gavel, ListPlus, ShieldAlert, UserCheck, UserX, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import type { Dispute, ModerationCase, ModerationParticipant, WaitlistEntry } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { formatDate } from '../features/testing/workflowFormat'

type ResolutionAction = 'award_tester' | 'uphold_rejection'

export function ModerationPage() {
  const api = useApi()
  const { user } = useAuth()
  const { isModerator, refreshAccount } = useAccount()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [participants, setParticipants] = useState<ModerationParticipant[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [section, setSection] = useState<'disputes' | 'participants' | 'waitlist'>('disputes')
  const [selectedCase, setSelectedCase] = useState<ModerationCase | null>(null)
  const [resolution, setResolution] = useState('')
  const [resolutionAction, setResolutionAction] = useState<ResolutionAction>('award_tester')
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadQueue = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [items, participantItems, waitlistItems] = await Promise.all([
        api.listModerationDisputes(),
        api.listModerationParticipants(),
        api.listModerationWaitlist(),
      ])
      setDisputes(items)
      setParticipants(participantItems)
      setWaitlist(waitlistItems)
      if (selectedCase) {
        setSelectedCase(await api.getModerationCase(selectedCase.dispute.id))
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load moderation cases.')
    } finally {
      setIsLoading(false)
    }
  }, [api, selectedCase])

  useEffect(() => { void loadQueue() }, [api]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isModerator) return <Navigate to="/console" replace />

  const openCase = async (disputeId: string) => {
    setError(null)
    try {
      setSelectedCase(await api.getModerationCase(disputeId))
      setResolution('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to open this case.')
    }
  }

  const claim = async () => {
    if (!selectedCase || saving) return
    setSaving(true)
    setError(null)
    try {
      await api.claimDispute(selectedCase.dispute.id)
      setSelectedCase(await api.getModerationCase(selectedCase.dispute.id))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to claim this case.')
    } finally {
      setSaving(false)
    }
  }

  const resolve = async () => {
    if (!selectedCase || resolution.trim().length < 20 || saving) return
    setSaving(true)
    setError(null)
    try {
      await api.resolveDispute(
        selectedCase.dispute.id,
        resolutionAction === 'award_tester' ? 'resolved' : 'rejected',
        resolutionAction === 'award_tester' ? 'award_tester' : 'none',
        resolution.trim(),
      )
      await Promise.all([loadQueue(), refreshAccount()])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to resolve this case.')
    } finally {
      setSaving(false)
    }
  }

  const assignedToCurrentModerator = selectedCase?.dispute.assigned_to === user?.id

  const setParticipantAccess = async (participant: ModerationParticipant) => {
    if (saving) return
    let reason = ''
    if (!participant.is_suspended) {
      reason = window.prompt('Why is this participant being suspended? This is recorded in the audit trail.')?.trim() || ''
      if (reason.length < 10) {
        if (reason) setError('Suspension reasons must be at least 10 characters.')
        return
      }
      if (!window.confirm(`Suspend ${participant.display_name}? They will immediately lose API access.`)) return
    } else if (!window.confirm(`Restore access for ${participant.display_name}?`)) return
    setSaving(true)
    setError(null)
    try {
      if (participant.is_suspended) await api.restoreParticipant(participant.id)
      else await api.suspendParticipant(participant.id, reason)
      await loadQueue()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update this participant.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <PageHeader eyebrow="TRUST & SAFETY" title="Beta moderation" description="Resolve disputes, suspend participant access, and review demand beyond the public-beta cap." />
      {error && <div className="form-error">{error}</div>}
      <div className="workspace-tabs moderation-tabs" role="tablist">
        <button role="tab" aria-selected={section === 'disputes'} className={section === 'disputes' ? 'active' : ''} onClick={() => setSection('disputes')}><Gavel size={16} /> Disputes <span>{disputes.length}</span></button>
        <button role="tab" aria-selected={section === 'participants'} className={section === 'participants' ? 'active' : ''} onClick={() => setSection('participants')}><Users size={16} /> Participants <span>{participants.length}</span></button>
        <button role="tab" aria-selected={section === 'waitlist'} className={section === 'waitlist' ? 'active' : ''} onClick={() => setSection('waitlist')}><ListPlus size={16} /> Waitlist <span>{waitlist.length}</span></button>
      </div>
      {section === 'participants' && <section className="panel moderation-directory">
        <div className="panel-header"><div><h2>Participant access</h2><small>Suspension blocks authenticated API access without deleting history.</small></div><span>{participants.length}</span></div>
        {participants.map((participant) => <div className="moderation-directory-row" key={participant.id}><span className="avatar">{participant.display_name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span><span><strong>{participant.display_name}</strong><small>@{participant.username} · {participant.email || 'No email'} · joined {formatDate(participant.created_at)}</small>{participant.suspension_reason && <em>{participant.suspension_reason}</em>}</span><span className={`status-pill ${participant.is_suspended ? 'rejected' : 'approved'}`}>{participant.is_suspended ? 'suspended' : 'active'}</span><button className={`button ${participant.is_suspended ? 'button-outline' : 'button-danger'}`} disabled={saving || participant.id === user?.id} onClick={() => void setParticipantAccess(participant)}>{participant.is_suspended ? <UserCheck size={15} /> : <UserX size={15} />}{participant.is_suspended ? 'Restore' : participant.id === user?.id ? 'Current moderator' : 'Suspend'}</button></div>)}
      </section>}
      {section === 'waitlist' && <section className="panel moderation-directory">
        <div className="panel-header"><div><h2>Public-beta waitlist</h2><small>Emails are collected when registration is paused or the cohort is full.</small></div><span>{waitlist.length}</span></div>
        {waitlist.length ? waitlist.map((entry, index) => <div className="moderation-directory-row waitlist-row" key={entry.id}><span>{index + 1}</span><span><strong>{entry.email}</strong><small>Joined {formatDate(entry.created_at)}</small></span></div>) : <div className="empty-state"><CheckCircle2 size={25} /><h2>No one is waiting</h2><p>The current public-beta cohort still has room.</p></div>}
      </section>}
      {section === 'disputes' &&
      <div className="moderation-layout">
        <section className="panel moderation-queue">
          <div className="panel-header"><h2>Cases</h2><span>{disputes.length}</span></div>
          {isLoading && !disputes.length ? <div className="empty-state"><p>Loading cases…</p></div> : disputes.length ? disputes.map((dispute) => (
            <button className={selectedCase?.dispute.id === dispute.id ? 'selected' : ''} key={dispute.id} onClick={() => void openCase(dispute.id)}>
              <Gavel size={17} /><span><strong>{dispute.reason}</strong><small>{formatDate(dispute.created_at)}</small></span><span className={`status-pill ${dispute.status.replaceAll('_', '-')}`}>{dispute.status.replaceAll('_', ' ')}</span>
            </button>
          )) : <div className="empty-state"><CheckCircle2 size={25} /><h2>Queue clear</h2><p>No disputes need review.</p></div>}
        </section>

        <section className="panel moderation-case">
          {!selectedCase ? <div className="empty-state"><Gavel size={27} /><h2>Select a case</h2><p>Open a dispute to compare the rejection with the locked contract and evidence.</p></div> : <>
            <div className="panel-header"><div><span className="section-kicker">{selectedCase.campaign.name}</span><h2>{selectedCase.assignment.tester_profile.display_name}</h2><small>@{selectedCase.assignment.tester_profile.username}</small></div><span className={`status-pill ${selectedCase.dispute.status.replaceAll('_', '-')}`}>{selectedCase.dispute.status.replaceAll('_', ' ')}</span></div>
            <div className="brief-box"><strong>Tester’s dispute</strong><p>{selectedCase.dispute.reason}</p></div>
            <div className="campaign-contract-view"><section><span>LOCKED CONTRACT TASKS</span><ol>{selectedCase.contract.tasks.map((task) => <li key={task.id}><strong>{task.title}</strong><p>{task.instructions}</p></li>)}</ol></section></div>
            {selectedCase.submissions.map((submission) => <section className="moderation-submission" key={submission.id}><strong>Submission version {submission.version}</strong><p>{submission.summary}</p>{submission.items.map((item) => <div key={item.id}>{item.note || item.external_url || item.storage_key}</div>)}</section>)}
            {selectedCase.reviews.map((review) => <div className="review-outcome escalated" key={review.id}><ShieldAlert size={18} /><div><strong>Owner decision: {review.decision.replaceAll('_', ' ')}</strong><p>{review.notes}</p></div></div>)}

            {selectedCase.dispute.status === 'open' && <button className="button button-dark" disabled={saving} onClick={() => void claim()}>{saving ? 'Claiming…' : 'Claim this case'}</button>}
            {selectedCase.dispute.status === 'under_review' && assignedToCurrentModerator && <div className="decision-form">
              <div className="moderation-actions">
                <label className={`decision-button approve ${resolutionAction === 'award_tester' ? 'selected' : ''}`}><input type="radio" checked={resolutionAction === 'award_tester'} onChange={() => setResolutionAction('award_tester')} /><CheckCircle2 size={18} /><span><strong>Award tester</strong><small>Approve work and issue the promised reward once</small></span></label>
                <label className={`decision-button danger ${resolutionAction === 'uphold_rejection' ? 'selected' : ''}`}><input type="radio" checked={resolutionAction === 'uphold_rejection'} onChange={() => setResolutionAction('uphold_rejection')} /><ShieldAlert size={18} /><span><strong>Uphold rejection</strong><small>No credit movement</small></span></label>
              </div>
              <label>Moderator resolution<textarea rows={5} value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Reference the locked task, evidence, and reason for the final outcome." /></label>
              <small>{resolution.trim().length < 20 ? 'Write at least 20 characters.' : 'This explanation is final and visible to both participants.'}</small>
              <button className="button button-dark" disabled={resolution.trim().length < 20 || saving} onClick={() => void resolve()}>{saving ? 'Resolving…' : 'Record final resolution'}</button>
            </div>}
            {selectedCase.dispute.status === 'under_review' && !assignedToCurrentModerator && <div className="workspace-notice warning"><ShieldAlert size={18} /><div><strong>Claimed by another moderator</strong><p>This case is read-only for you.</p></div></div>}
            {['resolved', 'rejected'].includes(selectedCase.dispute.status) && <div className="brief-box"><strong>{selectedCase.dispute.remedy === 'award_tester' ? 'Tester awarded' : 'Case closed'}</strong><p>{selectedCase.dispute.resolution}</p></div>}
          </>}
        </section>
      </div>}
    </div>
  )
}
