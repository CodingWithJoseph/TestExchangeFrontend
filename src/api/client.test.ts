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
})
