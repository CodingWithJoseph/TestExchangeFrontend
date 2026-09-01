import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const supportEmail = (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined)?.trim()

function PolicyPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <div className="public-container policy-page">
    <header><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>Effective September 1, 2026 · Public beta</p></header>
    <article className="policy-card">{children}</article>
  </div>
}

export function TermsPage() {
  return <PolicyPage eyebrow="LEGAL" title="Beta terms of use">
    <h2>1. The beta service</h2>
    <p>TestExchange coordinates private, contract-based software testing between campaign owners and testers. The service is experimental, may change, and may contain defects. You must be legally able to enter this agreement and use only software and test materials you are authorized to access.</p>
    <h2>2. Accounts and truthful participation</h2>
    <p>Keep your account secure and provide accurate profile, campaign, testing, and evidence information. One person may not create or coordinate duplicate accounts to obtain extra credits, campaign capacity, or rewards. We may suspend access to protect participants or investigate misuse.</p>
    <h2>3. Campaign contracts and credits</h2>
    <p>A campaign’s testing contract locks when the campaign is published. Publishing credits are spent at publication and are not refunded by pausing or closing recruitment. Credits are closed-loop participation units: they are not money, cannot be redeemed for cash, transferred outside TestExchange, or treated as stored value. Rewards are issued only for approved work or a moderator-awarded dispute.</p>
    <h2>4. Testing outcomes</h2>
    <p>Owners remain responsible for their software, access instructions, review decisions, and compliance with app-store or platform rules. TestExchange records participation and evidence, but does not guarantee installs, reviews, ratings, production approval, marketplace acceptance, bug discovery, or any particular result.</p>
    <h2>5. Content and privacy</h2>
    <p>You retain ownership of your content and give TestExchange the limited permission needed to host, process, display, and moderate it to operate the service. Do not upload secrets or personal data that are unnecessary for the test. Public campaign briefs and public profile fields can be seen by anyone; private contracts, evidence, and messages are limited to relevant participants and authorized moderators.</p>
    <h2>6. Disputes and service changes</h2>
    <p>Testers may dispute an explicit rejection. A moderator may review the locked contract, evidence, messages, and audit history and may uphold the rejection or award the tester once. We may change, limit, or discontinue beta features and will use reasonable care to preserve active work.</p>
    <h2>7. Warranty and liability</h2>
    <p>The beta is provided “as is” and “as available” to the extent permitted by law. TestExchange is not responsible for third-party software, lost marketplace opportunities, or indirect or consequential loss. Nothing here excludes rights or liability that cannot legally be excluded.</p>
    <p>Also read the <Link to="/acceptable-use">Acceptable Use Policy</Link> and <Link to="/privacy">Privacy Notice</Link>.</p>
  </PolicyPage>
}

export function PrivacyPage() {
  return <PolicyPage eyebrow="PRIVACY" title="Privacy notice">
    <h2>What we collect</h2>
    <p>We process account identifiers, email address, public profile fields, authentication records, campaign and contract data, applications, messages, testing sessions, evidence, reviews, disputes, credit ledger entries, notifications, and security or request logs.</p>
    <h2>How we use it</h2>
    <p>We use this information to authenticate users, enforce the beta capacity, operate campaigns, keep an audit trail, issue credits, investigate disputes or abuse, secure the service, provide support, and improve beta reliability. We do not sell personal information.</p>
    <h2>Visibility and service providers</h2>
    <p>Public profiles and published campaign briefs are public. Private testing materials are available to the campaign participants and, when necessary, authorized moderators. Authentication, database, storage, hosting, monitoring, and email providers process data for us under their service terms.</p>
    <h2>Retention and deletion</h2>
    <p>We retain records while your account is active and as needed for campaign history, credit integrity, disputes, security, and legal obligations. Evidence should contain only what the locked task requires. You may request access, correction, export, or account deletion through <Link to="/support">Support</Link>. Some audit, fraud-prevention, transaction, or dispute records may be retained when necessary.</p>
    <h2>Security and international processing</h2>
    <p>We use access controls and private storage for non-public test materials, but no online system is risk-free. Data may be processed where our service providers operate, subject to applicable safeguards.</p>
    <h2>Questions</h2>
    <p>Use the contact listed on the <Link to="/support">Support page</Link>. We may update this notice as the beta changes and will post the effective date here.</p>
  </PolicyPage>
}

export function AcceptableUsePage() {
  return <PolicyPage eyebrow="SAFETY" title="Acceptable use policy">
    <h2>Use TestExchange for genuine testing</h2>
    <p>Campaigns must ask for specific, observable software testing work and truthful evidence. They may not require a public rating, public review, testimonial, social post, referral, ad engagement, purchase, install-only action, account farming, or a predetermined positive outcome.</p>
    <h2>Protect people and systems</h2>
    <p>Do not test software without authorization; distribute malware; attempt to bypass security; scrape or overload the service; impersonate others; harass participants; infringe intellectual property; expose credentials; or upload unnecessary personal, financial, health, biometric, or other sensitive data.</p>
    <h2>Keep evidence honest</h2>
    <p>Do not fabricate sessions, reuse another person’s evidence, coordinate duplicate accounts, manipulate credits, or conceal a conflict of interest. Owners may request corrections tied to the locked contract, but may not add requirements after publication or retaliate against good-faith findings.</p>
    <h2>Enforcement</h2>
    <p>We may remove campaigns, restrict content, suspend accounts, preserve relevant audit information, or cooperate with lawful requests. Report suspected abuse through <Link to="/support">Support</Link>.</p>
  </PolicyPage>
}

export function SupportPage() {
  return <PolicyPage eyebrow="HELP" title="Beta support">
    <h2>Contact</h2>
    {supportEmail ? <p>Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> with your account email and a short description. Do not email passwords, private build credentials, or unnecessary evidence files.</p> : <p className="form-error">The beta support address must be configured before public launch.</p>}
    <h2>Account and privacy requests</h2>
    <p>Use the subject “Account request” for profile correction, data export, or account deletion. We may need to verify that the request comes from the account owner. Transaction, audit, security, or dispute records may need to be retained.</p>
    <h2>Campaign or safety issues</h2>
    <p>For an active campaign, include the campaign or assignment ID and explain whether the issue concerns access, evidence, review, credits, or participant safety. Use the in-product dispute flow only after submitted work has been explicitly rejected.</p>
    <h2>Beta expectations</h2>
    <p>Support is handled manually during the beta and no response-time guarantee is offered yet. Urgent security reports should be clearly marked “Security.”</p>
  </PolicyPage>
}
