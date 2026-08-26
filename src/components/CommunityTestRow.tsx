import { ArrowUpRight, Clock3, MonitorCog, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CommunityTest } from '../features/community/communityData'

export function CommunityTestRow({ test }: { test: CommunityTest }) {
  const spotsLeft = Math.max(test.testerGoal - test.testerCount, 0)

  return (
    <article className="community-test-row">
      <div className="community-vitals" aria-label={`${test.reward} credit reward, ${spotsLeft} spots remaining`}>
        <strong>{test.reward}</strong>
        <span>credits</span>
        <small>{spotsLeft} spots</small>
      </div>
      <div className="community-test-copy">
        <div className="community-test-heading">
          <span className={`app-icon ${test.accent}`}>{test.initials}</span>
          <div>
            <Link to={`/tests/${test.slug}`}><h2>{test.title}</h2></Link>
            <p>{test.projectName} by {test.developer}</p>
          </div>
          <span className={`community-status ${test.status.toLowerCase().replaceAll(' ', '-')}`}>{test.status}</span>
        </div>
        <p className="community-summary">{test.summary}</p>
        <div className="community-tags">{test.tags.map((tag) => <Link key={tag} to={`/tests?tag=${tag}`}>{tag}</Link>)}</div>
        <div className="community-meta">
          <span><MonitorCog size={14} /> {test.platform} · {test.environment}</span>
          <span><Clock3 size={14} /> {test.duration}</span>
          <span><Users size={14} /> {test.testerCount}/{test.testerGoal} joined</span>
          <span className="community-posted">posted {test.posted}</span>
        </div>
      </div>
      <Link className="community-row-arrow" to={`/tests/${test.slug}`} aria-label={`View ${test.projectName}`}><ArrowUpRight size={18} /></Link>
    </article>
  )
}
