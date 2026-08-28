import { ArrowUpRight, Clock3, MonitorCog, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Campaign } from '../api/types'
import { campaignTags, platformLabel, publishedLabel } from '../features/community/campaignPresentation'

export function CommunityTestRow({ test }: { test: Campaign }) {
  return (
    <article className="community-test-row">
      <div className="community-vitals" aria-label={`${test.reward_credits} credit reward, ${test.target_testers} tester goal`}>
        <strong>{test.reward_credits}</strong>
        <span>credits</span>
        <small>{test.target_testers} needed</small>
      </div>
      <div className="community-test-copy">
        <div className="community-test-heading">
          <span className="app-icon mint">{test.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <Link to={`/tests/${test.slug}`}><h2>{test.name}</h2></Link>
            <p>{test.name} · {test.category}</p>
          </div>
          <span className="community-status open">Open</span>
        </div>
        <p className="community-summary">{test.public_summary}</p>
        <div className="community-tags">{campaignTags(test).map((tag) => <Link key={tag} to={`/tests?tag=${encodeURIComponent(tag)}`}>{tag}</Link>)}</div>
        <div className="community-meta">
          <span><MonitorCog size={14} /> {platformLabel(test.platform)} · {test.minimum_version || 'See public requirements'}</span>
          <span><Clock3 size={14} /> Contract shown after acceptance</span>
          <span><Users size={14} /> Goal: {test.target_testers} testers</span>
          <span className="community-posted">posted {publishedLabel(test)}</span>
        </div>
      </div>
      <Link className="community-row-arrow" to={`/tests/${test.slug}`} aria-label={`View ${test.name}`}><ArrowUpRight size={18} /></Link>
    </article>
  )
}
