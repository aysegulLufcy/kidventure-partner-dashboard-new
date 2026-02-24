// ============================================
// KidVenture Pass - Partner Dashboard Types
// ============================================

// User & Auth Types
export interface User {
  id: string;
  email: string;
  role: 'partner_staff' | 'partner_manager' | 'admin';
  partnerOrgId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Partner Summary Types
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'held';
export type StripeConnectStatus = 'connected' | 'pending_verification' | 'action_needed' | 'not_started';

export interface PartnerSummary {
  partnerOrgName: string;
  partnerOrgId: string;
  todaySessionsCount: number;
  monthCheckinsCount: number;
  estimatedEarningsUsd: number;
  payoutStatus: PayoutStatus;
  stripeConnectStatus: StripeConnectStatus;
}

// Session Types
export type SessionStatus = 'open' | 'closed' | 'canceled';

export interface Session {
  id: string;
  classTemplateId: string;
  classTitle: string;
  locationId: string;
  locationName: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  capacityTotal: number;
  capacityKvp: number;
  kvpSpotsLeft: number;
  status: SessionStatus;
}

export interface CreateSessionRequest {
  classTemplateId: string;
  locationId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacityTotal: number;
  capacityKvp: number;
  // Recurrence options
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'custom';
    endDate?: string; // YYYY-MM-DD - when the recurrence ends
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday (used with 'custom')
    interval?: number; // e.g., every 2 weeks
  };
}

export interface UpdateSessionRequest {
  startTime?: string;
  endTime?: string;
  capacityTotal?: number;
  capacityKvp?: number;
  status?: 'open' | 'closed';
}

// Check-in Types
export type CheckinStatus = 'valid' | 'invalid' | 'duplicate';

export interface CheckinResult {
  status: CheckinStatus;
  message: string;
  booking?: {
    id: string;
    sessionId: string;
    classTitle: string;
    startAt: string;
    kidNameMasked?: string;
    parentNameMasked?: string;
  };
  checkedInAt?: string;
}

export interface CheckinRecord {
  id: string;
  bookingId: string;
  sessionId: string;
  classTitle: string;
  sessionStartAt: string;
  checkedInAt: string;
  bookingStatus: 'attended' | 'invalid' | 'duplicate';
  creditsCost: number;
  kidNameMasked?: string;
  locationName: string;
}

// Earnings Types
export interface EarningsLineItem {
  date: string;
  sessionId: string;
  classTitle: string;
  checkinsCount: number;
  amountUsd: number;
}

export interface EarningsReport {
  period: string; // YYYY-MM
  estimatedTotalUsd: number;
  lineItems: EarningsLineItem[];
}

export interface PayoutBatch {
  id: string;
  periodStart: string;
  periodEnd: string;
  amountUsd: number;
  status: PayoutStatus;
  paidAt?: string;
}

// Dispute Types
export type DisputeReason = 
  | 'wrong_checkin_time'
  | 'technical_issue'
  | 'duplicate_entry'
  | 'incorrect_credits'
  | 'other';

export interface DisputeCreateRequest {
  bookingId: string;
  reason: DisputeReason;
  notes: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  reason: DisputeReason;
  notes: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  createdAt: string;
  resolvedAt?: string;
}

// Settings Types
export interface Location {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'staff' | 'manager';
  invitedAt: string;
  joinedAt?: string;
  status: 'pending' | 'active' | 'removed';
}

export interface PartnerOrganization {
  id: string;
  displayName: string;
  legalName: string;
  locations: Location[];
  staff: StaffMember[];
  stripeConnectStatus: StripeConnectStatus;
  stripeConnectUrl?: string;
}

export interface InviteStaffRequest {
  email: string;
  role: 'staff' | 'manager';
}

// Class Template Types
export interface ClassTemplate {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  ageMin?: number;
  ageMax?: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Analytics Types
export interface MonthlyAnalytics {
  period: string; // YYYY-MM
  overview: {
    totalSessions: number;
    totalCheckins: number;
    uniqueKids: number;
    totalCreditsUsed: number;
    estimatedRevenueUsd: number;
    avgCheckinsPerSession: number;
    kvpUtilizationRate: number; // percentage of KVP spots filled
  };
  comparison: {
    sessionsChange: number; // percentage change from previous month
    checkinsChange: number;
    revenueChange: number;
  };
  topClasses: Array<{
    classTemplateId: string;
    classTitle: string;
    totalSessions: number;
    totalCheckins: number;
    avgAttendance: number;
    revenueUsd: number;
  }>;
  locationBreakdown: Array<{
    locationId: string;
    locationName: string;
    sessions: number;
    checkins: number;
    revenueUsd: number;
  }>;
  weeklyTrend: Array<{
    weekStart: string;
    sessions: number;
    checkins: number;
    revenueUsd: number;
  }>;
  peakTimes: Array<{
    dayOfWeek: number; // 0-6, Sunday-Saturday
    hour: number; // 0-23
    avgCheckins: number;
  }>;
}

// Filter Types
export interface AttendanceFilters {
  dateFrom?: string;
  dateTo?: string;
  locationId?: string;
  classTemplateId?: string;
}

export interface SessionFilters {
  from: string;
  to: string;
  locationId?: string;
  status?: SessionStatus;
}
