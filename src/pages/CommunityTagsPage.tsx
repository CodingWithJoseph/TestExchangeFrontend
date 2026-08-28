import { ArrowRight, Tag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../api/ApiContext'
import type { Campaign } from '../api/types'
import { campaignTags } from '../features/community/campaignPresentation'
import { usePageMetadata } from '../features/community/usePageMetadata'

export function CommunityTagsPage() {
  const api = useApi()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  usePageMetadata('Testing categories', 'Browse TestExchange requests by platform and software category.')
  useEffect(() => {
    let active = true
    void api.listPublicCampaigns().then((items) => { if (active) setCampaigns(items) }).catch(() => undefined)
    return () => { active = false }
  }, [api])
  const tags = useMemo(() => Array.from(new Set(campaigns.flatMap(campaignTags))).map((label) => ({
    label,
    tests: campaigns.filter((test) => campaignTags(test).includes(label)),
  })).sort((a, b) => b.tests.length - a.tests.length), [campaigns])

  return (
    <div className="simple-public-page">
      <header className="simple-public-hero">
        <div className="public-container"><span className="community-kicker">EXPLORE THE COMMUNITY</span><h1>Browse by category</h1><p>Find testing requests by software category or target platform.</p></div>
      </header>
      <div className="public-container tags-directory">
        {tags.map((tag) => (
          <Link key={tag.label} to={`/tests?tag=${encodeURIComponent(tag.label)}`} className="tag-directory-card">
            <span className="tag-directory-icon"><Tag size={17} /></span>
            <div><h2>{tag.label}</h2><p>{tag.tests.map((test) => test.name).slice(0, 2).join(' · ')}</p><small>{tag.tests.length} open {tag.tests.length === 1 ? 'test' : 'tests'}</small></div>
            <ArrowRight size={16} />
          </Link>
        ))}
      </div>
    </div>
  )
}
