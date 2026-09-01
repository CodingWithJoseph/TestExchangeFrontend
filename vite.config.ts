import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const sentryBuildEnabled = Boolean(
    env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT,
  )

  return {
    plugins: [
      react(),
      ...(sentryBuildEnabled
        ? [sentryVitePlugin({
            authToken: env.SENTRY_AUTH_TOKEN,
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
            release: env.VITE_SENTRY_RELEASE ? { name: env.VITE_SENTRY_RELEASE } : undefined,
            sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
          })]
        : []),
    ],
    build: { sourcemap: sentryBuildEnabled ? 'hidden' : false },
  }
})
