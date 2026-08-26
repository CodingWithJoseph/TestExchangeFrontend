export type CommunityPlatform = 'Android' | 'iOS' | 'Web' | 'Desktop' | 'API'

export type CommunityTestStatus = 'Open' | 'Nearly full' | 'Completed'

export type CommunityTest = {
  slug: string
  projectName: string
  title: string
  initials: string
  accent: 'mint' | 'lavender' | 'peach' | 'sky'
  developer: string
  developerHandle: string
  developerReputation: number
  platform: CommunityPlatform
  category: string
  summary: string
  publicObjective: string
  environment: string
  reward: number
  duration: string
  testerCount: number
  testerGoal: number
  retentionDays?: number
  tags: string[]
  status: CommunityTestStatus
  posted: string
  deadline: string
  requirements: string[]
}

export const communityTests: CommunityTest[] = [
  {
    slug: 'budget-bloom-onboarding',
    projectName: 'Budget Bloom',
    title: 'Test whether first-time budgeting feels clear and trustworthy',
    initials: 'BB',
    accent: 'mint',
    developer: 'Bloom Labs',
    developerHandle: 'bloom-labs',
    developerReputation: 428,
    platform: 'Android',
    category: 'Finance',
    summary: 'Use the first-run experience and a realistic monthly budget, then report anything that blocks understanding or confidence.',
    publicObjective: 'We want to learn whether a new user can understand the core budgeting flow without outside instructions.',
    environment: 'Android 10 or newer',
    reward: 3,
    duration: '15–20 min',
    testerCount: 7,
    testerGoal: 12,
    retentionDays: 14,
    tags: ['android', 'onboarding', 'usability'],
    status: 'Open',
    posted: '2 hours ago',
    deadline: 'September 8',
    requirements: ['Comfortable creating a realistic sample budget', 'Able to remain enrolled for 14 days'],
  },
  {
    slug: 'relayboard-invite-flow',
    projectName: 'Relayboard',
    title: 'Find friction in a team invitation and project handoff flow',
    initials: 'RB',
    accent: 'lavender',
    developer: 'Northline Studio',
    developerHandle: 'northline-studio',
    developerReputation: 816,
    platform: 'Web',
    category: 'Collaboration',
    summary: 'Create a workspace, invite another participant, and assess whether roles and ownership are understandable.',
    publicObjective: 'We are validating the handoff between an account owner and a newly invited collaborator.',
    environment: 'Modern Chrome, Edge, Firefox, or Safari',
    reward: 4,
    duration: '25 min',
    testerCount: 4,
    testerGoal: 8,
    tags: ['web', 'collaboration', 'permissions'],
    status: 'Open',
    posted: 'Today',
    deadline: 'September 4',
    requirements: ['Access to two email addresses', 'Desktop or laptop browser'],
  },
  {
    slug: 'noteforge-offline-recovery',
    projectName: 'NoteForge',
    title: 'Stress-test offline editing and recovery after reconnecting',
    initials: 'NF',
    accent: 'peach',
    developer: 'Small Hours Software',
    developerHandle: 'small-hours',
    developerReputation: 265,
    platform: 'Desktop',
    category: 'Productivity',
    summary: 'Edit a document while offline, reconnect, and check that local work is preserved without confusing duplicate versions.',
    publicObjective: 'We need confidence that temporary connectivity loss does not create data-loss anxiety.',
    environment: 'Windows 11 or macOS 14+',
    reward: 5,
    duration: '30 min',
    testerCount: 5,
    testerGoal: 6,
    tags: ['desktop', 'offline', 'data-integrity'],
    status: 'Nearly full',
    posted: 'Yesterday',
    deadline: 'August 31',
    requirements: ['Able to temporarily disable network access', 'Comfortable working with sample documents'],
  },
  {
    slug: 'inbox-guard-webhook-errors',
    projectName: 'Inbox Guard API',
    title: 'Validate webhook error responses and retry guidance',
    initials: 'IG',
    accent: 'sky',
    developer: 'Quiet Signal',
    developerHandle: 'quiet-signal',
    developerReputation: 1092,
    platform: 'API',
    category: 'Developer tools',
    summary: 'Exercise documented failure cases and judge whether response codes and retry instructions are specific enough to act on.',
    publicObjective: 'We want an outside developer to verify that integrations can recover from expected errors using only the documentation.',
    environment: 'REST client or command-line HTTP tool',
    reward: 6,
    duration: '35–45 min',
    testerCount: 2,
    testerGoal: 5,
    tags: ['api', 'documentation', 'error-handling'],
    status: 'Open',
    posted: '2 days ago',
    deadline: 'September 10',
    requirements: ['Basic REST API experience', 'Able to send JSON requests'],
  },
  {
    slug: 'trail-notes-background-sync',
    projectName: 'Trail Notes',
    title: 'Check background sync after recording a trip without service',
    initials: 'TN',
    accent: 'sky',
    developer: 'Northstar Studio',
    developerHandle: 'northstar-studio',
    developerReputation: 594,
    platform: 'iOS',
    category: 'Travel',
    summary: 'Record an offline note, reconnect later, and evaluate whether sync progress and conflicts are understandable.',
    publicObjective: 'We are testing the reliability and clarity of the offline-to-online transition.',
    environment: 'iPhone running iOS 17+',
    reward: 4,
    duration: '20 min over 2 sessions',
    testerCount: 9,
    testerGoal: 10,
    tags: ['ios', 'offline', 'sync'],
    status: 'Nearly full',
    posted: '3 days ago',
    deadline: 'September 2',
    requirements: ['Able to test in two separate sessions', 'Comfortable toggling airplane mode'],
  },
]

export const popularCommunityTags = [
  { label: 'usability', count: 18 },
  { label: 'web', count: 14 },
  { label: 'android', count: 12 },
  { label: 'onboarding', count: 11 },
  { label: 'api', count: 8 },
  { label: 'accessibility', count: 7 },
]

export function getCommunityTest(slug: string) {
  return communityTests.find((test) => test.slug === slug)
}
