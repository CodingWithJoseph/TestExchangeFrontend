import type { Campaign, Platform } from '../../api/types'

export function platformLabel(platform: Platform) {
  return platform === 'api' ? 'API' : platform.charAt(0).toUpperCase() + platform.slice(1)
}

export function categoryLabel(category: string) {
  return category.trim().split(/\s+/).map((word) => {
    if (word.length > 1 && word === word.toUpperCase()) return word
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')
}

export function campaignTags(campaign: Campaign) {
  return Array.from(new Set([categoryLabel(campaign.category), platformLabel(campaign.platform)].filter(Boolean)))
}

export function publishedLabel(campaign: Campaign) {
  const published = new Date(campaign.published_at || campaign.created_at)
  const days = Math.max(0, Math.floor((Date.now() - published.getTime()) / 86_400_000))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export function requirementsList(campaign: Campaign) {
  return campaign.public_tester_requirements
    .split(/\r?\n|;|•/)
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}
