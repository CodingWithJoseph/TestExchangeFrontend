import { describe, expect, it } from 'vitest'
import {
  MAX_EVIDENCE_FILE_BYTES,
  evidenceAcceptAttribute,
  evidenceKindForFile,
  validateEvidenceFile,
} from './evidenceStorage'

describe('evidence storage helpers', () => {
  it('accepts supported photos and classifies them as screenshots', () => {
    const file = new File(['image'], 'screen shot.png', { type: 'image/png' })

    expect(validateEvidenceFile(file)).toBeNull()
    expect(evidenceKindForFile(file)).toBe('screenshot')
    expect(evidenceAcceptAttribute()).toContain('image/png')
  })

  it('rejects unsupported formats and files over the storage limit', () => {
    const unsupported = new File(['apk'], 'build.apk', { type: 'application/vnd.android.package-archive' })
    const oversized = new File([new Uint8Array(MAX_EVIDENCE_FILE_BYTES + 1)], 'too-large.png', { type: 'image/png' })

    expect(validateEvidenceFile(unsupported)).toContain('not a supported evidence type')
    expect(validateEvidenceFile(oversized)).toContain('50 MB evidence limit')
  })
})
