import type {
  Assignment,
  Campaign,
  CampaignInput,
  ContractInput,
  CreditBalance,
  CreditLedgerEntry,
  EvidenceItemInput,
  PrivateMessage,
  Profile,
  ProfileInput,
  QualityCheck,
  Review,
  ReviewDecision,
  Submission,
  TestingContract,
} from './types'

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

export function createApiClient(accessToken: string | null, apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') {
  const request = async <Response>(path: string, init: RequestInit = {}, authenticated = true): Promise<Response> => {
    if (authenticated && !accessToken) throw new ApiError('Sign in to continue.', 401)

    const headers = new Headers(init.headers)
    if (init.body) headers.set('Content-Type', 'application/json')
    if (authenticated && accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

    const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, { ...init, headers })
    const body = response.status === 204 ? null : await response.json().catch(() => null) as { detail?: string } | null
    if (!response.ok) throw new ApiError(body?.detail || `Request failed with status ${response.status}.`, response.status)
    return body as Response
  }

  const json = (value: unknown) => JSON.stringify(value)

  return {
    listPublicCampaigns: () => request<Campaign[]>('/campaigns', {}, false),
    getPublicCampaign: (slug: string) => request<Campaign>(`/campaigns/${encodeURIComponent(slug)}`, {}, false),
    getProfile: () => request<Profile>('/api/v1/me/profile'),
    saveProfile: (profile: ProfileInput) => request<Profile>('/api/v1/me/profile', { method: 'PUT', body: json(profile) }),
    getCreditBalance: () => request<CreditBalance>('/api/v1/credits/balance'),
    getCreditLedger: () => request<CreditLedgerEntry[]>('/api/v1/credits/ledger'),
    listOwnedCampaigns: () => request<Campaign[]>('/api/v1/campaigns/mine'),
    createCampaign: (campaign: CampaignInput) => request<Campaign>('/api/v1/campaigns', { method: 'POST', body: json(campaign) }),
    saveContract: (campaignId: string, contract: ContractInput) => request<TestingContract>(`/api/v1/campaigns/${campaignId}/contract`, { method: 'PUT', body: json(contract) }),
    getOwnedContract: (campaignId: string) => request<TestingContract>(`/api/v1/campaigns/${campaignId}/contract`),
    publishCampaign: (campaignId: string) => request<Campaign>(`/api/v1/campaigns/${campaignId}/publish`, { method: 'POST' }),
    applyToCampaign: (campaignId: string, applicationNote: string | null) => request<Assignment>(`/api/v1/campaigns/${campaignId}/assignments`, { method: 'POST', body: json({ application_note: applicationNote }) }),
    listAssignments: () => request<Assignment[]>('/api/v1/assignments/mine'),
    getAssignment: (assignmentId: string) => request<Assignment>(`/api/v1/assignments/${assignmentId}`),
    getAssignmentContract: (assignmentId: string) => request<TestingContract>(`/api/v1/assignments/${assignmentId}/contract`),
    acceptAssignment: (assignmentId: string) => request<Assignment>(`/api/v1/assignments/${assignmentId}/accept`, { method: 'POST' }),
    startAssignment: (assignmentId: string) => request<Assignment>(`/api/v1/assignments/${assignmentId}/start`, { method: 'POST' }),
    listSubmissions: (assignmentId: string) => request<Submission[]>(`/api/v1/assignments/${assignmentId}/submissions`),
    createSubmission: (assignmentId: string, summary: string, items: EvidenceItemInput[]) => request<Submission>(`/api/v1/assignments/${assignmentId}/submissions`, { method: 'POST', body: json({ summary, items }) }),
    getQualityCheck: (submissionId: string) => request<QualityCheck>(`/api/v1/submissions/${submissionId}/quality-check`),
    listReviews: (submissionId: string) => request<Review[]>(`/api/v1/submissions/${submissionId}/reviews`),
    createReview: (submissionId: string, decision: ReviewDecision, notes: string) => request<Review>(`/api/v1/submissions/${submissionId}/reviews`, { method: 'POST', body: json({ decision, notes }) }),
    listMessages: (assignmentId: string) => request<PrivateMessage[]>(`/api/v1/assignments/${assignmentId}/messages`),
    sendMessage: (assignmentId: string, body: string) => request<PrivateMessage>(`/api/v1/assignments/${assignmentId}/messages`, { method: 'POST', body: json({ body }) }),
  }
}
