import { ArrowDownLeft, ArrowRight, Check, Coins, Sparkles, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from '../account/AccountContext'
import { useApi } from '../api/ApiContext'
import type { CreditLedgerEntry } from '../api/types'
import { PageHeader } from '../components/PageHeader'

const packs = [
  { price: '$5', credits: 10, label: 'Starter' },
  { price: '$10', credits: 22, label: 'Builder', featured: true },
  { price: '$15', credits: 35, label: 'Launch' },
]

const ledgerLabels: Record<CreditLedgerEntry['entry_type'], string> = {
  signup_grant: 'Welcome credits',
  purchase: 'Credits purchased',
  reservation: 'Campaign reward pool',
  reward: 'Test reward',
  release: 'Reserved reward released',
  refund: 'Credits returned',
  adjustment: 'Balance adjustment',
}

export function CreditsPage() {
  const api = useApi()
  const { balance } = useAccount()
  const [entries, setEntries] = useState<CreditLedgerEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void api.getCreditLedger()
      .then((items) => { if (active) setEntries(items) })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load credit activity.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [api])

  return (
    <div className="page-stack">
      <PageHeader eyebrow="YOUR BALANCE" title="Credits" description="Earn credits by testing software or buy only what you need. No subscriptions." />
      <section className="credit-hero">
        <div><span>Available balance</span><strong>{balance}</strong><small>credits</small></div>
        <div className="credit-hero-copy"><Coins size={26} /><div><strong>Your testing has real value</strong><p>Approved testing work moves reserved credits from a developer to the tester.</p></div></div>
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
          <div className="panel-header"><h2>Credit activity</h2></div>
          {isLoading ? <div className="empty-state"><p>Loading activity…</p></div> : error ? <div className="form-error">{error}</div> : entries.length ? (
            <div className="ledger-list">
              {entries.map((item) => (
                <div className="ledger-item" key={item.id}>
                  <span className={`ledger-icon ${item.delta > 0 ? 'earned' : 'spent'}`}>{item.delta > 0 ? <ArrowDownLeft size={17} /> : <WalletCards size={17} />}</span>
                  <div><strong>{item.note || ledgerLabels[item.entry_type]}</strong><small>{new Date(item.created_at).toLocaleString()}</small></div>
                  <strong className={item.delta > 0 ? 'positive' : ''}>{item.delta > 0 ? '+' : ''}{item.delta}</strong>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>No credit activity yet.</p></div>}
        </section>
      </div>
    </div>
  )
}
