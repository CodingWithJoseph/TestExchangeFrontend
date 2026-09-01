export type WorkflowStatus =
  | 'Access pending'
  | 'In progress'
  | 'In review'
  | 'Changes requested'
  | 'Approved'
  | 'Disputed'

export type WorkflowMessage = {
  id: string
  author: string
  role: 'tester' | 'developer' | 'system'
  body: string
  time: string
}

export type ContractTask = {
  title: string
  complete: boolean
}

export type TestAssignment = {
  id: string
  appName: string
  appInitials: string
  developer: string
  category: string
  status: WorkflowStatus
  credits: number
  joined: string
  submitted?: string
  dueDate: string
  device: string
  retentionDays: number
  sessionsRequired: number
  sessionsCompleted: number
  daysCompleted: number
  accessNote: string
  contractSummary: string
  tasks: ContractTask[]
  feedback?: {
    overall: string
    confusing: string
    issues: string
    device: string
  }
  reviewNote?: string
  messages: WorkflowMessage[]
}

export type CampaignTester = {
  id: string
  name: string
  initials: string
  device: string
  status: WorkflowStatus
  joined: string
  sessions: string
  lastActive: string
  credits: number
  submissionId?: string
}

export type CampaignSubmission = {
  id: string
  testerId: string
  testerName: string
  testerInitials: string
  device: string
  status: WorkflowStatus
  submitted: string
  credits: number
  sessionsCompleted: number
  retentionDays: number
  taskEvidence: { task: string; note: string }[]
  feedback: {
    overall: string
    confusing: string
    issues: string
  }
  qualityChecks: { label: string; status: 'passed' | 'flagged'; detail: string }[]
  messages: WorkflowMessage[]
}

export const testAssignments: TestAssignment[] = [
  {
    id: 'budget-bloom',
    appName: 'Budget Bloom',
    appInitials: 'BB',
    developer: 'Bloom Labs',
    category: 'Finance',
    status: 'Access pending',
    credits: 3,
    joined: 'Aug 21, 2026',
    dueDate: 'Sep 4, 2026',
    device: 'Android 10+',
    retentionDays: 14,
    sessionsRequired: 3,
    sessionsCompleted: 0,
    daysCompleted: 0,
    accessNote: 'Bloom Labs needs to add your testing account before the private Play link becomes available.',
    contractSummary: 'Test first-time setup and create a realistic monthly budget over three sessions.',
    tasks: [
      { title: 'Complete onboarding and choose a budgeting goal', complete: false },
      { title: 'Create a monthly budget with at least three categories', complete: false },
      { title: 'Return in a later session and update one category', complete: false },
    ],
    messages: [
      { id: 'bb-system-1', author: 'TestExchange', role: 'system', body: 'You joined the test. Bloom Labs was asked to grant access.', time: 'Just now' },
    ],
  },
  {
    id: 'habit-meadow',
    appName: 'Habit Meadow',
    appInitials: 'HM',
    developer: 'Willow Works',
    category: 'Health & fitness',
    status: 'In review',
    credits: 3,
    joined: 'Aug 7, 2026',
    submitted: 'Aug 21, 2026',
    dueDate: 'Aug 21, 2026',
    device: 'Pixel 8 · Android 16',
    retentionDays: 14,
    sessionsRequired: 3,
    sessionsCompleted: 3,
    daysCompleted: 14,
    accessNote: 'Closed-test access granted. Your submission is now locked while Willow Works reviews it.',
    contractSummary: 'Complete onboarding, maintain one habit for 14 days, and evaluate reminders and progress history.',
    tasks: [
      { title: 'Create a habit and select a daily reminder', complete: true },
      { title: 'Complete three check-ins across separate sessions', complete: true },
      { title: 'Review the progress history after the final check-in', complete: true },
    ],
    feedback: {
      overall: 'The core check-in flow was easy to understand and felt quick enough for daily use.',
      confusing: 'The reminder time looked saved, but the confirmation message disappeared before I could read it.',
      issues: 'On day 11 the history screen briefly showed two entries for the same day. Reopening the screen removed the duplicate.',
      device: 'Pixel 8 · Android 16 · App version 0.9.4',
    },
    messages: [
      { id: 'hm-system-1', author: 'TestExchange', role: 'system', body: 'Submission sent. Willow Works has 46 hours remaining to review it.', time: '2h ago' },
      { id: 'hm-developer-1', author: 'Mara · Willow Works', role: 'developer', body: 'Thanks, Joseph. I’m reproducing the duplicate history entry now.', time: '1h ago' },
    ],
  },
  {
    id: 'morning-pages',
    appName: 'Morning Pages',
    appInitials: 'MP',
    developer: 'Sparrow Apps',
    category: 'Productivity',
    status: 'Changes requested',
    credits: 2,
    joined: 'Aug 1, 2026',
    submitted: 'Aug 15, 2026',
    dueDate: 'Aug 23, 2026',
    device: 'Samsung S24 · Android 15',
    retentionDays: 14,
    sessionsRequired: 3,
    sessionsCompleted: 3,
    daysCompleted: 14,
    accessNote: 'Access remains active while you update the requested evidence.',
    contractSummary: 'Create, edit, and export journal entries while testing offline behavior.',
    tasks: [
      { title: 'Create entries in three separate sessions', complete: true },
      { title: 'Edit an entry while offline and reconnect', complete: true },
      { title: 'Export one entry as a PDF', complete: true },
    ],
    feedback: {
      overall: 'Writing and editing were reliable, including after reconnecting.',
      confusing: 'The export icon was hard to identify without opening the menu.',
      issues: 'PDF export failed once but I did not capture the error message.',
      device: 'Samsung S24 · Android 15',
    },
    reviewNote: 'Please retry the PDF export and include the error text or a screenshot if it fails again. No additional tasks are required.',
    messages: [
      { id: 'mp-developer-1', author: 'Ari · Sparrow Apps', role: 'developer', body: 'Could you retry only the PDF export? The rest of your submission is complete.', time: 'Yesterday' },
    ],
  },
  {
    id: 'pocket-garden',
    appName: 'Pocket Garden',
    appInitials: 'PG',
    developer: 'Green Pixel',
    category: 'Lifestyle',
    status: 'Approved',
    credits: 3,
    joined: 'Aug 6, 2026',
    submitted: 'Aug 20, 2026',
    dueDate: 'Aug 20, 2026',
    device: 'Pixel 8 · Android 16',
    retentionDays: 14,
    sessionsRequired: 3,
    sessionsCompleted: 3,
    daysCompleted: 14,
    accessNote: 'Test complete. You may leave the closed test after the developer’s campaign period ends.',
    contractSummary: 'Add plants, schedule reminders, and assess the garden summary over 14 days.',
    tasks: [
      { title: 'Add two plants and set watering reminders', complete: true },
      { title: 'Record care activity in three sessions', complete: true },
      { title: 'Review the garden summary', complete: true },
    ],
    feedback: {
      overall: 'The care flow was clear and the garden summary made missed reminders easy to see.',
      confusing: 'Nothing prevented completion.',
      issues: 'No crashes or blocking issues found.',
      device: 'Pixel 8 · Android 16',
    },
    reviewNote: 'Approved by Green Pixel. 3 credits were added to your balance.',
    messages: [
      { id: 'pg-system-1', author: 'TestExchange', role: 'system', body: 'Submission approved. 3 credits were released to you.', time: 'Yesterday' },
    ],
  },
]

export const calmCardsTesters: CampaignTester[] = [
  { id: 'maya-chen', name: 'Maya Chen', initials: 'MC', device: 'Pixel 9 · Android 16', status: 'In review', joined: 'Aug 8', sessions: '3/3', lastActive: '2h ago', credits: 2, submissionId: 'maya-calm-cards' },
  { id: 'noah-williams', name: 'Noah Williams', initials: 'NW', device: 'Galaxy S24 · Android 15', status: 'Access pending', joined: 'Today', sessions: '0/3', lastActive: '18m ago', credits: 2 },
  { id: 'priya-shah', name: 'Priya Shah', initials: 'PS', device: 'Pixel 7a · Android 16', status: 'In progress', joined: 'Aug 12', sessions: '2/3', lastActive: '4h ago', credits: 2 },
  { id: 'elias-brooks', name: 'Elias Brooks', initials: 'EB', device: 'OnePlus 12 · Android 15', status: 'Approved', joined: 'Aug 7', sessions: '3/3', lastActive: 'Yesterday', credits: 2 },
  { id: 'sofia-reyes', name: 'Sofia Reyes', initials: 'SR', device: 'Galaxy A54 · Android 14', status: 'In progress', joined: 'Aug 10', sessions: '2/3', lastActive: 'Yesterday', credits: 2 },
  { id: 'liam-porter', name: 'Liam Porter', initials: 'LP', device: 'Pixel 8 · Android 16', status: 'Changes requested', joined: 'Aug 8', sessions: '3/3', lastActive: '2d ago', credits: 2 },
  { id: 'aisha-johnson', name: 'Aisha Johnson', initials: 'AJ', device: 'Moto G Power · Android 14', status: 'In progress', joined: 'Aug 11', sessions: '1/3', lastActive: '2d ago', credits: 2 },
  { id: 'owen-kim', name: 'Owen Kim', initials: 'OK', device: 'Pixel Fold · Android 16', status: 'Approved', joined: 'Aug 7', sessions: '3/3', lastActive: '3d ago', credits: 2 },
]

export const calmCardsSubmission: CampaignSubmission = {
  id: 'maya-calm-cards',
  testerId: 'maya-chen',
  testerName: 'Maya Chen',
  testerInitials: 'MC',
  device: 'Pixel 9 · Android 16 · Calm Cards 1.2.0',
  status: 'In review',
  submitted: 'Aug 21, 2026 at 8:42 AM',
  credits: 2,
  sessionsCompleted: 3,
  retentionDays: 14,
  taskEvidence: [
    { task: 'Complete the welcome flow and choose a calming goal', note: 'Completed during session one. I chose “reset after work.”' },
    { task: 'Save three cards across separate sessions', note: 'Saved one breathing, one grounding, and one reflection card.' },
    { task: 'Use one saved card from the favorites screen', note: 'Opened the grounding card twice from Favorites.' },
  ],
  feedback: {
    overall: 'The cards are concise and the favorites flow makes it easy to return to something useful.',
    confusing: 'The heart icon changes color after saving, but there is no confirmation text for screen-reader users.',
    issues: 'The favorites count stayed at 2 after I removed one card. It corrected itself after reopening the app.',
  },
  qualityChecks: [
    { label: 'All contract tasks addressed', status: 'passed', detail: 'Each required task has a specific completion note.' },
    { label: 'Retention and sessions complete', status: 'passed', detail: '14 days retained with 3 separate sessions recorded.' },
    { label: 'Possible issue needs developer review', status: 'flagged', detail: 'Favorites count may not update immediately after removing a card.' },
  ],
  messages: [
    { id: 'cc-system-1', author: 'TestExchange', role: 'system', body: 'Maya submitted the testing contract. The 2-credit tester reward is awaiting a decision.', time: '2h ago' },
    { id: 'cc-tester-1', author: 'Maya Chen', role: 'tester', body: 'I can send a short screen recording if the favorites-count issue is difficult to reproduce.', time: '1h ago' },
  ],
}

export const calmCardsContract = {
  appName: 'Calm Cards',
  packageName: 'com.stillday.calmcards',
  audience: 'Adults looking for short grounding exercises during everyday stress.',
  device: 'Android 10+',
  testerGoal: 12,
  retentionDays: 14,
  sessionsRequired: 3,
  reviewWindowHours: 48,
  creditsPerTester: 2,
  tasks: [
    'Complete the welcome flow and choose a calming goal',
    'Save three cards across separate sessions',
    'Use one saved card from the favorites screen',
  ],
}

export function workflowStatusClass(status: WorkflowStatus) {
  return status.toLowerCase().replaceAll(' ', '-')
}

type JoinableTest = {
  name: string
  developer: string
  initials: string
  category: string
  credits: number
  device: string
  description: string
  retentionDays: number
  sessionsRequired: number
}

const joinedTestsStorageKey = 'testexchange.joined-tests.v1'

export function loadJoinedAssignments(): TestAssignment[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(window.localStorage.getItem(joinedTestsStorageKey) ?? '[]') as TestAssignment[]
  } catch {
    return []
  }
}

export function joinAvailableTest(test: JoinableTest) {
  const id = test.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/(^-|-$)/g, '')
  const existing = [...testAssignments, ...loadJoinedAssignments()].find((assignment) => assignment.id === id)
  if (existing) return existing

  const assignment: TestAssignment = {
    id,
    appName: test.name,
    appInitials: test.initials,
    developer: test.developer,
    category: test.category,
    status: 'Access pending',
    credits: test.credits,
    joined: 'Aug 21, 2026',
    dueDate: 'Sep 4, 2026',
    device: test.device,
    retentionDays: test.retentionDays,
    sessionsRequired: test.sessionsRequired,
    sessionsCompleted: 0,
    daysCompleted: 0,
    accessNote: `${test.developer} needs to grant access before the private build instructions become available.`,
    contractSummary: test.description,
    tasks: [
      { title: 'Open the private build using the supplied access instructions', complete: false },
      { title: `Complete the requested software flow in ${test.sessionsRequired} ${test.sessionsRequired === 1 ? 'session' : 'sessions'}`, complete: false },
      { title: 'Submit structured feedback and relevant issue details', complete: false },
    ],
    messages: [
      { id: `${id}-system-1`, author: 'TestExchange', role: 'system', body: `You joined the test. ${test.developer} was asked to grant access.`, time: 'Just now' },
    ],
  }

  const nextAssignments = [assignment, ...loadJoinedAssignments()]
  window.localStorage.setItem(joinedTestsStorageKey, JSON.stringify(nextAssignments))
  return assignment
}
