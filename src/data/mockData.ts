export type AvailableTest = {
  id: number
  name: string
  category: string
  developer: string
  initials: string
  accent: string
  description: string
  credits: number
  duration: string
  testerCount: number
  testerGoal: number
  device: string
  tags: string[]
  isNew?: boolean
}

export const availableTests: AvailableTest[] = [
  {
    id: 1,
    name: 'Budget Bloom',
    category: 'Finance',
    developer: 'Bloom Labs',
    initials: 'BB',
    accent: 'mint',
    description: 'Walk through first-time setup, add a monthly budget, and report anything confusing.',
    credits: 3,
    duration: '15 min',
    testerCount: 7,
    testerGoal: 12,
    device: 'Android 10+',
    tags: ['Onboarding', 'Usability'],
    isNew: true,
  },
  {
    id: 2,
    name: 'Trail Notes',
    category: 'Travel',
    developer: 'Northstar Studio',
    initials: 'TN',
    accent: 'lavender',
    description: 'Create an offline trail note, attach a photo, and test syncing after reconnecting.',
    credits: 4,
    duration: '20 min',
    testerCount: 9,
    testerGoal: 12,
    device: 'Android 11+',
    tags: ['Offline', 'Sync'],
  },
  {
    id: 3,
    name: 'Focus Friend',
    category: 'Productivity',
    developer: 'Tiny Habit Co.',
    initials: 'FF',
    accent: 'peach',
    description: 'Complete two focus sessions and assess notifications, sounds, and session history.',
    credits: 2,
    duration: '10 min',
    testerCount: 5,
    testerGoal: 12,
    device: 'Android 9+',
    tags: ['Notifications', 'UX'],
    isNew: true,
  },
  {
    id: 4,
    name: 'Pantry Pal',
    category: 'Food',
    developer: 'Small Batch Apps',
    initials: 'PP',
    accent: 'sky',
    description: 'Add pantry items, update quantities, and identify any barcode-scanning issues.',
    credits: 3,
    duration: '15 min',
    testerCount: 10,
    testerGoal: 12,
    device: 'Android 10+',
    tags: ['Camera', 'Core flow'],
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
