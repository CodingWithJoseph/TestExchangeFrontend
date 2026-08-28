import type { EvidenceKind } from '../../api/types'
import { supabase } from '../../auth/supabase'

export const EVIDENCE_BUCKET = 'test-evidence'
export const MAX_EVIDENCE_FILE_BYTES = 50 * 1024 * 1024

const SUPPORTED_EVIDENCE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'video/mp4',
  'text/plain',
  'application/pdf',
  'application/zip',
])

export function evidenceAcceptAttribute() {
  return Array.from(SUPPORTED_EVIDENCE_TYPES).join(',')
}

export function evidenceKindForFile(file: File): EvidenceKind {
  if (file.type.startsWith('image/')) return 'screenshot'
  if (file.type === 'video/mp4') return 'video'
  if (file.type === 'text/plain') return 'log'
  return 'file'
}

export function validateEvidenceFile(file: File): string | null {
  if (!SUPPORTED_EVIDENCE_TYPES.has(file.type)) {
    return `${file.name} is not a supported evidence type.`
  }
  if (file.size > MAX_EVIDENCE_FILE_BYTES) {
    return `${file.name} is larger than the 50 MB evidence limit.`
  }
  return null
}

function safeFileName(name: string) {
  const sanitized = name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
  return sanitized || 'evidence-file'
}

function fileToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export async function uploadEvidenceFile(assignmentId: string, file: File) {
  if (!supabase) {
    throw new Error('Configure Supabase before uploading evidence files.')
  }
  const path = `${assignmentId}/${fileToken()}-${safeFileName(file.name)}`
  const { error } = await supabase.storage.from(EVIDENCE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })
  if (error) throw new Error(`Unable to upload ${file.name}: ${error.message}`)
  return path
}

export async function createEvidenceSignedUrl(storageKey: string) {
  if (!supabase) return null
  const { data, error } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(storageKey, 5 * 60)
  if (error) throw new Error(`Unable to open evidence: ${error.message}`)
  return data.signedUrl
}
