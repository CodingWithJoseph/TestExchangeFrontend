import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CommunityTestRow } from '../components/CommunityTestRow'
import { communityTests, type CommunityPlatform } from '../features/community/communityData'
import { usePageMetadata } from '../features/community/usePageMetadata'

const platforms: Array<'All' | CommunityPlatform> = ['All', 'Android', 'iOS', 'Web', 'Desktop', 'API']
const sortOptions = ['Newest', 'Highest reward', 'Fewest spots'] as const

export function PublicTestsPage() {
  usePageMetadata('Browse software tests', 'Find public software testing requests across mobile, web, desktop, and API projects.')
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const platform = searchParams.get('platform') ?? 'All'
  const tag = searchParams.get('tag') ?? ''
  const sort = searchParams.get('sort') ?? 'Newest'

  const updateParam = (key: string, value: string, defaultValue = '') => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === defaultValue) next.delete(key)
    else next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  const tests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = communityTests.filter((test) => {
      const searchable = `${test.title} ${test.projectName} ${test.developer} ${test.platform} ${test.category} ${test.tags.join(' ')}`.toLowerCase()
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (platform === 'All' || test.platform === platform)
        && (!tag || test.tags.includes(tag))
        && test.status !== 'Completed'
    })

    if (sort === 'Highest reward') return [...filtered].sort((a, b) => b.reward - a.reward)
    if (sort === 'Fewest spots') return [...filtered].sort((a, b) => (a.testerGoal - a.testerCount) - (b.testerGoal - b.testerCount))
    return filtered
  }, [platform, query, sort, tag])

  const clearFilters = () => setSearchParams({})

  return (
    <div className="public-directory-page">
      <header className="directory-hero">
        <div className="public-container">
          <span className="community-kicker">PUBLIC TEST DIRECTORY</span>
          <h1>Find software that needs your perspective.</h1>
          <p>Browse owner-authored public briefs. Private builds, test instructions, evidence, and conversations unlock only after a tester is accepted.</p>
          <label className="directory-search">
            <Search size={19} />
            <input value={query} onChange={(event) => updateParam('q', event.target.value)} placeholder="Search projects, platforms, and tags" />
            {query && <button className="icon-button" onClick={() => updateParam('q', '')} aria-label="Clear search"><X size={16} /></button>}
          </label>
        </div>
      </header>

      <div className="public-container directory-layout">
        <aside className="directory-filters">
          <div className="directory-filter-title"><SlidersHorizontal size={16} /><strong>Filter tests</strong></div>
          <fieldset>
            <legend>Platform</legend>
            {platforms.map((item) => <label key={item}><input type="radio" name="platform" checked={platform === item} onChange={() => updateParam('platform', item, 'All')} /><span>{item}</span></label>)}
          </fieldset>
          <fieldset>
            <legend>Sort by</legend>
            {sortOptions.map((item) => <label key={item}><input type="radio" name="sort" checked={sort === item} onChange={() => updateParam('sort', item, 'Newest')} /><span>{item}</span></label>)}
          </fieldset>
          {(query || tag || platform !== 'All' || sort !== 'Newest') && <button className="clear-filter-button" onClick={clearFilters}>Clear all filters</button>}
        </aside>

        <section className="directory-results">
          <div className="directory-results-head">
            <div><strong>{tests.length} open {tests.length === 1 ? 'test' : 'tests'}</strong>{tag && <span className="active-filter-tag">#{tag} <button onClick={() => updateParam('tag', '')} aria-label={`Remove ${tag} filter`}><X size={12} /></button></span>}</div>
            <small>Rewards are released after approved work</small>
          </div>
          {tests.length ? (
            <div className="community-feed-list">{tests.map((test) => <CommunityTestRow key={test.slug} test={test} />)}</div>
          ) : (
            <div className="community-empty-state"><Search size={26} /><h2>No matching tests</h2><p>Try another phrase or clear your current filters.</p><button className="button button-outline" onClick={clearFilters}>Clear filters</button></div>
          )}
        </section>
      </div>
    </div>
  )
}
