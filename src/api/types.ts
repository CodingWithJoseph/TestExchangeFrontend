export type Platform = 'android' | 'ios' | 'web' | 'desktop' | 'api' | 'other'
export type CampaignStatus = 'draft' | 'published' | 'paused' | 'completed' | 'cancelled'
export type AssignmentStatus = 'applied' | 'accepted' | 'in_progress' | 'submitted' | 'changes_requested' | 'approved' | 'rejected' | 'cancelled'
export type SubmissionStatus = 'submitted' | 'changes_requested' | 'approved' | 'rejected'
export type ReviewDecision = 'approved' | 'changes_requested' | 'rejected'
export type EvidenceKind = 'screenshot' | 'video' | 'log' | 'note' | 'link' | 'file'
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'rejected'
export type DisputeRemedy = 'none' | 'award_tester'

export type Profile = {
  id: string
  email: string | null
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type ProfileInput = {
  username: string
  display_name: string
  bio?: string | null
  avatar_url?: string | null
}

export type PublicProfile = Pick<Profile, 'id' | 'username' | 'display_name' | 'bio' | 'avatar_url'>

export type AccountCapabilities = { is_moderator: boolean }

export type BetaStatus = {
  enabled: boolean
  max_users: number
  claimed_seats: number
  remaining_seats: number
  is_full: boolean
}

export type WaitlistEntry = {
  id: string
  email: string
  created_at: string
}

export type ModerationParticipant = Profile & {
  is_suspended: boolean
  suspended_at: string | null
  suspension_reason: string | null
}

export type Campaign = {
  id: string
  owner_id: string
  owner_profile: PublicProfile
  name: string
  slug: string
  platform: Platform
  category: string
  public_summary: string
  public_tester_requirements: string
  minimum_version: string | null
  target_testers: number
  reward_credits: number
  status: CampaignStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export type CampaignInput = Pick<Campaign, 'name' | 'slug' | 'platform' | 'category' | 'public_summary' | 'public_tester_requirements' | 'minimum_version' | 'target_testers' | 'reward_credits'>
export type CampaignTransitionAction = 'pause' | 'resume' | 'close'

export type ContractTask = {
  id: string
  position: number
  title: string
  instructions: string
  evidence_required: boolean
}

export type TestingContract = {
  id: string
  campaign_id: string
  version: number
  tester_instructions: string
  access_instructions: string | null
  device_requirements: string | null
  evidence_requirements: string
  review_window_hours: number
  minimum_duration_days: number
  required_sessions: number
  status: 'draft' | 'locked'
  locked_at: string | null
  tasks: ContractTask[]
}

export type ContractInput = {
  tester_instructions: string
  access_instructions?: string | null
  device_requirements?: string | null
  evidence_requirements: string
  review_window_hours: number
  minimum_duration_days: number
  required_sessions: number
  tasks: Array<Pick<ContractTask, 'title' | 'instructions' | 'evidence_required'>>
}

export type CampaignLaunchInput = {
  campaign: CampaignInput
  contract: ContractInput
}

export type Assignment = {
  id: string
  campaign_id: string
  tester_id: string
  tester_profile: PublicProfile
  application_note: string | null
  status: AssignmentStatus
  accepted_at: string | null
  started_at: string | null
  submitted_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export type EvidenceItem = {
  id: string
  task_id: string | null
  kind: EvidenceKind
  storage_key: string | null
  external_url: string | null
  note: string | null
  created_at: string
}

export type EvidenceItemInput = {
  task_id?: string | null
  kind: EvidenceKind
  storage_key?: string | null
  external_url?: string | null
  note?: string | null
}

export type Submission = {
  id: string
  assignment_id: string
  version: number
  summary: string
  status: SubmissionStatus
  submitted_at: string
  items: EvidenceItem[]
}

export type QualityCheckItem = {
  code: string
  label: string
  status: 'passed' | 'flagged'
  detail: string
}

export type QualityCheck = {
  submission_id: string
  assignment_id: string
  submission_version: number
  submission_status: SubmissionStatus
  status: 'ready_for_review' | 'needs_attention' | 'already_reviewed'
  score: number
  checks: QualityCheckItem[]
  disclaimer: string
}

export type Review = {
  id: string
  submission_id: string
  reviewer_id: string
  decision: ReviewDecision
  notes: string
  created_at: string
}

export type PrivateMessage = {
  id: string
  assignment_id: string
  sender_id: string
  body: string
  created_at: string
}

export type CreditBalance = { user_id: string; balance: number }

export type CreditLedgerEntry = {
  id: string
  transaction_id: string
  user_id: string
  delta: number
  entry_type: 'signup_grant' | 'purchase' | 'posting' | 'reservation' | 'reward' | 'release' | 'refund' | 'adjustment'
  reference_type: string | null
  reference_id: string | null
  note: string | null
  idempotency_key: string
  created_by: string | null
  created_at: string
}

export type Notification = {
  id: string
  user_id: string
  kind: string
  title: string
  body: string
  entity_type: string
  entity_id: string
  read_at: string | null
  created_at: string
}

export type TestingSession = {
  id: string
  assignment_id: string
  session_date: string
  note: string | null
  created_at: string
}

export type Dispute = {
  id: string
  assignment_id: string
  submission_id: string | null
  opened_by: string
  reason: string
  status: DisputeStatus
  assigned_to: string | null
  assigned_at: string | null
  resolution: string | null
  remedy: DisputeRemedy | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export type AuditEvent = {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string
  details: Record<string, unknown>
  created_at: string
}

export type ModerationCase = {
  dispute: Dispute
  assignment: Assignment
  campaign: Campaign
  contract: TestingContract
  submissions: Submission[]
  reviews: Review[]
  messages: PrivateMessage[]
  audit_events: AuditEvent[]
}
