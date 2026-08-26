import { ArrowRight, CheckCircle2, CircleDollarSign, ClipboardCheck, LockKeyhole, Scale, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMetadata } from '../features/community/usePageMetadata'

export function HowItWorksPage() {
  usePageMetadata('How TestExchange works', 'Learn how private testing contracts and credit rewards work on TestExchange.')

  return (
    <div className="simple-public-page how-page">
      <header className="simple-public-hero how-hero">
        <div className="public-container"><span className="community-kicker">CLEAR WORK. FAIR REWARDS.</span><h1>A testing exchange—not an install swap.</h1><p>Every reward is attached to a defined testing contract. Testers know what counts before joining, and developers review only against those agreed requirements.</p><Link className="button button-dark" to="/tests">Browse open tests <ArrowRight size={16} /></Link></div>
      </header>
      <div className="public-container how-content">
        <section className="how-steps">
          <article><span><Search size={20} /></span><small>01</small><h2>Find a good fit</h2><p>Browse public briefs by platform, environment, effort, and reward. Sensitive project details remain hidden.</p></article>
          <article><span><ClipboardCheck size={20} /></span><small>02</small><h2>Accept the contract</h2><p>Review exact tasks and evidence requirements privately. Requirements cannot be added after you join.</p></article>
          <article><span><CheckCircle2 size={20} /></span><small>03</small><h2>Submit useful work</h2><p>Complete the requested sessions and provide specific, truthful feedback through your private workspace.</p></article>
          <article><span><CircleDollarSign size={20} /></span><small>04</small><h2>Earn the reward</h2><p>Approval releases the fixed credit reward. Use those credits to fund testing for your own software.</p></article>
        </section>
        <section className="how-principles">
          <div><LockKeyhole size={24} /><h2>Private by default</h2><p>Build access, test instructions, evidence, findings, and direct communication stay inside the campaign workspace.</p></div>
          <div><Scale size={24} /><h2>A contract—not a guarantee</h2><p>Credits reward completed testing work. They never purchase positive feedback, store approval, ratings, or public promotion.</p></div>
        </section>
      </div>
    </div>
  )
}
