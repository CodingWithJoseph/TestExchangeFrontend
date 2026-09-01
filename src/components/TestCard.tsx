import { MonitorCog, Users } from 'lucide-react'
import type { Campaign } from '../api/types'

export function TestCard({ test, onStart }: { test: Campaign; onStart?: (test: Campaign) => void }) {
  return (
    <article className="test-card">
      <div className="test-card-top">
        <span className="app-icon mint">{test.name.slice(0, 2).toUpperCase()}</span>
        <div className="test-title">
          <div className="title-with-badge"><h3>{test.name}</h3></div>
          <p>{test.platform} · {test.category} · {test.owner_profile.display_name}</p>
        </div>
        <span className="credit-reward">+{test.reward_credits} cr</span>
      </div>
      <p className="test-description">{test.public_summary}</p>
      <div className="tag-row"><span className="tag">{test.category}</span><span className="tag">{test.platform}</span></div>
      <div className="test-meta">
        <span><MonitorCog size={15} />{test.minimum_version || 'See requirements'}</span>
        <span><Users size={15} />Goal: {test.target_testers} testers</span>
      </div>
      <button className="button button-dark button-full" onClick={() => onStart?.(test)}>View test details</button>
    </article>
  )
}
