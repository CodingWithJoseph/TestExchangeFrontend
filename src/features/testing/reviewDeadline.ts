export function reviewIsOverdue(submittedAt: string | undefined, reviewWindowHours: number | undefined, now = Date.now()) {
  if (!submittedAt || reviewWindowHours === undefined) return false
  const deadline = new Date(submittedAt).getTime() + reviewWindowHours * 60 * 60 * 1000
  return Number.isFinite(deadline) && now >= deadline
}
