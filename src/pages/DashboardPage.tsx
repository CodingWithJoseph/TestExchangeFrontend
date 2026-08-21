import { ArrowRight, BadgeDollarSign, CircleCheckBig, FlaskConical, Rocket, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { activity, availableTests } from '../data/mockData'

export function DashboardPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="FRIDAY, AUGUST 21"
        title="Good morning, Joseph"
        description="Keep testing real apps to earn credits and move your campaign forward."
        action={<Link className="button button-dark" to="/console/available-tests"><FlaskConical size={17} /> Find a test</Link>}
      />

      <section className="stats-grid" aria-label="Account overview">
        <StatCard label="Available credits" value="24" detail="Enough for 12 testers" icon={BadgeDollarSign} tone="green" />
        <StatCard label="Tests completed" value="7" detail="3 approved this month" icon={CircleCheckBig} tone="purple" />
        <StatCard label="Active campaigns" value="1" detail="Calm Cards · 8/12" icon={Rocket} tone="orange" />
        <StatCard label="Testers helped" value="19" detail="Across 7 apps" icon={Users} tone="blue" />
      </section>

      <div className="dashboard-grid">
        <section className="panel campaign-focus">
          <div className="panel-header">
            <div>
              <span className="section-kicker">ACTIVE CAMPAIGN</span>
              <h2>Calm Cards</h2>
            </div>
            <span className="badge badge-active"><span /> On track</span>
          </div>
          <p className="muted">Android closed test · Started Aug 18</p>
          <div className="campaign-number-row">
            <div><strong>8</strong><span>testers joined</span></div>
            <div><strong>4</strong><span>still needed</span></div>
            <div><strong>11</strong><span>days remaining</span></div>
          </div>
          <div className="segment-progress" aria-label="8 of 12 testers joined">
            {Array.from({ length: 12 }).map((_, index) => <span className={index < 8 ? 'filled' : ''} key={index} />)}
          </div>
          <div className="focus-footer">
            <span>Keep 12 testers opted in for the full campaign period.</span>
            <Link to="/console/my-campaigns">Manage campaign <ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className="panel activity-panel">
          <div className="panel-header">
            <h2>Recent activity</h2>
            <Link to="/console/my-tests">View all</Link>
          </div>
          <div className="activity-list">
            {activity.map((item) => (
              <div className="activity-item" key={item.id}>
                <span className={`activity-dot ${item.tone}`} />
                <div><strong>{item.label}</strong><p>{item.detail}</p></div>
                <time>{item.time}</time>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="section-heading">
          <div><span className="section-kicker">EARN CREDITS</span><h2>Tests ready for you</h2></div>
          <Link to="/console/available-tests">Browse all tests <ArrowRight size={15} /></Link>
        </div>
        <div className="quick-tests-grid">
          {availableTests.slice(0, 3).map((test) => (
            <Link to="/console/available-tests" className="quick-test" key={test.id}>
              <span className={`app-icon ${test.accent}`}>{test.initials}</span>
              <div><strong>{test.name}</strong><span>{test.duration} · {test.tags[0]}</span></div>
              <span className="credit-reward">+{test.credits}</span>
              <ArrowRight className="quick-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
