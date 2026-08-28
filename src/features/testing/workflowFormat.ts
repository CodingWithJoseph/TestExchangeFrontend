import type { AssignmentStatus } from '../../api/types'

export function assignmentStatusLabel(status: AssignmentStatus) {
  const labels: Record<AssignmentStatus, string> = {
    applied: 'Awaiting acceptance',
    accepted: 'Ready to start',
    in_progress: 'In progress',
    submitted: 'In review',
    changes_requested: 'Changes requested',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  }
  return labels[status]
}

export function assignmentStatusClass(status: AssignmentStatus) {
  if (status === 'submitted') return 'in-review'
  return status.replaceAll('_', '-')
}

export function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
