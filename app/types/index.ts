// ── Enums & Literals ──────────────────────────────────────────

export type MissionType = 'affiliate' | 'survey' | 'cpg' | 'digital_review' | 'ugc' | 'focus_group'
export type MissionStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived'
export type MissionCategory = 'beauty' | 'food' | 'health' | 'tech' | 'home' | 'fashion' | 'entertainment' | 'finance'
export type StageType = 'survey' | 'redirect' | 'visit_link' | 'receipt_upload' | 'image_upload' | 'video_upload' | 'review' | 'custom'
export type TransactionType = 'mission_reward' | 'admin_adjustment' | 'referral_bonus' | 'payout' | 'reversal'
export type UserRole = 'user' | 'admin' | 'super_admin'
export type QuestionType = 'single_select' | 'multi_select' | 'text' | 'number' | 'date'

// ── Core Entities ─────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar_url?: string | null
  gender?: string | null
  state?: string | null
  zip_code?: string | null
  date_of_birth?: string | null
  role: UserRole
  pq_answers?: Record<string, unknown> | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface Mission {
  id: string
  title: string
  description: string
  slug: string
  brand_name?: string | null
  brand_logo_url?: string | null
  brand_color?: string | null
  hero_image_url?: string | null
  brand_about?: string | null
  mission_type: MissionType
  category?: MissionCategory | null
  affiliate_url?: string | null
  affiliate_network?: string | null
  reward_amount: number
  reward_type?: string | null
  max_participants?: number | null
  current_participants: number
  is_featured: boolean
  is_public: boolean
  status: MissionStatus
  terms_conditions?: string | null
  estimated_completion_minutes?: number | null
  mission_images?: string[] | null
  start_date?: string | null
  end_date?: string | null
  created_at: string
  updated_at: string
  created_by: string
}

export interface MissionDetail extends Mission {
  stages: MissionStage[]
  participant_count: number
  click_count: number
  conversion_count: number
}

export interface MissionStage {
  id: string
  mission_id: string
  stage_type: StageType
  stage_name: string
  stage_description?: string | null
  stage_order: number
  reward_amount: number
  config?: Record<string, unknown> | null
  is_optional: boolean
  created_at: string
  updated_at: string
}

export interface Wallet {
  user_id: string
  available_credits: number
  pending_credits: number
  lifetime_earned: number
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  transaction_type: TransactionType
  description?: string | null
  processed_by?: string | null
  mission_id?: string | null
  created_at: string
  updated_at: string
}

export interface ProfileQuestion {
  id: string
  question_key: string
  question_text: string
  question_type: QuestionType
  options?: string[] | null
  sort_order: number
  is_required: boolean
  journeys?: string[] | null
  is_active: boolean
  created_at: string
}

export interface Segment {
  id: string
  name: string
  description?: string | null
  segment_type?: string | null
  rules: Record<string, unknown>
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface NotificationSend {
  id: string
  segment_id: string
  subject: string
  template_id: string
  recipients_count: number
  success_count: number
  fail_count: number
  sent_by: string
  created_at: string
  segments?: { name: string }
}

export interface UserEvent {
  id: string
  user_id: string
  mission_id?: string | null
  stage_id?: string | null
  event_type: string
  event_data?: Record<string, unknown> | null
  created_at: string
}

// ── Pagination ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ── API Response Helpers ──────────────────────────────────────

export interface ApiError {
  error: string
  details?: unknown
}

export interface ApiSuccess {
  success: true
}

// ── Dashboard ─────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number
  activeMissions: number
  conversionsLast7Days: number
  conversionsLast30Days: number
  totalCreditsIssued: number
  recentTransactions: Array<{
    id: string
    user_id: string
    amount: number
    transaction_type: TransactionType
    description: string | null
    created_at: string
  }>
}

// ── Admin-Specific Response Types ─────────────────────────────

export interface AdminUserListItem extends Profile {
  available_credits: number
}

export interface AdminUserDetail {
  profile: Profile
  wallet: Wallet | null
  creditTransactions: Transaction[]
  events: UserEvent[]
}

export interface PayoutListItem {
  user_id: string
  available_credits: number
  pending_credits: number
  lifetime_earned: number
  profiles: {
    id: string
    email: string
    first_name?: string | null
    last_name?: string | null
  }
  created_at: string
  updated_at: string
}

export interface SegmentPreview {
  count: number
  users: Array<{
    id: string
    email: string
    first_name?: string | null
    last_name?: string | null
  }>
}

export interface SendNotificationResult {
  success: true
  totalRecipients: number
  successCount: number
  failCount: number
}

// ── Request Types ─────────────────────────────────────────────

export interface ListMissionsParams {
  page?: number
  perPage?: number
  status?: MissionStatus
  type?: string
  search?: string
}

export interface CreateMissionRequest {
  title: string
  description: string
  brand_name?: string
  brand_logo_url?: string
  brand_color?: string
  hero_image_url?: string
  brand_about?: string
  mission_type: string
  category?: string
  affiliate_url?: string
  affiliate_network?: string
  reward_amount: number
  reward_type?: string
  max_participants?: number
  is_featured?: boolean
  is_public?: boolean
  terms_conditions?: string
  estimated_completion_minutes?: number
  mission_images?: string[]
  start_date?: string
  end_date?: string
  stages?: Array<{
    stage_type: StageType
    stage_name: string
    stage_description?: string
    reward_amount?: number
    config?: Record<string, unknown>
    is_optional?: boolean
  }>
}

export type UpdateMissionRequest = Partial<CreateMissionRequest>

export interface ListUsersParams {
  page?: number
  perPage?: number
  search?: string
  role?: 'user' | 'admin'
}

export interface AdjustCreditsRequest {
  amount: number
  type: 'credit' | 'debit'
  reason?: string
}

export interface ListTransactionsParams {
  page?: number
  perPage?: number
  search?: string
  type?: TransactionType
  userId?: string
}

export interface ListPayoutsParams {
  page?: number
  perPage?: number
  minBalance?: number
}

export interface ListSegmentsParams {
  page?: number
  perPage?: number
}

export interface CreateSegmentRequest {
  name: string
  description?: string
  segment_type?: string
  rules: Record<string, unknown>
  is_active?: boolean
}

export type UpdateSegmentRequest = Partial<CreateSegmentRequest>

export interface SendNotificationRequest {
  segmentId: string
  subject: string
  templateId: string
  dataVariables?: Record<string, string>
}

export interface CreateProfileQuestionRequest {
  question_key: string
  question_text: string
  question_type: QuestionType
  options?: string[]
  is_required?: boolean
  sort_order?: number
}

export interface UpdateProfileQuestionRequest {
  question_text?: string
  question_type?: QuestionType
  options?: string[]
  is_required?: boolean
  sort_order?: number
  is_active?: boolean
}
