import { ArrowLeft, ArrowRight, Clock3, FileCheck2, KeyRound, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { calmCardsContract, calmCardsTesters, workflowStatusClass } from '../features/testing/testingWorkflow'

const tabs = ['Testers', 'Submissions', 'Contract']

export function CampaignWorkspacePage() {
  const { campaignId } = useParams()
  const [tab, setTab] = useState('Testers')
  const [accessGranted, setAccessGranted] = useState<string[]>([])

  if (campaignId !== 'calm-cards') return <Navigate to="/console/my-campaigns" replace />

  const inReview = calmCardsTesters.filter((tester) => tester.status === 'In review').length
  const pendingAccess = calmCardsTesters.filter((tester) => tester.status === 'Access pending' && !accessGranted.includes(tester.id)).length
  const approved = calmCardsTesters.filter((tester) => tester.status === 'Approved').length

  return (
    <div className="page-stack workspace-page">
      <div className="workspace-breadcrumb"><Link to="/console/my-campaigns"><ArrowLeft size={15} /> My campaigns</Link><span>/</span><span>Calm Cards</span></div>
      <header className="workspace-hero">
        <div className="workspace-app"><span className="app-icon large peach">CC</span><div><span className="page-eyebrow">DEVELOPER WORKSPACE · ACTIVE CAMPAIGN</span><h1>Calm Cards</h1><p>Android closed test · Started Aug 7 · 11 days remaining</p></div></div>
        <div className="workspace-hero-status"><span className="status-pill active">Active</span><strong>8 of 12 testers</strong><small>16 credits reserved</small></div>
      </header>

      <div className="workspace-metrics">
        <div><span className="metric-icon green"><Users size={18} /></span><span><small>ACTIVE TESTERS</small><strong>8 / 12</strong><em>4 spots remaining</em></span></div>
        <div><span className="metric-icon orange"><FileCheck2 size={18} /></span><span><small>NEEDS REVIEW</small><strong>{inReview}</strong><em>46h left on next review</em></span></div>
        <div><span className="metric-icon blue"><KeyRound size={18} /></span><span><small>ACCESS PENDING</small><strong>{pendingAccess}</strong><em>{pendingAccess ? 'Action required' : 'All testers have access'}</em></span></div>
        <div><span className="metric-icon purple"><ShieldCheck size={18} /></span><span><small>APPROVED</small><strong>{approved}</strong><em>{approved * calmCardsContract.creditsPerTester} credits released</em></span></div>
      </div>

      <section className="action-queue">
        <div className="section-heading"><div><span className="section-kicker">ACTION QUEUE</span><h2>Keep testers moving</h2></div><small>{inReview + pendingAccess} actions need your attention</small></div>
        <div className="action-cards">
          <Link className="action-card urgent" to="/console/my-campaigns/calm-cards/submissions/maya-calm-cards"><span className="metric-icon orange"><FileCheck2 size={18} /></span><div><strong>Review Maya Chen’s submission</strong><p>All contract evidence submitted · 2 credits held</p></div><span><small>46h left</small><ArrowRight size={16} /></span></Link>
          {pendingAccess > 0 ? (
            <div className="action-card"><span className="metric-icon blue"><KeyRound size={18} /></span><div><strong>Grant Noah Williams test access</strong><p>Galaxy S24 · Android 15 · joined 18m ago</p></div><button className="button button-outline" onClick={() => setAccessGranted((current) => [...current, 'noah-williams'])}>Mark granted</button></div>
          ) : (
            <div className="action-card complete"><span className="metric-icon green"><ShieldCheck size={18} /></span><div><strong>Noah’s access is marked granted</strong><p>The tester can now open the private Play opt-in link.</p></div><span className="positive">Complete</span></div>
          )}
        </div>
      </section>

      <section className="workspace-panel campaign-roster-panel">
        <div className="workspace-tabs" role="tablist">{tabs.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}{item === 'Submissions' && <span>{inReview}</span>}</button>)}</div>

        {tab === 'Testers' && (
          <div className="roster-table">
            <div className="roster-row roster-head"><span>Tester</span><span>Progress</span><span>Last active</span><span>Status</span><span /></div>
            {calmCardsTesters.map((tester) => {
              const status = tester.id === 'noah-williams' && accessGranted.includes(tester.id) ? 'In progress' : tester.status
              return <div className="roster-row" key={tester.id}><span className="tester-cell"><span className="avatar">{tester.initials}</span><span><strong>{tester.name}</strong><small>{tester.device}</small></span></span><span data-label="Progress"><strong>{tester.sessions}</strong><small> sessions</small></span><span data-label="Last active">{tester.lastActive}</span><span data-label="Status"><span className={`status-pill ${workflowStatusClass(status)}`}>{status}</span></span><span>{tester.submissionId ? <Link className="icon-button" aria-label={`Review ${tester.name}`} to={`/console/my-campaigns/calm-cards/submissions/${tester.submissionId}`}><ArrowRight size={16} /></Link> : <button className="icon-button" aria-label={`Open ${tester.name}`}><ArrowRight size={16} /></button>}</span></div>
            })}
          </div>
        )}

        {tab === 'Submissions' && (
          <div className="submission-queue-list">
            <Link to="/console/my-campaigns/calm-cards/submissions/maya-calm-cards"><span className="avatar">MC</span><span><strong>Maya Chen</strong><small>Submitted today at 8:42 AM · 3/3 sessions · 14 days retained</small></span><span className="status-pill in-review">In review</span><strong>2 cr held</strong><ArrowRight size={16} /></Link>
            <div className="empty-list-row"><FileCheck2 size={20} /><span><strong>No other submissions need review</strong><small>Completed reviews remain visible from the tester roster.</small></span></div>
          </div>
        )}

        {tab === 'Contract' && (
          <div className="campaign-contract-view">
            <div><span>PACKAGE</span><strong>{calmCardsContract.packageName}</strong></div><div><span>TESTER FIT</span><strong>{calmCardsContract.audience}</strong></div><div><span>SCHEDULE</span><strong>{calmCardsContract.retentionDays} days · {calmCardsContract.sessionsRequired} sessions</strong></div><div><span>REVIEW WINDOW</span><strong>{calmCardsContract.reviewWindowHours} hours</strong></div>
            <section><span>LOCKED CONTRACT TASKS</span><ol>{calmCardsContract.tasks.map((task) => <li key={task}>{task}</li>)}</ol></section>
          </div>
        )}
      </section>
    </div>
  )
}
