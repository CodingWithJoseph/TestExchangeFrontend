import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { TestCard } from '../components/TestCard'
import { availableTests, type AvailableTest } from '../data/mockData'
import { joinAvailableTest } from '../features/testing/testingWorkflow'

const filters = ['All tests', 'Quick tests', 'Highest reward', 'New']

export function AvailableTestsPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All tests')
  const [selected, setSelected] = useState<AvailableTest | null>(() => availableTests.find((test) => test.slug === searchParams.get('test')) ?? null)
  const [agreement, setAgreement] = useState(false)
  const navigate = useNavigate()

  const openTest = (test: AvailableTest) => {
    setAgreement(false)
    setSelected(test)
  }

  const acceptTest = () => {
    if (!selected || !agreement) return
    const assignment = joinAvailableTest(selected)
    navigate(`/console/my-tests/${assignment.id}`)
  }

  const filteredTests = useMemo(() => {
    let tests = availableTests.filter((test) =>
      `${test.name} ${test.platform} ${test.category} ${test.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()),
    )
    if (filter === 'Quick tests') tests = tests.filter((test) => Number.parseInt(test.duration) <= 15)
    if (filter === 'Highest reward') tests = [...tests].sort((a, b) => b.credits - a.credits)
    if (filter === 'New') tests = tests.filter((test) => test.isNew)
    return tests
  }, [filter, query])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="TESTER WORKSPACE"
        title="Available tests"
        description="Choose a real testing task, follow the developer’s brief, and earn credits after approval."
      />

      <div className="filter-bar">
        <label className="search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, platforms, or tasks" />
        </label>
        <button className="button button-outline"><SlidersHorizontal size={17} /> Filters</button>
      </div>
      <div className="filter-pills" aria-label="Test filters">
        {filters.map((item) => (
          <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>
        ))}
      </div>

      <div className="results-heading"><span>{filteredTests.length} tests available</span><small>Matched to your testing profile</small></div>
      {filteredTests.length > 0 ? (
        <div className="tests-grid">
          {filteredTests.map((test) => <TestCard test={test} key={test.id} onStart={openTest} />)}
        </div>
      ) : (
        <div className="empty-state"><Search size={28} /><h2>No matching tests</h2><p>Try another search or clear the active filter.</p></div>
      )}

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="test-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button>
            <span className={`app-icon large ${selected.accent}`}>{selected.initials}</span>
            <span className="section-kicker">{selected.platform} · {selected.category} · {selected.developer}</span>
            <h2 id="test-dialog-title">Test {selected.name}</h2>
            <p>{selected.description}</p>
            <div className="brief-box">
              <strong>What you’ll need to do</strong>
              <ol><li>Review the private access instructions and exact contract.</li><li>Complete the requested flow in the required environment.</li><li>Submit specific notes and relevant issue details.</li></ol>
            </div>
            <label className="join-agreement"><input type="checkbox" checked={agreement} onChange={(event) => setAgreement(event.target.checked)} /><span className="check-box" /><span><strong>I can complete this contract in the required environment.</strong><small>I agree to test the software and submit specific, truthful feedback.</small></span></label>
            <div className="modal-actions">
              <button className="button button-outline" onClick={() => setSelected(null)}>Not now</button>
              <button className="button button-dark" disabled={!agreement} onClick={acceptTest}>Join test · Earn {selected.credits} credits</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
