import { ArrowRight, BadgeCheck, CircleDollarSign, LockKeyhole, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Campaign } from '../api/types'
import { CommunityTestRow } from '../components/CommunityTestRow'
import { campaignTags } from '../features/community/campaignPresentation'

export function CommunityHomePage() {
  const api = useApi()
  const [openTests, setOpenTests] = useState<Campaign[]>([])

  useEffect(() => {
    let active = true
    void api.listPublicCampaigns().then((items) => { if (active) setOpenTests(items) }).catch(() => undefined)
    return () => { active = false }
  }, [api])

  const popularTags = useMemo(() => {
    const counts = new Map<string, number>()
    openTests.flatMap(campaignTags).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1))
    return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [openTests])

  return (
    <div className="community-home">
      <section className="community-hero">
        <div className="public-container community-hero-inner">
          <div className="community-hero-copy">
            <span className="community-kicker">A TESTING COMMUNITY FOR SOFTWARE BUILDERS</span>
            <h1>Test real software.<br />Earn your next test.</h1>
            <p>Help another builder find meaningful problems, earn credits when your work is approved, and use those credits to recruit testers for your own project.</p>
            <div className="community-hero-actions">
              <Link className="button button-dark" to="/tests">Browse open tests <ArrowRight size={17} /></Link>
              <Link className="community-text-link" to="/how-it-works">See how rewards work</Link>
            </div>
          </div>
          <aside className="community-principle-card">
            <span className="community-card-icon"><BadgeCheck size={21} /></span>
            <span className="section-kicker">THE EXCHANGE</span>
            <h2>Useful work moves credits.</h2>
            <ol>
              <li><span>1</span><p><strong>Choose a clear contract</strong>Know the reward and public requirements before joining.</p></li>
              <li><span>2</span><p><strong>Test privately</strong>Access links, evidence, and conversations stay in your workspace.</p></li>
              <li><span>3</span><p><strong>Get approved</strong>The agreed reward is released after the contract is accepted.</p></li>
            </ol>
          </aside>
        </div>
      </section>

      <section className="community-stats" aria-label="Community statistics">
        <div className="public-container">
          <div><strong>{openTests.length}</strong><span>open tests</span></div>
          <div><strong>{openTests.reduce((sum, test) => sum + test.target_testers, 0)}</strong><span>tester spots requested</span></div>
          <div><strong>{new Set(openTests.map((test) => test.platform)).size}</strong><span>active platforms</span></div>
          <div><strong>100%</strong><span>private test workspaces</span></div>
        </div>
      </section>

      <section className="public-container community-content-grid">
        <div className="community-feed">
          <div className="community-section-header">
            <div><span className="section-kicker">EARN CREDITS</span><h2>Tests that need help</h2><p>Public briefs show enough to evaluate fit. Sensitive materials unlock only after acceptance.</p></div>
            <Link to="/tests">View all tests <ArrowRight size={15} /></Link>
          </div>
          <div className="community-feed-list">
            {openTests.slice(0, 4).map((test) => <CommunityTestRow key={test.slug} test={test} />)}
          </div>
        </div>

        <aside className="community-sidebar">
          <section className="community-side-card privacy-card">
            <LockKeyhole size={19} />
            <div><h3>Private by design</h3><p>Test builds, exact tasks, evidence, findings, and direct messages are never shown on public pages.</p></div>
          </section>
          <section className="community-side-card">
            <div className="side-card-heading"><h3>Popular tags</h3><Link to="/tags">See all</Link></div>
            <div className="popular-tags">
              {popularTags.length ? popularTags.map((tag) => <Link key={tag.label} to={`/tests?tag=${encodeURIComponent(tag.label)}`}><span>{tag.label}</span><small>{tag.count}</small></Link>) : <p>Tags appear as campaigns are published.</p>}
            </div>
          </section>
          <section className="community-side-card community-cta-card">
            <span className="community-card-icon"><CircleDollarSign size={20} /></span>
            <h3>Need testers?</h3>
            <p>Define the work, choose the reward, and reserve credits before anyone joins.</p>
            <Link className="button button-outline button-full" to="/console/my-campaigns/new">Create a test request</Link>
          </section>
          <section className="community-side-card community-note-card">
            <Users size={18} /><p><strong>Community, not promotion.</strong> Requests are ranked by fit, freshness, and testing need—not by marketing reach.</p>
          </section>
        </aside>
      </section>
    </div>
  )
}
