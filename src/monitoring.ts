import * as Sentry from '@sentry/react'

const defaultTraceSampleRate = 0.05

export function parseTraceSampleRate(value: string | undefined) {
  if (!value?.trim()) return defaultTraceSampleRate
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : defaultTraceSampleRate
}

export function initializeMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim()
  if (!dsn) return false
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE?.trim() || undefined,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: parseTraceSampleRate(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE),
    sendDefaultPii: false,
  })
  return true
}
