export type AvailableTest = {
  id: number
  slug: string
  name: string
  category: string
  platform: string
  developer: string
  initials: string
  accent: string
  description: string
  credits: number
  duration: string
  retentionDays: number
  sessionsRequired: number
  testerCount: number
  testerGoal: number
  device: string
  tags: string[]
  isNew?: boolean
}

export const availableTests: AvailableTest[] = [
  {
    id: 1,
    slug: 'budget-bloom-onboarding',
    name: 'Budget Bloom',
    category: 'Finance',
    platform: 'Android',
    developer: 'Bloom Labs',
    initials: 'BB',
    accent: 'mint',
    description: 'Walk through first-time setup, add a monthly budget, and report anything confusing.',
    credits: 3,
    duration: '15 min',
    retentionDays: 14,
    sessionsRequired: 3,
    testerCount: 7,
    testerGoal: 12,
    device: 'Android 10 or newer',
    tags: ['Onboarding', 'Usability'],
    isNew: true,
  },
  {
    id: 2,
    slug: 'trail-notes-background-sync',
    name: 'Trail Notes',
    category: 'Travel',
    platform: 'iOS',
    developer: 'Northstar Studio',
    initials: 'TN',
    accent: 'lavender',
    description: 'Create an offline trail note, attach a photo, and assess syncing after reconnecting.',
    credits: 4,
    duration: '20 min',
    retentionDays: 2,
    sessionsRequired: 2,
    testerCount: 9,
    testerGoal: 12,
    device: 'iPhone with iOS 17+',
    tags: ['Offline', 'Sync'],
  },
  {
    id: 3,
    slug: 'relayboard-invite-flow',
    name: 'Relayboard',
    category: 'Collaboration',
    platform: 'Web',
    developer: 'Northline Studio',
    initials: 'RB',
    accent: 'peach',
    description: 'Create a workspace, invite a collaborator, and identify friction in roles and project handoff.',
    credits: 4,
    duration: '25 min',
    retentionDays: 1,
    sessionsRequired: 1,
    testerCount: 4,
    testerGoal: 8,
    device: 'Modern desktop browser',
    tags: ['Permissions', 'Usability'],
    isNew: true,
  },
  {
    id: 4,
    slug: 'noteforge-offline-recovery',
    name: 'NoteForge',
    category: 'Productivity',
    platform: 'Desktop',
    developer: 'Small Hours Software',
    initials: 'NF',
    accent: 'sky',
    description: 'Edit a document offline, reconnect, and verify that local changes recover without duplicates.',
    credits: 5,
    duration: '30 min',
    retentionDays: 1,
    sessionsRequired: 1,
    testerCount: 5,
    testerGoal: 6,
    device: 'Windows 11 or macOS 14+',
    tags: ['Offline', 'Data integrity'],
  },
  {
    id: 5,
    slug: 'inbox-guard-webhook-errors',
    name: 'Inbox Guard API',
    category: 'Developer tools',
    platform: 'API',
    developer: 'Quiet Signal',
    initials: 'IG',
    accent: 'sky',
    description: 'Exercise documented failure cases and judge whether retry guidance is specific enough to implement.',
    credits: 6,
    duration: '35–45 min',
    retentionDays: 1,
    sessionsRequired: 1,
    testerCount: 2,
    testerGoal: 5,
    device: 'REST client or command-line HTTP tool',
    tags: ['Documentation', 'Error handling'],
    isNew: true,
  },
]

export const activity = [
  { id: 1, label: 'Test submitted', detail: 'Habit Meadow · Developer review pending', time: '2h ago', tone: 'green' },
  { id: 2, label: 'Credits earned', detail: '+3 credits from testing Pocket Garden', time: 'Yesterday', tone: 'purple' },
  { id: 3, label: 'New tester joined', detail: 'Your Calm Cards campaign now has 8 testers', time: 'Yesterday', tone: 'blue' },
  { id: 4, label: 'Feedback received', detail: 'New issue reported on the welcome flow', time: '2d ago', tone: 'orange' },
]

export const testHistory = [
  { id: 1, name: 'Habit Meadow', developer: 'Willow Works', status: 'In review', credits: 3, submitted: 'Aug 21, 2026' },
  { id: 2, name: 'Pocket Garden', developer: 'Green Pixel', status: 'Approved', credits: 3, submitted: 'Aug 20, 2026' },
  { id: 3, name: 'Language Ladder', developer: 'Lingo Labs', status: 'Approved', credits: 4, submitted: 'Aug 18, 2026' },
  { id: 4, name: 'Morning Pages', developer: 'Sparrow Apps', status: 'Changes requested', credits: 2, submitted: 'Aug 15, 2026' },
]

export const campaigns = [
  { id: 1, name: 'Calm Cards', platform: 'Android closed test', status: 'Active', testers: 8, goal: 12, daysLeft: 11, spent: 16 },
  { id: 2, name: 'Receipt Pocket', platform: 'Android closed test', status: 'Draft', testers: 0, goal: 12, daysLeft: 14, spent: 0 },
]

export const creditActivity = [
  { id: 1, label: 'Pocket Garden test approved', amount: 3, date: 'Aug 20, 2026' },
  { id: 2, label: 'Calm Cards tester joined', amount: -2, date: 'Aug 20, 2026' },
  { id: 3, label: 'Language Ladder test approved', amount: 4, date: 'Aug 18, 2026' },
  { id: 4, label: 'Calm Cards tester joined', amount: -2, date: 'Aug 18, 2026' },
]
