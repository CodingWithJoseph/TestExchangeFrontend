export type CampaignEvidence = {
  featureChecklist: boolean
  screenshots: boolean
  crashDetails: boolean
}

export type CampaignDraft = {
  id: string
  appName: string
  packageName: string
  optInUrl: string
  category: string
  targetAudience: string
  minimumAndroid: string
  deviceNotes: string
  sessionCount: number
  retentionDays: number
  tasks: string[]
  evidence: CampaignEvidence
  testerGoal: number
  creditsPerTester: number
  reviewWindowHours: number
  aiPrecheckEnabled: boolean
  status: 'Draft'
  updatedAt: string
}

const storageKey = 'testexchange.campaign-drafts.v1'

export function createCampaignDraft(): CampaignDraft {
  return {
    id: `campaign-${Date.now()}`,
    appName: '',
    packageName: '',
    optInUrl: '',
    category: 'Productivity',
    targetAudience: '',
    minimumAndroid: 'Android 10+',
    deviceNotes: '',
    sessionCount: 3,
    retentionDays: 14,
    tasks: [
      'Complete onboarding and create a new account',
      'Use the app’s primary feature from start to finish',
      'Return in a later session and verify saved state or notifications',
    ],
    evidence: {
      featureChecklist: true,
      screenshots: false,
      crashDetails: true,
    },
    testerGoal: 12,
    creditsPerTester: 2,
    reviewWindowHours: 48,
    aiPrecheckEnabled: true,
    status: 'Draft',
    updatedAt: new Date().toISOString(),
  }
}

export function loadCampaignDrafts(): CampaignDraft[] {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as CampaignDraft[]) : []
  } catch {
    return []
  }
}

export function loadCampaignDraft(id: string) {
  return loadCampaignDrafts().find((campaign) => campaign.id === id)
}

export function saveCampaignDraft(draft: CampaignDraft) {
  const campaigns = loadCampaignDrafts()
  const nextDraft = { ...draft, updatedAt: new Date().toISOString() }
  const existingIndex = campaigns.findIndex((campaign) => campaign.id === draft.id)

  if (existingIndex >= 0) {
    campaigns[existingIndex] = nextDraft
  } else {
    campaigns.unshift(nextDraft)
  }

  window.localStorage.setItem(storageKey, JSON.stringify(campaigns))
  return nextDraft
}
