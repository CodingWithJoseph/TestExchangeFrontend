import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createCampaignDraft, deleteCampaignDraft, loadCampaignDraft, loadCampaignDrafts, saveCampaignDraft } from './campaignDraft'

describe('private campaign drafts', () => {
  let storage: Map<string, string>
  beforeEach(() => {
    storage = new Map()
    vi.stubGlobal('window', { localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    } })
  })
  it('isolates reads, updates and deletions across account switches', () => {
    const draft = { ...createCampaignDraft(), accessUrl: 'https://private.example.test/invite' }
    saveCampaignDraft('owner-a', draft)
    expect(loadCampaignDrafts('owner-b')).toEqual([])
    expect(loadCampaignDraft('owner-b', draft.id)).toBeUndefined()
    saveCampaignDraft('owner-b', { ...draft, accessUrl: 'https://different.example.test' })
    deleteCampaignDraft('owner-b', draft.id)
    expect(loadCampaignDraft('owner-a', draft.id)?.accessUrl).toBe(draft.accessUrl)
  })
  it('never adopts legacy drafts whose owner is unknown', () => {
    storage.set('testexchange.campaign-drafts.v1', JSON.stringify([createCampaignDraft()]))
    expect(loadCampaignDrafts('next-account')).toEqual([])
  })
  it('does not write drafts without an authenticated owner', () => {
    expect(() => saveCampaignDraft('', createCampaignDraft())).toThrow('Sign in')
    expect(storage.size).toBe(0)
  })
})
