import { describe, expect, it } from 'vitest'
import { categoryLabel } from './campaignPresentation'

describe('categoryLabel', () => {
  it('presents user-entered categories with title casing', () => {
    expect(categoryLabel('productivity tools')).toBe('Productivity Tools')
    expect(categoryLabel('  developer utilities  ')).toBe('Developer Utilities')
  })

  it('preserves uppercase abbreviations', () => {
    expect(categoryLabel('API testing')).toBe('API Testing')
    expect(categoryLabel('UI/UX')).toBe('UI/UX')
  })
})
