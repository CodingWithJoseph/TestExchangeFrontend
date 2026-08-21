import { ArrowDownLeft, ArrowRight, Check, Coins, Sparkles, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { creditActivity } from '../data/mockData'

const packs = [
  { price: '$5', credits: 10, label: 'Starter' },
  { price: '$10', credits: 22, label: 'Builder', featured: true },
  { price: '$15', credits: 35, label: 'Launch' },
]

export function CreditsPage() {
  return (
    <div className="page-stack">
      <PageHeader eyebrow="YOUR BALANCE" title="Credits" description="Earn credits by testing apps or buy only what you need. No subscriptions." />
      <section className="credit-hero">
        <div><span>Available balance</span><strong>24</strong><small>credits</small></div>
        <div className="credit-hero-copy"><Coins size={26} /><div><strong>Your testing has real value</strong><p>One more completed test can fund one or two new testers for your own campaign.</p></div></div>
        <Link className="button button-light" to="/console/available-tests">Earn credits <ArrowRight size={16} /></Link>
      </section>
      <div className="credits-layout">
        <section>
          <div className="section-heading"><div><span className="section-kicker">PAY AS YOU GO</span><h2>Credit packs</h2><p>One-time purchases for when you need testers sooner.</p></div><span className="coming-soon">Payments coming soon</span></div>
          <div className="packs-grid">
            {packs.map((pack) => (
              <article className={`pack-card ${pack.featured ? 'featured' : ''}`} key={pack.price}>
                {pack.featured && <span className="popular-label"><Sparkles size={13} /> POPULAR</span>}
                <span>{pack.label}</span>
                <strong>{pack.price}</strong>
                <p>{pack.credits} credits</p>
                <ul><li><Check size={15} /> One-time payment</li><li><Check size={15} /> Credits don’t expire</li></ul>
                <button className="button button-outline button-full" disabled>Coming soon</button>
              </article>
            ))}
          </div>
        </section>
        <section className="panel ledger-panel">
          <div className="panel-header"><h2>Credit activity</h2><button className="text-button">View all</button></div>
          <div className="ledger-list">
            {creditActivity.map((item) => (
              <div className="ledger-item" key={item.id}>
                <span className={`ledger-icon ${item.amount > 0 ? 'earned' : 'spent'}`}>{item.amount > 0 ? <ArrowDownLeft size={17} /> : <WalletCards size={17} />}</span>
                <div><strong>{item.label}</strong><small>{item.date}</small></div>
                <strong className={item.amount > 0 ? 'positive' : ''}>{item.amount > 0 ? '+' : ''}{item.amount}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
