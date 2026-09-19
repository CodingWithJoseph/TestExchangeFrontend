export type CampaignEvidence = {
  featureChecklist: boolean
  screenshots: boolean
  crashDetails: boolean
}

export type CampaignPlatform = 'Android' | 'iOS' | 'Web' | 'Desktop' | 'API'
export type CampaignVisibility = 'Public'

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

function storageKey(userId: string) {
  if (!userId) throw new Error('Sign in before accessing campaign drafts.')
  return `testexchange.campaign-drafts.v2.${userId}`
}

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
    visibility: 'Public',
    projectIdentifier: stored.projectIdentifier ?? stored.packageName ?? '',
    accessUrl: stored.accessUrl ?? stored.optInUrl ?? '',
    minimumEnvironment: stored.minimumEnvironment ?? stored.minimumAndroid ?? 'Android 10+',
    environmentNotes: stored.environmentNotes ?? stored.deviceNotes ?? '',
  }
}

export function loadCampaignDrafts(userId: string): CampaignDraft[] {
  try {
    // Legacy v1 drafts have no owner: never assign them to the next signed-in user.
    const stored = window.localStorage.getItem(storageKey(userId))
    return stored ? (JSON.parse(stored) as LegacyCampaignDraft[]).map(normalizeCampaignDraft) : []
  } catch {
    return []
  }
}

export function loadCampaignDraft(userId: string, id: string) {
  return loadCampaignDrafts(userId).find((campaign) => campaign.id === id)
}

export function saveCampaignDraft(userId: string, draft: CampaignDraft) {
  const campaigns = loadCampaignDrafts(userId)
  const nextDraft = { ...draft, updatedAt: new Date().toISOString() }
  const existingIndex = campaigns.findIndex((campaign) => campaign.id === draft.id)

  if (existingIndex >= 0) {
    campaigns[existingIndex] = nextDraft
  } else {
    campaigns.unshift(nextDraft)
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(campaigns))
  return nextDraft
}

export function deleteCampaignDraft(userId: string, id: string) {
  const campaigns = loadCampaignDrafts(userId).filter((campaign) => campaign.id !== id)
  window.localStorage.setItem(storageKey(userId), JSON.stringify(campaigns))
}
