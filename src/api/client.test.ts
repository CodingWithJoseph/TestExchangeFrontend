import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createApiClient } from './client'

describe('API client', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  it('keeps public campaign requests anonymous', async () => {
    fetchMock.mockResolvedValue(new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await createApiClient(null, 'https://api.example.test/').listPublicCampaigns()

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.example.test/campaigns')
    expect(new Headers(init?.headers).has('Authorization')).toBe(false)
  })

  it('checks public-beta capacity and joins the waitlist anonymously', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('{"enabled":true,"max_users":200,"claimed_seats":200,"remaining_seats":0,"is_full":true}', { status: 200, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response('{"id":"wait-1","email":"new@example.com","created_at":"2026-09-01T00:00:00Z"}', { status: 201, headers: { 'Content-Type': 'application/json' } }))

    const client = createApiClient(null, 'https://api.example.test')
    const status = await client.getBetaStatus()
    const entry = await client.joinBetaWaitlist('new@example.com')

    expect(status.is_full).toBe(true)
    expect(entry.email).toBe('new@example.com')
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'https://api.example.test/beta/status',
      'https://api.example.test/beta/waitlist',
    ])
    expect(fetchMock.mock.calls.every(([, init]) => !new Headers(init?.headers).has('Authorization'))).toBe(true)
  })

  it('adds the Supabase bearer token to protected requests', async () => {
    fetchMock.mockResolvedValue(new Response('{"user_id":"user-1","balance":10}', { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await createApiClient('access-token', 'https://api.example.test').getCreditBalance()

    const [, init] = fetchMock.mock.calls[0]
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer access-token')
  })

  it('rejects protected requests before fetching when signed out', async () => {
    await expect(createApiClient(null, 'https://api.example.test').getCreditBalance()).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('surfaces a backend error detail and status', async () => {
    fetchMock.mockResolvedValue(new Response('{"detail":"That username is already taken"}', { status: 409, headers: { 'Content-Type': 'application/json' } }))

    const request = createApiClient('access-token', 'https://api.example.test').saveProfile({ username: 'taken', display_name: 'Taken' })

    await expect(request).rejects.toEqual(new ApiError('That username is already taken', 409))
  })

  it('loads advisory quality checks for a protected submission', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      submission_id: 'submission-1',
      assignment_id: 'assignment-1',
      submission_version: 1,
      submission_status: 'submitted',
      status: 'ready_for_review',
      score: 100,
      checks: [{ code: 'summary_present', label: 'Summary provided', status: 'passed', detail: 'The tester included a summary.' }],
      disclaimer: 'Advisory only.',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const result = await createApiClient('access-token', 'https://api.example.test').getQualityCheck('submission-1')

    expect(result.status).toBe('ready_for_review')
    expect(result.checks[0].code).toBe('summary_present')
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/api/v1/submissions/submission-1/quality-check')
  })
})
