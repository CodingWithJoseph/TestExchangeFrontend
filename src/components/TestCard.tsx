import { Clock3, Smartphone, Users } from 'lucide-react'
import type { AvailableTest } from '../data/mockData'

export function TestCard({ test, onStart }: { test: AvailableTest; onStart?: (test: AvailableTest) => void }) {
  const percentage = Math.round((test.testerCount / test.testerGoal) * 100)

  return (
    <article className="test-card">
      <div className="test-card-top">
        <span className={`app-icon ${test.accent}`}>{test.initials}</span>
        <div className="test-title">
          <div className="title-with-badge">
            <h3>{test.name}</h3>
            {test.isNew && <span className="badge badge-new">New</span>}
          </div>
          <p>{test.developer} · {test.category}</p>
        </div>
        <span className="credit-reward">+{test.credits} cr</span>
      </div>
      <p className="test-description">{test.description}</p>
      <div className="tag-row">
        {test.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
      <div className="test-meta">
        <span><Clock3 size={15} />{test.duration}</span>
        <span><Smartphone size={15} />{test.device}</span>
      </div>
      <div className="tester-progress">
        <div className="progress-label">
          <span><Users size={15} /> {test.testerCount} of {test.testerGoal} testers</span>
          <span>{test.testerGoal - test.testerCount} spots left</span>
        </div>
        <div className="progress-track"><span style={{ width: `${percentage}%` }} /></div>
      </div>
      <button className="button button-dark button-full" onClick={() => onStart?.(test)}>View test details</button>
    </article>
  )
}
