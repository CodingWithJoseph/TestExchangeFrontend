import { loadEnv } from 'vite'

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env }
const problems = []
for (const name of ['VITE_API_URL', 'VITE_SUPABASE_URL']) {
  try {
    const url = new URL(env[name])
    if (url.protocol !== 'https:' || url.username || url.password || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error()
  } catch { problems.push(`${name} must be a production HTTPS URL.`) }
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.VITE_SUPPORT_EMAIL || '')) problems.push('VITE_SUPPORT_EMAIL must be configured.')
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || ''
let publicKey = key.startsWith('sb_publishable_') && key.length > 20
try { publicKey ||= JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'anon' } catch { /* Not a legacy anon JWT. */ }
if (!publicKey) problems.push('Set a frontend-safe Supabase publishable or anon key; never a service-role key.')
if (!env.VITE_SENTRY_DSN) problems.push('VITE_SENTRY_DSN must be configured for release monitoring.')
if (!env.VITE_SENTRY_RELEASE) problems.push('VITE_SENTRY_RELEASE must identify this release.')
if (problems.length) {
  console.error('Release configuration is incomplete:\n' + problems.map((problem) => `- ${problem}`).join('\n'))
  process.exitCode = 1
} else {
  console.log('Release configuration present. Complete the hosted smoke test before launch.')
}
