import { ArrowRight, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { communityTests } from '../features/community/communityData'
import { usePageMetadata } from '../features/community/usePageMetadata'

export function CommunityTagsPage() {
  usePageMetadata('Testing tags', 'Browse TestExchange requests by platform, technology, and testing focus.')
  const tags = Array.from(new Set(communityTests.flatMap((test) => test.tags))).map((label) => ({
    label,
    tests: communityTests.filter((test) => test.tags.includes(label)),
  })).sort((a, b) => b.tests.length - a.tests.length)

  return (
    <div className="simple-public-page">
      <header className="simple-public-hero">
        <div className="public-container"><span className="community-kicker">EXPLORE THE COMMUNITY</span><h1>Testing tags</h1><p>Find projects by platform, product surface, or the kind of problem they need help investigating.</p></div>
      </header>
      <div className="public-container tags-directory">
        {tags.map((tag) => (
          <Link key={tag.label} to={`/tests?tag=${tag.label}`} className="tag-directory-card">
            <span className="tag-directory-icon"><Tag size={17} /></span>
            <div><h2>{tag.label}</h2><p>{tag.tests.map((test) => test.projectName).slice(0, 2).join(' · ')}</p><small>{tag.tests.length} open {tag.tests.length === 1 ? 'test' : 'tests'}</small></div>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>
    </div>
  )
}
