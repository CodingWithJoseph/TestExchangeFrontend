import { ArrowLeft, CheckCircle2, CircleDollarSign, LockKeyhole, MonitorCog, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Campaign } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { campaignTags, platformLabel, requirementsList } from '../features/community/campaignPresentation'
import { usePageMetadata } from '../features/community/usePageMetadata'

export function PublicTestDetailPage() {
  const { testSlug = '' } = useParams()
  const api = useApi()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [test, setTest] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  usePageMetadata(test?.name || 'Test request', test?.public_summary || 'Review a public software testing request.', true)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    void api.getPublicCampaign(testSlug)
      .then((campaign) => { if (active) setTest(campaign) })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load this test.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [api, testSlug])

  const requestSpot = () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    navigate(`/console/available-tests?test=${test?.slug}`)
  }

  if (isLoading) return <div className="community-empty-state"><p>Loading test request…</p></div>
  if (error || !test) return <div className="community-empty-state"><h2>Couldn’t open this test</h2><p>{error || 'Test not found.'}</p><Link className="button button-outline" to="/tests">Back to all tests</Link></div>

  const requirements = requirementsList(test)

  return (
    <div className="test-detail-page">
      <div className="public-container test-detail-breadcrumb"><Link to="/tests"><ArrowLeft size={14} /> All tests</Link><span>/</span><span>{platformLabel(test.platform)}</span></div>

      <header className="test-detail-header">
        <div className="public-container test-detail-header-inner">
          <div className="test-detail-title-block">
            <div className="test-detail-project"><span className="app-icon large mint">{test.name.slice(0, 2).toUpperCase()}</span><div><span>{test.name}</span><small>{test.category} software test</small></div></div>
            <h1>{test.name}</h1>
            <p>{test.public_summary}</p>
            <div className="community-tags">{campaignTags(test).map((tag) => <Link key={tag} to={`/tests?tag=${encodeURIComponent(tag)}`}>{tag}</Link>)}</div>
          </div>
          <div className="test-detail-reward">
            <span>REWARD PER APPROVED TEST</span>
            <strong>{test.reward_credits} <small>credits</small></strong>
            <p>Campaign goal: {test.target_testers} testers</p>
          </div>
        </div>
      </header>

      <div className="public-container test-detail-layout">
        <article className="test-detail-content">
          <section className="detail-section">
            <span className="section-kicker">PUBLIC BRIEF</span>
            <h2>What the developer wants tested</h2>
            <p>{test.public_summary}</p>
            <div className="public-scope-note"><ShieldCheck size={18} /><div><strong>This is the owner-approved public scope.</strong><p>Exact test steps, build access, submissions, findings, and conversations stay private between the developer and accepted testers.</p></div></div>
          </section>

          <section className="detail-section">
            <span className="section-kicker">FIT CHECK</span>
            <h2>Can you take this test?</h2>
            <div className="detail-facts">
              <div><MonitorCog size={18} /><span><small>PLATFORM</small><strong>{platformLabel(test.platform)}</strong><p>{test.minimum_version || 'See public requirements'}</p></span></div>
              <div><Users size={18} /><span><small>TESTER GOAL</small><strong>{test.target_testers} testers</strong><p>Availability closes when the campaign is filled or paused</p></span></div>
            </div>
            <h3>Public requirements</h3>
            <ul className="requirement-list">{requirements.map((requirement) => <li key={requirement}><CheckCircle2 size={16} />{requirement}</li>)}</ul>
          </section>

          <section className="detail-section detail-privacy-section">
            <LockKeyhole size={21} />
            <div><span className="section-kicker">PRIVACY BOUNDARY</span><h2>Testing happens in a private workspace.</h2><p>Private builds, exact instructions, evidence, findings, and messages are visible only to the campaign owner and accepted tester.</p></div>
          </section>
        </article>

        <aside className="test-detail-sidebar">
          <section className="join-test-card">
            <span className="community-status open">Open</span>
            <h2>Request a tester spot</h2>
            <p>The developer’s credits are reserved before the campaign opens. If accepted, review the locked private contract before you begin.</p>
            <div className="join-reward-line"><CircleDollarSign size={18} /><span><strong>Earn {test.reward_credits} credits</strong><small>after your submission is approved</small></span></div>
            <button className="button button-dark button-full" onClick={requestSpot}>{user ? 'Continue in workspace' : 'Sign in to request a spot'}</button>
            <small className="join-card-note"><LockKeyhole size={13} /> Private details appear only after acceptance.</small>
          </section>
        </aside>
      </div>
    </div>
  )
}
