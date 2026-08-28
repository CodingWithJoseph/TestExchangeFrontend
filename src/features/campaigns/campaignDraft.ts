export type CampaignEvidence = {
  featureChecklist: boolean
  screenshots: boolean
  crashDetails: boolean
}

export type CampaignPlatform = 'Android' | 'iOS' | 'Web' | 'Desktop' | 'API'
export type CampaignVisibility = 'Public' | 'Members only' | 'Invite only'

export type CampaignDraft = {
  id: string
  projectName: string
  platform: CampaignPlatform
  visibility: CampaignVisibility
  projectIdentifier: string
  accessUrl: string
  publicSummary: string
  category: string
  targetAudience: string
  minimumEnvironment: string
  environmentNotes: string
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
    projectName: '',
    platform: 'Android',
    visibility: 'Public',
    projectIdentifier: '',
    accessUrl: '',
    publicSummary: '',
    category: 'Productivity',
    targetAudience: '',
    minimumEnvironment: 'Android 10+',
    environmentNotes: '',
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

type LegacyCampaignDraft = Partial<CampaignDraft> & {
  appName?: string
  packageName?: string
  optInUrl?: string
  minimumAndroid?: string
  deviceNotes?: string
}

function normalizeCampaignDraft(stored: LegacyCampaignDraft): CampaignDraft {
  const defaults = createCampaignDraft()
  return {
    ...defaults,
    ...stored,
    projectName: stored.projectName ?? stored.appName ?? '',
    platform: stored.platform ?? 'Android',
    visibility: stored.visibility ?? 'Public',
    projectIdentifier: stored.projectIdentifier ?? stored.packageName ?? '',
    accessUrl: stored.accessUrl ?? stored.optInUrl ?? '',
    minimumEnvironment: stored.minimumEnvironment ?? stored.minimumAndroid ?? 'Android 10+',
    environmentNotes: stored.environmentNotes ?? stored.deviceNotes ?? '',
  }
}

export function loadCampaignDrafts(): CampaignDraft[] {
  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as LegacyCampaignDraft[]).map(normalizeCampaignDraft) : []
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

export function deleteCampaignDraft(id: string) {
  const campaigns = loadCampaignDrafts().filter((campaign) => campaign.id !== id)
  window.localStorage.setItem(storageKey, JSON.stringify(campaigns))
}
