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
  Plus,
  ShieldCheck,
  Smartphone,
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
} from '../features/campaigns/campaignDraft'

const steps = [
  { id: 1, label: 'App & audience', shortLabel: 'App' },
  { id: 2, label: 'Testing contract', shortLabel: 'Contract' },
  { id: 3, label: 'Evidence & credits', shortLabel: 'Credits' },
  { id: 4, label: 'Review', shortLabel: 'Review' },
]

const categories = ['Productivity', 'Finance', 'Health & fitness', 'Education', 'Travel', 'Lifestyle', 'Tools', 'Other']
const packageNamePattern = /^([a-zA-Z]\w*\.)+[a-zA-Z]\w*$/
const webUrlPattern = /^https?:\/\//

type ValidationKey = 'appName' | 'packageName' | 'optInUrl' | 'targetAudience' | 'tasks' | 'credits' | 'agreement'
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

  const stepErrors = useMemo<ValidationErrors>(() => {
    if (step === 1) {
      const errors: ValidationErrors = {}
      if (!draft.appName.trim()) errors.appName = 'Enter an app name.'
      if (!draft.packageName.trim()) errors.packageName = 'Enter the package name from Play Console.'
      else if (!packageNamePattern.test(draft.packageName.trim())) errors.packageName = 'Use a complete package name such as com.company.app.'
      if (!draft.optInUrl.trim()) errors.optInUrl = 'Paste the closed-test opt-in link from Play Console.'
      else if (!webUrlPattern.test(draft.optInUrl.trim())) errors.optInUrl = 'Enter a complete link beginning with https://.'
      if (!draft.targetAudience.trim()) errors.targetAudience = 'Describe who should test this app.'
      return errors
    }

    if (step === 2) {
      return draft.tasks.length >= 2 && draft.tasks.every((task) => task.trim().length > 0)
        ? {}
        : { tasks: 'Keep at least two complete testing tasks.' }
    }

    if (step === 3) {
      return draft.testerGoal >= 12 && draft.creditsPerTester >= 1 && reservedCredits <= availableCredits
        ? {}
        : { credits: reservedCredits > availableCredits ? `Lower the reward or add ${reservedCredits - availableCredits} credits.` : 'Use at least 12 testers and 1 credit per tester.' }
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
      navigate('/console/my-campaigns', { state: { createdCampaign: savedDraft.appName || 'Untitled campaign' } })
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
                <span className="builder-heading-icon"><Smartphone size={19} /></span>
                <div><span>STEP 1 OF 4</span><h2>App and tester fit</h2><p>Give testers enough context to decide whether they can test your app well.</p></div>
              </div>

              <div className="builder-form-grid">
                <label className={`builder-field ${fieldHasError('appName') ? 'has-error' : ''}`}><span>App name <i>Required</i></span><input aria-invalid={fieldHasError('appName')} value={draft.appName} onChange={(event) => updateDraft('appName', event.target.value)} placeholder="e.g. Calm Cards" />{fieldHasError('appName') && <small className="field-error">{stepErrors.appName}</small>}</label>
                <label className="builder-field"><span>Category</span><select value={draft.category} onChange={(event) => updateDraft('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className={`builder-field ${fieldHasError('packageName', draft.packageName) ? 'has-error' : ''}`}><span>Package name <i>Required</i></span><input aria-invalid={fieldHasError('packageName', draft.packageName)} value={draft.packageName} onChange={(event) => updateDraft('packageName', event.target.value)} placeholder="com.example.myapp" /><small className={fieldHasError('packageName', draft.packageName) ? 'field-error' : ''}>{fieldHasError('packageName', draft.packageName) ? stepErrors.packageName : 'Must match the package in Play Console.'}</small></label>
                <label className="builder-field"><span>Minimum Android version</span><select value={draft.minimumAndroid} onChange={(event) => updateDraft('minimumAndroid', event.target.value)}><option>Android 9+</option><option>Android 10+</option><option>Android 11+</option><option>Android 12+</option><option>Android 13+</option><option>Android 14+</option></select></label>
                <label className={`builder-field full ${fieldHasError('optInUrl', draft.optInUrl) ? 'has-error' : ''}`}><span>Google Play closed-test opt-in link <i>Required</i></span><input aria-invalid={fieldHasError('optInUrl', draft.optInUrl)} type="url" value={draft.optInUrl} onChange={(event) => updateDraft('optInUrl', event.target.value)} placeholder="https://play.google.com/apps/testing/com.example.myapp" /><small className={fieldHasError('optInUrl', draft.optInUrl) ? 'field-error' : ''}>{fieldHasError('optInUrl', draft.optInUrl) ? stepErrors.optInUrl : 'This link is only shown to signed-in testers accepted into the campaign.'}</small></label>
                <label className={`builder-field full ${fieldHasError('targetAudience') ? 'has-error' : ''}`}><span>Who should test this app? <i>Required</i></span><textarea aria-invalid={fieldHasError('targetAudience')} rows={4} value={draft.targetAudience} onChange={(event) => updateDraft('targetAudience', event.target.value)} placeholder="Describe the intended user, their experience level, and the situations where they would use the app." />{fieldHasError('targetAudience') && <small className="field-error">{stepErrors.targetAudience}</small>}</label>
                <label className="builder-field full"><span>Device or account requirements</span><textarea rows={3} value={draft.deviceNotes} onChange={(event) => updateDraft('deviceNotes', event.target.value)} placeholder="e.g. Requires notifications enabled; no tablet support in this build." /></label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="builder-step-content">
              <div className="builder-section-heading">
                <span className="builder-heading-icon"><ClipboardCheck size={19} /></span>
                <div><span>STEP 2 OF 4</span><h2>Testing contract</h2><p>Define the work before a tester accepts it. Requirements cannot be changed retroactively.</p></div>
              </div>

              <aside className="google-baseline-note">
                <Info size={18} />
                <div><strong>Google Play baseline</strong><p>Affected personal accounts currently need at least 12 testers opted in continuously for 14 days. Google also asks about feature coverage, realistic usage, collected feedback, and changes made.</p></div>
                <a href="https://support.google.com/googleplay/android-developer/answer/14151465?hl=en" target="_blank" rel="noreferrer">Official guidance <ExternalLink size={13} /></a>
              </aside>

              <div className="contract-schedule">
                <label className="builder-field"><span>Sessions per tester</span><select value={draft.sessionCount} onChange={(event) => updateDraft('sessionCount', Number(event.target.value))}><option value={2}>2 sessions</option><option value={3}>3 sessions</option><option value={4}>4 sessions</option><option value={5}>5 sessions</option></select><small>A TestExchange contract setting—not a number specified by Google.</small></label>
                <label className="builder-field"><span>Continuous opt-in period</span><div className="readonly-field"><strong>{draft.retentionDays} days</strong><span>Google baseline</span></div><small>Credits remain pending until retention is confirmed.</small></label>
              </div>

              <div className="task-builder">
                <div className="task-builder-header"><div><strong>Required testing tasks</strong><p>Cover the features you will discuss in your production-access application.</p></div><span>{draft.tasks.length} tasks</span></div>
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
                <ol><li>What worked as expected, and what felt confusing?</li><li>Which problems, crashes, or unexpected behavior did you encounter?</li><li>Would your real usage differ from this test? If so, how?</li><li>What should change before this app is released?</li></ol>
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
                <label className="builder-field"><span>Tester goal</span><input type="number" min={12} max={100} value={draft.testerGoal} onChange={(event) => updateDraft('testerGoal', Number(event.target.value))} /><small>Minimum 12 for the current Google baseline.</small></label>
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
                <div className="contract-preview-head"><span className="app-icon mint">{draft.appName.slice(0, 2).toUpperCase() || 'AP'}</span><div><span>ANDROID CLOSED TEST</span><h3>{draft.appName || 'Untitled app'}</h3><p>{draft.packageName || 'Package name not provided'} · {draft.minimumAndroid}</p></div><span className="status-pill draft">Draft</span></div>
                <div className="contract-preview-grid">
                  <div><span><Users size={15} /> TESTER COMMITMENT</span><strong>{draft.sessionCount} sessions across {draft.retentionDays} days</strong><p>Remain opted in continuously and complete all listed tasks.</p></div>
                  <div><span><CircleDollarSign size={15} /> REWARD</span><strong>{draft.creditsPerTester} credits per tester</strong><p>{reservedCredits} credits reserved for {draft.testerGoal} completed contracts.</p></div>
                  <div><span><ClipboardCheck size={15} /> SUBMISSION</span><strong>Tasks + structured feedback</strong><p>{draft.evidence.screenshots ? 'Screenshots, ' : ''}{draft.evidence.featureChecklist ? 'feature checklist, ' : ''}and issue details when relevant.</p></div>
                  <div><span><Bot size={15} /> QUALITY REVIEW</span><strong>{draft.aiPrecheckEnabled ? 'Automated pre-check + developer review' : 'Developer review'}</strong><p>Developer response due within {draft.reviewWindowHours} hours.</p></div>
                </div>
                <div className="contract-task-preview"><strong>Required tasks</strong><ol>{draft.tasks.map((task) => <li key={task}>{task}</li>)}</ol></div>
                <div className="contract-audience"><strong>Intended tester</strong><p>{draft.targetAudience}</p>{draft.deviceNotes && <small>{draft.deviceNotes}</small>}</div>
              </section>

              <label className="agreement-row"><input type="checkbox" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} /><span className="check-box"><Check size={14} /></span><div><strong>I agree to review testers against this contract.</strong><p>I understand that requirements cannot be added after testers join and that TestExchange does not guarantee Google Play production approval.</p></div></label>
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
          <h2>{draft.appName || 'Untitled campaign'}</h2>
          <p>{draft.category} · {draft.minimumAndroid}</p>
          <div className="summary-credit-row"><span>Credits available</span><strong>{availableCredits}</strong></div>
          <div className="summary-credit-row"><span>Credits to reserve</span><strong className={reservedCredits > availableCredits ? 'negative' : ''}>{reservedCredits}</strong></div>
          <div className="summary-divider" />
          <ul>
            <li><Users size={15} /><span><strong>{draft.testerGoal} testers</strong><small>Campaign goal</small></span></li>
            <li><ClipboardCheck size={15} /><span><strong>{draft.tasks.length} required tasks</strong><small>{draft.sessionCount} sessions each</small></span></li>
            <li><ShieldCheck size={15} /><span><strong>{draft.retentionDays}-day retention</strong><small>Continuous opt-in</small></span></li>
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
