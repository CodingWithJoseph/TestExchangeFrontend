import { expect, it } from 'vitest'
import { reviewIsOverdue } from './reviewDeadline'

it('opens escalation at the exact deadline, not before, and ignores missing dates', () => {
  const submitted = '2026-09-01T12:00:00Z'
  const deadline = Date.parse(submitted) + 24 * 60 * 60 * 1000
  expect(reviewIsOverdue(submitted, 24, deadline - 1)).toBe(false)
  expect(reviewIsOverdue(submitted, 24, deadline)).toBe(true)
  expect(reviewIsOverdue(undefined, 24, deadline)).toBe(false)
  expect(reviewIsOverdue('invalid', 24, deadline)).toBe(false)
})
