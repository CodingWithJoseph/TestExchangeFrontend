import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Campaign } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { PageHeader } from '../components/PageHeader'
import { TestCard } from '../components/TestCard'

const filters = ['All tests', 'Highest reward', 'New']

export function AvailableTestsPage() {
  const api = useApi()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All tests')
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [agreement, setAgreement] = useState(false)
  const [applicationNote, setApplicationNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const modalRef = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    void api.listPublicCampaigns()
      .then((items) => {
        if (!active) return
        const available = items.filter((item) => item.owner_id !== user?.id)
        setCampaigns(available)
        const requestedSlug = searchParams.get('test')
        if (requestedSlug) setSelected(available.find((item) => item.slug === requestedSlug) ?? null)
      })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load tests.') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [api, searchParams, user?.id])

  useEffect(() => {
    if (!selected) return
    const previousFocus = document.activeElement as HTMLElement | null
    const modal = modalRef.current
    modal?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null)
        return
      }
      if (event.key !== 'Tab' || !modal) return
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href]'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [selected])

  const openTest = (test: Campaign) => {
    setAgreement(false)
    setApplicationNote('')
    setError(null)
    setSelected(test)
  }

  const acceptTest = async () => {
    if (!selected || !agreement || joining) return
    setJoining(true)
    setError(null)
    try {
      const assignment = await api.applyToCampaign(selected.id, applicationNote.trim() || null)
      navigate(`/console/my-tests/${assignment.id}`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to request this test.')
    } finally {
      setJoining(false)
    }
  }

  const filteredTests = useMemo(() => {
    let tests = campaigns.filter((test) => `${test.name} ${test.platform} ${test.category} ${test.public_summary}`.toLowerCase().includes(query.toLowerCase()))
    if (filter === 'Highest reward') tests = [...tests].sort((a, b) => b.reward_credits - a.reward_credits)
    if (filter === 'New') tests = tests.filter((test) => Date.now() - new Date(test.published_at || test.created_at).getTime() < 7 * 24 * 60 * 60 * 1000)
    return tests
  }, [campaigns, filter, query])

  return (
    <div className="page-stack">
      <PageHeader eyebrow="TESTER WORKSPACE" title="Available tests" description="Choose a real testing task, follow the developer’s brief, and earn credits after approval." />
      <div className="filter-bar">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, platforms, or tasks" /></label>
        <button className="button button-outline"><SlidersHorizontal size={17} /> Filters</button>
      </div>
      <div className="filter-pills" aria-label="Test filters">{filters.map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="results-heading"><span>{filteredTests.length} tests available</span><small>Live campaigns from the TestExchange API</small></div>
      {isLoading ? <div className="empty-state"><p>Loading available tests…</p></div> : error && !selected ? <div className="empty-state"><h2>Couldn’t load tests</h2><p>{error}</p></div> : filteredTests.length > 0 ? (
        <div className="tests-grid">{filteredTests.map((test) => <TestCard test={test} key={test.id} onStart={openTest} />)}</div>
      ) : (
        <div className="empty-state"><Search size={28} /><h2>No matching tests</h2><p>Try another search, or create a second account and publish the first campaign.</p></div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section ref={modalRef} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-labelledby="test-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button>
            <span className="app-icon large mint">{selected.name.slice(0, 2).toUpperCase()}</span>
            <span className="section-kicker">{selected.platform} · {selected.category}</span>
            <h2 id="test-dialog-title">Test {selected.name}</h2>
            <p>{selected.public_summary}</p>
            <div className="brief-box"><strong>Public tester requirements</strong><p>{selected.public_tester_requirements}</p><small>The private contract and access instructions unlock only if the developer accepts your request.</small></div>
            <label className="builder-field"><span>Why are you a good fit? <i>Optional</i></span><textarea rows={3} value={applicationNote} onChange={(event) => setApplicationNote(event.target.value)} maxLength={1000} placeholder="Mention your device, environment, or relevant experience." /></label>
            <label className="join-agreement"><input type="checkbox" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} /><span className="check-box" /><span><strong>I can complete this test in the required environment.</strong><small>I agree to submit specific, truthful feedback against the locked contract.</small></span></label>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-actions"><button className="button button-outline" onClick={() => setSelected(null)}>Not now</button><button className="button button-dark" disabled={!agreement || joining} onClick={() => void acceptTest()}>{joining ? 'Requesting…' : `Request spot · Earn ${selected.reward_credits} credits`}</button></div>
          </section>
        </div>
      )}
    </div>
  )
}
