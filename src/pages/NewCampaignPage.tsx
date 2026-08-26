import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  ExternalLink,
  GripVertical,
  Info,
  LoaderCircle,
  MonitorCog,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  createCampaignDraft,
  loadCampaignDraft,
  saveCampaignDraft,
  type CampaignDraft,
  type CampaignEvidence,
  type CampaignPlatform,
} from '../features/campaigns/campaignDraft'

const steps = [
  { id: 1, label: 'Project & audience', shortLabel: 'Project' },
  { id: 2, label: 'Testing contract', shortLabel: 'Contract' },
  { id: 3, label: 'Evidence & credits', shortLabel: 'Credits' },
  { id: 4, label: 'Review', shortLabel: 'Review' },
]

const categories = ['Productivity', 'Finance', 'Health & fitness', 'Education', 'Travel', 'Lifestyle', 'Tools', 'Other']
const platforms: CampaignPlatform[] = ['Android', 'iOS', 'Web', 'Desktop', 'API']
const packageNamePattern = /^([a-zA-Z]\w*\.)+[a-zA-Z]\w*$/
const webUrlPattern = /^https?:\/\//

const platformFields: Record<CampaignPlatform, { identifierLabel: string; identifierPlaceholder: string; identifierHelp: string; accessLabel: string; accessPlaceholder: string; environmentLabel: string; environments: string[] }> = {
  Android: { identifierLabel: 'Package name', identifierPlaceholder: 'com.example.myapp', identifierHelp: 'Must match the package in Play Console.', accessLabel: 'Google Play closed-test opt-in link', accessPlaceholder: 'https://play.google.com/apps/testing/com.example.myapp', environmentLabel: 'Minimum Android version', environments: ['Android 9+', 'Android 10+', 'Android 11+', 'Android 12+', 'Android 13+', 'Android 14+'] },
  iOS: { identifierLabel: 'Bundle identifier', identifierPlaceholder: 'com.example.myapp', identifierHelp: 'Optional identifier for the TestFlight build.', accessLabel: 'Private TestFlight invitation link', accessPlaceholder: 'https://testflight.apple.com/join/example', environmentLabel: 'Minimum iOS version', environments: ['iOS 16+', 'iOS 17+', 'iOS 18+'] },
  Web: { identifierLabel: 'Build or environment', identifierPlaceholder: 'staging · v0.8', identifierHelp: 'Optional label that helps identify the tested build.', accessLabel: 'Private test URL', accessPlaceholder: 'https://staging.example.com', environmentLabel: 'Supported browsers', environments: ['Modern browsers', 'Chrome or Edge', 'Safari', 'Firefox'] },
  Desktop: { identifierLabel: 'Build or version', identifierPlaceholder: 'v0.8.0-beta', identifierHelp: 'Optional label for the downloadable build.', accessLabel: 'Private download or access link', accessPlaceholder: 'https://example.com/private-build', environmentLabel: 'Supported operating systems', environments: ['Windows 11+', 'macOS 14+', 'Windows and macOS', 'Linux'] },
  API: { identifierLabel: 'API version', identifierPlaceholder: 'v1 staging', identifierHelp: 'Optional version or environment identifier.', accessLabel: 'Documentation or test endpoint', accessPlaceholder: 'https://api.example.com/docs', environmentLabel: 'Required tooling', environments: ['Any REST client', 'Command line', 'JavaScript or TypeScript', 'Python'] },
}

type ValidationKey = 'projectName' | 'projectIdentifier' | 'accessUrl' | 'publicSummary' | 'targetAudience' | 'tasks' | 'credits' | 'agreement'
type ValidationErrors = Partial<Record<ValidationKey, string>>
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function NewCampaignPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draft')
  const [draft, setDraft] = useState<CampaignDraft>(() => (draftId ? loadCampaignDraft(draftId) : undefined) ?? createCampaignDraft())
  const [step, setStep] = useState(1)
  const [furthestStep, setFurthestStep] = useState(1)
  const [newTask, setNewTask] = useState('')
  const [saveState, setSaveState] = useState<SaveState>(draftId ? 'saved' : 'idle')
  const [validationAttemptedSteps, setValidationAttemptedSteps] = useState<number[]>([])
  const [agreement, setAgreement] = useState(false)
  const isFirstAutosaveRender = useRef(true)

  const reservedCredits = draft.testerGoal * draft.creditsPerTester
  const availableCredits = 24
  const platformField = platformFields[draft.platform]
  const minimumTesterGoal = draft.platform === 'Android' ? 12 : 1

  const stepErrors = useMemo<ValidationErrors>(() => {
    if (step === 1) {
      const errors: ValidationErrors = {}
      if (!draft.projectName.trim()) errors.projectName = 'Enter a project name.'
      if (draft.platform === 'Android' && !draft.projectIdentifier.trim()) errors.projectIdentifier = 'Enter the package name from Play Console.'
      else if (draft.platform === 'Android' && !packageNamePattern.test(draft.projectIdentifier.trim())) errors.projectIdentifier = 'Use a complete package name such as com.company.app.'
      if (!draft.accessUrl.trim()) errors.accessUrl = 'Enter the private test access link.'
      else if (!webUrlPattern.test(draft.accessUrl.trim())) errors.accessUrl = 'Enter a complete link beginning with https://.'
      if (!draft.publicSummary.trim()) errors.publicSummary = 'Write a short recruitment brief for eligible testers.'
      if (!draft.targetAudience.trim()) errors.targetAudience = 'Describe who should test this project.'
      return errors
    }

    if (step === 2) {
      return draft.tasks.length >= 2 && draft.tasks.every((task) => task.trim().length > 0)
        ? {}
        : { tasks: 'Keep at least two complete testing tasks.' }
    }

    if (step === 3) {
      return draft.testerGoal >= minimumTesterGoal && draft.creditsPerTester >= 1 && reservedCredits <= availableCredits
        ? {}
        : { credits: reservedCredits > availableCredits ? `Lower the reward or add ${reservedCredits - availableCredits} credits.` : `Use at least ${minimumTesterGoal} ${minimumTesterGoal === 1 ? 'tester' : 'testers'} and 1 credit per tester.` }
    }

    return agreement ? {} : { agreement: 'Accept the testing agreement before creating the campaign.' }
  }, [agreement, availableCredits, draft, reservedCredits, step])

  const stepIsValid = Object.keys(stepErrors).length === 0
  const showStepErrors = validationAttemptedSteps.includes(step)

  useEffect(() => {
    if (isFirstAutosaveRender.current) {
      isFirstAutosaveRender.current = false
      return
    }

    setSaveState('saving')
    const autosaveTimer = window.setTimeout(() => {
      try {
        saveCampaignDraft(draft)
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 600)

    return () => window.clearTimeout(autosaveTimer)
  }, [draft])

  const updateDraft = <Key extends keyof CampaignDraft>(key: Key, value: CampaignDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const updatePlatform = (platform: CampaignPlatform) => {
    setDraft((current) => ({
      ...current,
      platform,
      minimumEnvironment: platformFields[platform].environments[0],
      testerGoal: platform === 'Android' ? 12 : 5,
      retentionDays: platform === 'Android' ? 14 : 1,
    }))
  }

  const updateEvidence = (key: keyof CampaignEvidence, value: boolean) => {
    setDraft((current) => ({ ...current, evidence: { ...current.evidence, [key]: value } }))
  }

  const updateTask = (index: number, value: string) => {
    updateDraft('tasks', draft.tasks.map((task, taskIndex) => taskIndex === index ? value : task))
  }

  const removeTask = (index: number) => {
    if (draft.tasks.length <= 2) return
    updateDraft('tasks', draft.tasks.filter((_, taskIndex) => taskIndex !== index))
  }

  const addTask = () => {
    if (!newTask.trim()) return
    updateDraft('tasks', [...draft.tasks, newTask.trim()])
    setNewTask('')
  }

  const goNext = () => {
    if (!stepIsValid || step >= steps.length) {
      setValidationAttemptedSteps((current) => current.includes(step) ? current : [...current, step])
      return
    }
    const nextStep = step + 1
    setStep(nextStep)
    setFurthestStep((current) => Math.max(current, nextStep))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const createCampaign = () => {
    if (!stepIsValid) {
      setValidationAttemptedSteps((current) => current.includes(step) ? current : [...current, step])
      return
    }

    try {
      const savedDraft = saveCampaignDraft(draft)
      navigate('/console/my-campaigns', { state: { createdCampaign: savedDraft.projectName || 'Untitled campaign' } })
    } catch {
      setSaveState('error')
    }
  }

  const fieldHasError = (key: ValidationKey, currentValue = '') => Boolean(stepErrors[key]) && (showStepErrors || Boolean(currentValue.trim()))

  return (
    <div className="campaign-builder page-stack">
      <header className="builder-page-header">
        <div>
          <Link className="back-link" to="/console/my-campaigns"><ArrowLeft size={15} /> My campaigns</Link>
          <span className="page-eyebrow">NEW CAMPAIGN</span>
          <h1>Build a clear testing contract</h1>
          <p>Set expectations before testers join, so useful work can be reviewed fairly and credits can move with confidence.</p>
        </div>
        <div className="draft-status">
          {saveState === 'saving' && <span className="autosave-status saving"><LoaderCircle size={16} /> Saving changes…</span>}
          {saveState === 'saved' && <span className="autosave-status saved"><CheckCircle2 size={16} /> All changes saved</span>}
          {saveState === 'error' && <span className="autosave-status error"><Info size={16} /> Couldn’t save locally</span>}
          {saveState === 'idle' && <span className="autosave-status">Autosaves as you work</span>}
        </div>
      </header>

      <nav className="builder-steps" aria-label="Campaign setup progress">
        {steps.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`${step === item.id ? 'active' : ''} ${item.id < step ? 'complete' : ''}`}
            disabled={item.id > furthestStep}
            onClick={() => setStep(item.id)}
          >
            <span>{item.id < step ? <Check size={15} /> : item.id}</span>
            <strong>{item.label}</strong>
            <small>{item.shortLabel}</small>
          </button>
        ))}
      </nav>

      <div className="builder-layout">
        <section className="panel builder-panel">
          {step === 1 && (
            <div className="builder-step-content">
              <div className="builder-section-heading">
                <span className="builder-heading-icon"><MonitorCog size={19} /></span>
                <div><span>STEP 1 OF 4</span><h2>Project and tester fit</h2><p>Give testers enough context to decide whether they can test your software well.</p></div>
              </div>

              <div className="builder-form-grid">
                <label className={`builder-field ${fieldHasError('projectName') ? 'has-error' : ''}`}><span>Project name <i>Required</i></span><input aria-invalid={fieldHasError('projectName')} value={draft.projectName} onChange={(event) => updateDraft('projectName', event.target.value)} placeholder="e.g. Calm Cards" />{fieldHasError('projectName') && <small className="field-error">{stepErrors.projectName}</small>}</label>
                <label className="builder-field"><span>Software platform</span><select value={draft.platform} onChange={(event) => updatePlatform(event.target.value as CampaignPlatform)}>{platforms.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
                <label className="builder-field"><span>Category</span><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className={`builder-field ${fieldHasError('projectIdentifier', draft.projectIdentifier) ? 'has-error' : ''}`}><span>{platformField.identifierLabel} {draft.platform === 'Android' && <i>Required</i>}</span><input aria-invalid={fieldHasError('projectIdentifier', draft.projectIdentifier)} value={draft.projectIdentifier} onChange={(event) => updateDraft('projectIdentifier', event.target.value)} placeholder={platformField.identifierPlaceholder} /><small className={fieldHasError('projectIdentifier', draft.projectIdentifier) ? 'field-error' : ''}>{fieldHasError('projectIdentifier', draft.projectIdentifier) ? stepErrors.projectIdentifier : platformField.identifierHelp}</small></label>
                <label className="builder-field"><span>{platformField.environmentLabel}</span><select value={draft.minimumEnvironment} onChange={(event) => updateDraft('minimumEnvironment', event.target.value)}>{platformField.environments.map((environment) => <option key={environment}>{environment}</option>)}</select></label>
                <label className="builder-field"><span>Listing visibility</span><select value={draft.visibility} onChange={(event) => updateDraft('visibility', event.target.value as CampaignDraft['visibility'])}><option>Public</option><option>Members only</option><option>Invite only</option></select><small>Private test materials are never included in listings.</small></label>
                <label className={`builder-field ${fieldHasError('publicSummary') ? 'has-error' : ''}`}><span>Recruitment brief <i>Required</i></span><textarea aria-invalid={fieldHasError('publicSummary')} rows={3} value={draft.publicSummary} onChange={(event) => updateDraft('publicSummary', event.target.value)} placeholder="Describe the general problem and testing goal without revealing private implementation details." />{fieldHasError('publicSummary') ? <small className="field-error">{stepErrors.publicSummary}</small> : <small>This is the only testing description included in the public or member listing.</small>}</label>
                <label className={`builder-field full ${fieldHasError('accessUrl', draft.accessUrl) ? 'has-error' : ''}`}><span>{platformField.accessLabel} <i>Required</i></span><input aria-invalid={fieldHasError('accessUrl', draft.accessUrl)} type="url" value={draft.accessUrl} onChange={(event) => updateDraft('accessUrl', event.target.value)} placeholder={platformField.accessPlaceholder} /><small className={fieldHasError('accessUrl', draft.accessUrl) ? 'field-error' : ''}>{fieldHasError('accessUrl', draft.accessUrl) ? stepErrors.accessUrl : 'Private access is shown only to signed-in testers accepted into the campaign.'}</small></label>
                <label className={`builder-field full ${fieldHasError('targetAudience') ? 'has-error' : ''}`}><span>Who should test this project? <i>Required</i></span><textarea aria-invalid={fieldHasError('targetAudience')} rows={4} value={draft.targetAudience} onChange={(event) => updateDraft('targetAudience', event.target.value)} placeholder="Describe the intended user, their experience level, and the situation where they would use the software." />{fieldHasError('targetAudience') && <small className="field-error">{stepErrors.targetAudience}</small>}</label>
                <label className="builder-field full"><span>Environment or account requirements</span><textarea rows={3} value={draft.environmentNotes} onChange={(event) => updateDraft('environmentNotes', event.target.value)} placeholder="e.g. Requires a desktop browser and access to two email addresses." /></label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="builder-step-content">
              <div className="builder-section-heading">
                <span className="builder-heading-icon"><ClipboardCheck size={19} /></span>
                <div><span>STEP 2 OF 4</span><h2>Testing contract</h2><p>Define the work before a tester accepts it. Requirements cannot be changed retroactively.</p></div>
              </div>

              {draft.platform === 'Android' ? (
                <aside className="google-baseline-note">
                  <Info size={18} />
                  <div><strong>Google Play closed-testing template</strong><p>This template uses a 12-tester goal and 14-day participation period. TestExchange helps document the work but does not guarantee production approval.</p></div>
                  <a href="https://support.google.com/googleplay/android-developer/answer/14151465?hl=en" target="_blank" rel="noreferrer">Official guidance <ExternalLink size={13} /></a>
                </aside>
              ) : (
                <aside className="google-baseline-note neutral">
                  <Info size={18} />
                  <div><strong>{draft.platform} testing contract</strong><p>Choose the participation period and tester count that fit the work. Requirements become fixed once a tester accepts.</p></div>
                </aside>
              )}

              <div className="contract-schedule">
                <label className="builder-field"><span>Sessions per tester</span><select value={draft.sessionCount} onChange={(event) => updateDraft('sessionCount', Number(event.target.value))}><option value={1}>1 session</option><option value={2}>2 sessions</option><option value={3}>3 sessions</option><option value={4}>4 sessions</option><option value={5}>5 sessions</option></select><small>Use separate sessions only when returning later matters to the test.</small></label>
                <label className="builder-field"><span>{draft.platform === 'Android' ? 'Continuous participation period' : 'Testing period'}</span>{draft.platform === 'Android' ? <div className="readonly-field"><strong>{draft.retentionDays} days</strong><span>Android template</span></div> : <select value={draft.retentionDays} onChange={(event) => updateDraft('retentionDays', Number(event.target.value))}><option value={1}>1 day</option><option value={3}>3 days</option><option value={7}>7 days</option><option value={14}>14 days</option></select>}<small>Credits remain pending until the agreed period and work are complete.</small></label>
              </div>

              <div className="task-builder">
                <div className="task-builder-header"><div><strong>Required testing tasks</strong><p>Describe observable workflows that can be reviewed fairly after submission.</p></div><span>{draft.tasks.length} tasks</span></div>
                <div className="task-list">
                  {draft.tasks.map((task, index) => (
                    <div className="task-row" key={index}>
                      <GripVertical size={17} />
                      <span className="task-number">{index + 1}</span>
                      <input className={showStepErrors && !task.trim() ? 'invalid' : ''} value={task} onChange={(event) => updateTask(index, event.target.value)} aria-label={`Testing task ${index + 1}`} />
                      <button type="button" className="icon-button" onClick={() => removeTask(index)} disabled={draft.tasks.length <= 2} aria-label={`Remove task ${index + 1}`}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="add-task-row">
                  <input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTask() } }} placeholder="Add another feature or user flow" />
                  <button className="button button-outline" type="button" onClick={addTask} disabled={!newTask.trim()}><Plus size={16} /> Add task</button>
                </div>
              </div>

              <section className="feedback-prompts">
                <div><strong>Structured feedback included</strong><p>Every tester will answer these questions after completing the tasks.</p></div>
                <ol><li>What worked as expected, and what felt confusing?</li><li>Which problems, crashes, or unexpected behavior did you encounter?</li><li>Would your real usage differ from this test? If so, how?</li><li>What should change before this software is released?</li></ol>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="builder-step-content">
              <div className="builder-section-heading">
                <span className="builder-heading-icon"><CircleDollarSign size={19} /></span>
                <div><span>STEP 3 OF 4</span><h2>Evidence, review, and credits</h2><p>Choose what proves completion and how quickly submitted work must be reviewed.</p></div>
              </div>

              <div className="evidence-section">
                <div className="subsection-title"><strong>Required submission evidence</strong><p>Written feedback is always required. Add only evidence that helps verify the contract.</p></div>
                <div className="evidence-grid">
                  <div className="evidence-option locked"><span className="check-box checked"><Check size={14} /></span><div><strong>Structured written feedback</strong><p>Required for every campaign</p></div><span>Always on</span></div>
                  <label className="evidence-option"><input type="checkbox" checked={draft.evidence.featureChecklist} onChange={(event) => updateEvidence('featureChecklist', event.target.checked)} /><span className="check-box"><Check size={14} /></span><div><strong>Completed feature checklist</strong><p>Confirms each required task</p></div></label>
                  <label className="evidence-option"><input type="checkbox" checked={draft.evidence.screenshots} onChange={(event) => updateEvidence('screenshots', event.target.checked)} /><span className="check-box"><Check size={14} /></span><div><strong>Screenshots</strong><p>Use only when visual proof is necessary</p></div></label>
                  <label className="evidence-option"><input type="checkbox" checked={draft.evidence.crashDetails} onChange={(event) => updateEvidence('crashDetails', event.target.checked)} /><span className="check-box"><Check size={14} /></span><div><strong>Crash and device details</strong><p>Requested when a failure occurs</p></div></label>
                </div>
              </div>

              <label className="ai-review-card">
                <input type="checkbox" checked={draft.aiPrecheckEnabled} onChange={(event) => updateDraft('aiPrecheckEnabled', event.target.checked)} />
                <span className="ai-icon"><Bot size={20} /></span>
                <div><strong>Automated quality pre-check</strong><p>Flags missing answers, duplicates, contradictions, and feedback that does not address the contract. It assists review but never makes the final credit decision.</p></div>
                <i />
              </label>

              <div className="builder-form-grid compact">
                <label className="builder-field"><span>Tester goal</span><input type="number" min={minimumTesterGoal} max={100} value={draft.testerGoal} onChange={(event) => updateDraft('testerGoal', Number(event.target.value))} /><small>{draft.platform === 'Android' ? 'The Android closed-testing template starts at 12.' : 'Choose the number of independent perspectives this test needs.'}</small></label>
                <label className="builder-field"><span>Credits per tester</span><select value={draft.creditsPerTester} onChange={(event) => updateDraft('creditsPerTester', Number(event.target.value))}><option value={1}>1 credit</option><option value={2}>2 credits</option><option value={3}>3 credits</option><option value={4}>4 credits</option><option value={5}>5 credits</option></select><small>Reserved now; released after approved completion.</small></label>
                <label className="builder-field"><span>Developer review window</span><select value={draft.reviewWindowHours} onChange={(event) => updateDraft('reviewWindowHours', Number(event.target.value))}><option value={24}>24 hours</option><option value={48}>48 hours</option><option value={72}>72 hours</option></select><small>Late reviews move to dispute protection.</small></label>
              </div>

              <aside className="protection-card"><ShieldCheck size={20} /><div><strong>Built-in tester protection</strong><p>Rejections require a contract-based reason. Requirements cannot be added later, and expired reviews can be escalated with the full audit trail.</p></div></aside>
            </div>
          )}

          {step === 4 && (
            <div className="builder-step-content review-step">
              <div className="builder-section-heading">
                <span className="builder-heading-icon"><ShieldCheck size={19} /></span>
                <div><span>STEP 4 OF 4</span><h2>Review the agreement</h2><p>This is what accepted testers will see before joining your campaign.</p></div>
              </div>

              <section className="contract-preview">
                <div className="contract-preview-head"><span className="app-icon mint">{draft.projectName.slice(0, 2).toUpperCase() || 'PR'}</span><div><span>{draft.platform.toUpperCase()} SOFTWARE TEST</span><h3>{draft.projectName || 'Untitled project'}</h3><p>{draft.projectIdentifier || 'Build identifier not provided'} · {draft.minimumEnvironment}</p></div><span className="status-pill draft">Draft</span></div>
                <div className="contract-preview-grid">
                  <div><span><Users size={15} /> TESTER COMMITMENT</span><strong>{draft.sessionCount} {draft.sessionCount === 1 ? 'session' : 'sessions'} across {draft.retentionDays} {draft.retentionDays === 1 ? 'day' : 'days'}</strong><p>Maintain access as required and complete all listed tasks.</p></div>
                  <div><span><CircleDollarSign size={15} /> REWARD</span><strong>{draft.creditsPerTester} credits per tester</strong><p>{reservedCredits} credits reserved for {draft.testerGoal} completed contracts.</p></div>
                  <div><span><ClipboardCheck size={15} /> SUBMISSION</span><strong>Tasks + structured feedback</strong><p>{draft.evidence.screenshots ? 'Screenshots, ' : ''}{draft.evidence.featureChecklist ? 'feature checklist, ' : ''}and issue details when relevant.</p></div>
                  <div><span><Bot size={15} /> QUALITY REVIEW</span><strong>{draft.aiPrecheckEnabled ? 'Automated pre-check + developer review' : 'Developer review'}</strong><p>Developer response due within {draft.reviewWindowHours} hours.</p></div>
                </div>
                <div className="contract-task-preview"><strong>Required tasks</strong><ol>{draft.tasks.map((task) => <li key={task}>{task}</li>)}</ol></div>
                <div className="contract-audience"><strong>{draft.visibility} recruitment brief</strong><p>{draft.publicSummary}</p><small>Only this summary is used for discovery. The contract and access details stay private.</small></div>
                <div className="contract-audience"><strong>Intended tester</strong><p>{draft.targetAudience}</p>{draft.environmentNotes && <small>{draft.environmentNotes}</small>}</div>
              </section>

              <label className="agreement-row"><input type="checkbox" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} /><span className="check-box"><Check size={14} /></span><div><strong>I agree to review testers against this contract.</strong><p>I understand that requirements cannot be added after testers join and that TestExchange rewards testing work rather than ratings, promotion, or platform approval.</p></div></label>
            </div>
          )}

          <footer className="builder-actions">
            <button className="button button-outline" type="button" onClick={() => setStep((current) => Math.max(1, current - 1))} disabled={step === 1}><ArrowLeft size={16} /> Back</button>
            <span className={showStepErrors && !stepIsValid ? 'validation-hint' : ''}>{showStepErrors && !stepIsValid ? Object.values(stepErrors)[0] : step < 4 ? 'Changes save automatically in this browser.' : `${reservedCredits} credits will be reserved.`}</span>
            {step < 4 ? (
              <button className="button button-dark" type="button" onClick={goNext}>Continue <ArrowRight size={16} /></button>
            ) : (
              <button className="button button-dark" type="button" onClick={createCampaign}><ShieldCheck size={16} /> Create campaign</button>
            )}
          </footer>
        </section>

        <aside className="panel builder-summary">
          <span className="section-kicker">CAMPAIGN SUMMARY</span>
          <h2>{draft.projectName || 'Untitled campaign'}</h2>
          <p>{draft.platform} · {draft.category} · {draft.minimumEnvironment}</p>
          <div className="summary-credit-row"><span>Credits available</span><strong>{availableCredits}</strong></div>
          <div className="summary-credit-row"><span>Credits to reserve</span><strong className={reservedCredits > availableCredits ? 'negative' : ''}>{reservedCredits}</strong></div>
          <div className="summary-divider" />
          <ul>
            <li><Users size={15} /><span><strong>{draft.testerGoal} testers</strong><small>Campaign goal</small></span></li>
            <li><ClipboardCheck size={15} /><span><strong>{draft.tasks.length} required tasks</strong><small>{draft.sessionCount} sessions each</small></span></li>
            <li><ShieldCheck size={15} /><span><strong>{draft.retentionDays}-day period</strong><small>{draft.platform === 'Android' ? 'Continuous participation' : 'Testing window'}</small></span></li>
            <li><Bot size={15} /><span><strong>{draft.aiPrecheckEnabled ? 'Quality pre-check on' : 'Manual review only'}</strong><small>Developer decides or dispute escalates</small></span></li>
          </ul>
          {reservedCredits > availableCredits ? (
            <div className="summary-warning"><Info size={15} /> You need {reservedCredits - availableCredits} more credits or a lower reward.</div>
          ) : (
            <div className="summary-ready"><CheckCircle2 size={15} /> Your current balance covers this campaign.</div>
          )}
        </aside>
      </div>
    </div>
  )
}
