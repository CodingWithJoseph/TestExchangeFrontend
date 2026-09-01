import { describe, expect, it } from 'vitest'
import { parseTraceSampleRate } from './monitoring'

describe('monitoring configuration', () => {
  it('accepts an explicit trace sample rate', () => {
    expect(parseTraceSampleRate('0.1')).toBe(0.1)
  })

  it('uses a conservative default for missing or invalid values', () => {
    expect(parseTraceSampleRate(undefined)).toBe(0.05)
    expect(parseTraceSampleRate('2')).toBe(0.05)
    expect(parseTraceSampleRate('invalid')).toBe(0.05)
  })
})
