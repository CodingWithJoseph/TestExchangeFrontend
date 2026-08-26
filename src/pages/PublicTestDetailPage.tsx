import { ArrowLeft, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, LockKeyhole, MonitorCog, ShieldCheck, Users } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getCommunityTest } from '../features/community/communityData'
import { usePageMetadata } from '../features/community/usePageMetadata'

export function PublicTestDetailPage() {
  const { testSlug = '' } = useParams()
  const test = getCommunityTest(testSlug)

  if (!test) return <Navigate to="/tests" replace />

  return <PublicTestDetail testSlug={testSlug} />
}

function PublicTestDetail({ testSlug }: { testSlug: string }) {
  const test = getCommunityTest(testSlug)!
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const spotsLeft = Math.max(test.testerGoal - test.testerCount, 0)

  usePageMetadata(test.title, test.summary, true)

  const requestSpot = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    navigate(`/console/available-tests?test=${test.slug}`)
  }

  return (
    <div className="test-detail-page">
      <div className="public-container test-detail-breadcrumb"><Link to="/tests"><ArrowLeft size={14} /> All tests</Link><span>/</span><span>{test.platform}</span></div>

      <header className="test-detail-header">
        <div className="public-container test-detail-header-inner">
          <div className="test-detail-title-block">
            <div className="test-detail-project"><span className={`app-icon large ${test.accent}`}>{test.initials}</span><div><span>{test.projectName}</span><small>{test.developer} · {test.developerReputation} reputation</small></div></div>
            <h1>{test.title}</h1>
            <p>{test.summary}</p>
            <div className="community-tags">{test.tags.map((tag) => <Link key={tag} to={`/tests?tag=${tag}`}>{tag}</Link>)}</div>
          </div>
          <div className="test-detail-reward">
            <span>REWARD PER APPROVED TEST</span>
            <strong>{test.reward} <small>credits</small></strong>
            <p>{spotsLeft} of {test.testerGoal} spots remaining</p>
          </div>
        </div>
      </header>

      <div className="public-container test-detail-layout">
        <article className="test-detail-content">
          <section className="detail-section">
            <span className="section-kicker">PUBLIC BRIEF</span>
            <h2>What the developer wants to learn</h2>
            <p>{test.publicObjective}</p>
            <div className="public-scope-note"><ShieldCheck size={18} /><div><strong>This is the owner-approved public scope.</strong><p>Exact test steps, build access, submissions, findings, and conversations stay private between the developer and accepted testers.</p></div></div>
          </section>

          <section className="detail-section">
            <span className="section-kicker">FIT CHECK</span>
            <h2>Can you take this test?</h2>
            <div className="detail-facts">
              <div><MonitorCog size={18} /><span><small>PLATFORM & ENVIRONMENT</small><strong>{test.platform}</strong><p>{test.environment}</p></span></div>
              <div><Clock3 size={18} /><span><small>EXPECTED EFFORT</small><strong>{test.duration}</strong><p>{test.retentionDays ? `Includes a ${test.retentionDays}-day participation period` : 'Complete within the campaign window'}</p></span></div>
              <div><CalendarDays size={18} /><span><small>REQUEST DEADLINE</small><strong>{test.deadline}</strong><p>Availability may close when all spots fill</p></span></div>
            </div>
            <h3>Public requirements</h3>
            <ul className="requirement-list">{test.requirements.map((requirement) => <li key={requirement}><CheckCircle2 size={16} />{requirement}</li>)}</ul>
          </section>

          <section className="detail-section detail-privacy-section">
            <LockKeyhole size={21} />
            <div><span className="section-kicker">PRIVACY BOUNDARY</span><h2>Testing happens in a private workspace.</h2><p>Joining never exposes the owner’s private build or your feedback to the public community. A completed campaign may show participation totals, but findings stay private unless the owner separately publishes their own case study.</p></div>
          </section>
        </article>

        <aside className="test-detail-sidebar">
          <section className="join-test-card">
            <span className={`community-status ${test.status.toLowerCase().replaceAll(' ', '-')}`}>{test.status}</span>
            <h2>Request a tester spot</h2>
            <p>Review the private contract before accepting. The developer’s credits are already reserved for approved work.</p>
            <div className="join-reward-line"><CircleDollarSign size={18} /><span><strong>Earn {test.reward} credits</strong><small>after contract approval</small></span></div>
            <button className="button button-dark button-full" onClick={requestSpot}>{user ? 'Continue in workspace' : 'Sign in to request a spot'}</button>
            <small className="join-card-note"><LockKeyhole size={13} /> Private details appear only after acceptance.</small>
          </section>
          <section className="developer-summary-card">
            <span className="section-kicker">POSTED BY</span>
            <div><span className="avatar">{test.developer.slice(0, 2).toUpperCase()}</span><span><strong>{test.developer}</strong><small>@{test.developerHandle}</small></span></div>
            <dl><div><dt>Reputation</dt><dd>{test.developerReputation}</dd></div><div><dt>Campaign status</dt><dd>{test.status}</dd></div><div><dt>Joined testers</dt><dd><Users size={13} /> {test.testerCount}</dd></div></dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
