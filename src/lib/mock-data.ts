import {
  PartnerSummary,
  Session,
  CheckinResult,
  CheckinRecord,
  EarningsReport,
  PayoutBatch,
  PartnerOrganization,
  ClassTemplate,
  MonthlyAnalytics,
} from '@/types';
import { addDays, format, subDays, startOfWeek } from 'date-fns';

// ============================================
// Mock Data for Partner Dashboard
// ============================================

const today = new Date();

export const mockPartnerSummary: PartnerSummary = {
  partnerOrgName: 'Little Movers Dance Studio',
  partnerOrgId: 'org_abc123',
  todaySessionsCount: 4,
  monthCheckinsCount: 127,
  estimatedEarningsUsd: 2847.50,
  payoutStatus: 'pending',
  stripeConnectStatus: 'connected',
};

export const mockClassTemplates: ClassTemplate[] = [
  {
    id: 'ct_001',
    title: 'Creative Movement (Ages 3-5)',
    description: 'Introduction to dance through imaginative play',
    durationMinutes: 45,
    ageMin: 3,
    ageMax: 5,
  },
  {
    id: 'ct_002',
    title: 'Junior Ballet',
    description: 'Basic ballet technique for beginners',
    durationMinutes: 60,
    ageMin: 5,
    ageMax: 8,
  },
  {
    id: 'ct_003',
    title: 'Hip Hop Kids',
    description: 'Fun, high-energy hip hop dance class',
    durationMinutes: 45,
    ageMin: 6,
    ageMax: 10,
  },
  {
    id: 'ct_004',
    title: 'Tumbling & Gymnastics',
    description: 'Fundamental gymnastics skills',
    durationMinutes: 60,
    ageMin: 4,
    ageMax: 8,
  },
];

export const mockSessions: Session[] = [
  {
    id: 'sess_001',
    classTemplateId: 'ct_001',
    classTitle: 'Creative Movement (Ages 3-5)',
    locationId: 'loc_001',
    locationName: 'South End Studio',
    startAt: format(addDays(today, 0), "yyyy-MM-dd'T'09:00:00"),
    endAt: format(addDays(today, 0), "yyyy-MM-dd'T'09:45:00"),
    capacityTotal: 12,
    capacityKvp: 4,
    kvpSpotsLeft: 2,
    status: 'open',
  },
  {
    id: 'sess_002',
    classTemplateId: 'ct_002',
    classTitle: 'Junior Ballet',
    locationId: 'loc_001',
    locationName: 'South End Studio',
    startAt: format(addDays(today, 0), "yyyy-MM-dd'T'10:30:00"),
    endAt: format(addDays(today, 0), "yyyy-MM-dd'T'11:30:00"),
    capacityTotal: 10,
    capacityKvp: 3,
    kvpSpotsLeft: 1,
    status: 'open',
  },
  {
    id: 'sess_003',
    classTemplateId: 'ct_003',
    classTitle: 'Hip Hop Kids',
    locationId: 'loc_002',
    locationName: 'NoDa Location',
    startAt: format(addDays(today, 0), "yyyy-MM-dd'T'14:00:00"),
    endAt: format(addDays(today, 0), "yyyy-MM-dd'T'14:45:00"),
    capacityTotal: 15,
    capacityKvp: 5,
    kvpSpotsLeft: 3,
    status: 'open',
  },
  {
    id: 'sess_004',
    classTemplateId: 'ct_004',
    classTitle: 'Tumbling & Gymnastics',
    locationId: 'loc_001',
    locationName: 'South End Studio',
    startAt: format(addDays(today, 0), "yyyy-MM-dd'T'16:00:00"),
    endAt: format(addDays(today, 0), "yyyy-MM-dd'T'17:00:00"),
    capacityTotal: 8,
    capacityKvp: 3,
    kvpSpotsLeft: 0,
    status: 'open',
  },
  {
    id: 'sess_005',
    classTemplateId: 'ct_001',
    classTitle: 'Creative Movement (Ages 3-5)',
    locationId: 'loc_001',
    locationName: 'South End Studio',
    startAt: format(addDays(today, 1), "yyyy-MM-dd'T'09:00:00"),
    endAt: format(addDays(today, 1), "yyyy-MM-dd'T'09:45:00"),
    capacityTotal: 12,
    capacityKvp: 4,
    kvpSpotsLeft: 4,
    status: 'open',
  },
  {
    id: 'sess_006',
    classTemplateId: 'ct_002',
    classTitle: 'Junior Ballet',
    locationId: 'loc_002',
    locationName: 'NoDa Location',
    startAt: format(addDays(today, 2), "yyyy-MM-dd'T'11:00:00"),
    endAt: format(addDays(today, 2), "yyyy-MM-dd'T'12:00:00"),
    capacityTotal: 10,
    capacityKvp: 3,
    kvpSpotsLeft: 3,
    status: 'open',
  },
  {
    id: 'sess_007',
    classTemplateId: 'ct_003',
    classTitle: 'Hip Hop Kids',
    locationId: 'loc_001',
    locationName: 'South End Studio',
    startAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:00:00"),
    endAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:45:00"),
    capacityTotal: 15,
    capacityKvp: 5,
    kvpSpotsLeft: 0,
    status: 'closed',
  },
];

export const mockCheckinRecords: CheckinRecord[] = [
  {
    id: 'chk_001',
    bookingId: 'bk_001',
    sessionId: 'sess_007',
    classTitle: 'Hip Hop Kids',
    sessionStartAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:00:00"),
    checkedInAt: format(subDays(today, 1), "yyyy-MM-dd'T'13:52:00"),
    bookingStatus: 'attended',
    creditsCost: 2,
    kidNameMasked: 'Emma S.',
    locationName: 'South End Studio',
  },
  {
    id: 'chk_002',
    bookingId: 'bk_002',
    sessionId: 'sess_007',
    classTitle: 'Hip Hop Kids',
    sessionStartAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:00:00"),
    checkedInAt: format(subDays(today, 1), "yyyy-MM-dd'T'13:55:00"),
    bookingStatus: 'attended',
    creditsCost: 2,
    kidNameMasked: 'Lucas M.',
    locationName: 'South End Studio',
  },
  {
    id: 'chk_003',
    bookingId: 'bk_003',
    sessionId: 'sess_007',
    classTitle: 'Hip Hop Kids',
    sessionStartAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:00:00"),
    checkedInAt: format(subDays(today, 1), "yyyy-MM-dd'T'13:58:00"),
    bookingStatus: 'attended',
    creditsCost: 2,
    kidNameMasked: 'Olivia T.',
    locationName: 'South End Studio',
  },
  {
    id: 'chk_004',
    bookingId: 'bk_004',
    sessionId: 'sess_007',
    classTitle: 'Hip Hop Kids',
    sessionStartAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:00:00"),
    checkedInAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:01:00"),
    bookingStatus: 'attended',
    creditsCost: 2,
    kidNameMasked: 'Noah R.',
    locationName: 'South End Studio',
  },
  {
    id: 'chk_005',
    bookingId: 'bk_005',
    sessionId: 'sess_007',
    classTitle: 'Hip Hop Kids',
    sessionStartAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:00:00"),
    checkedInAt: format(subDays(today, 1), "yyyy-MM-dd'T'14:02:00"),
    bookingStatus: 'attended',
    creditsCost: 2,
    kidNameMasked: 'Sophia K.',
    locationName: 'South End Studio',
  },
];

export const mockValidCheckinResult: CheckinResult = {
  status: 'valid',
  message: 'Check-in successful!',
  booking: {
    id: 'bk_010',
    sessionId: 'sess_001',
    classTitle: 'Creative Movement (Ages 3-5)',
    startAt: format(today, "yyyy-MM-dd'T'09:00:00"),
    kidNameMasked: 'Emma S.',
    parentNameMasked: 'Sarah S.',
  },
  checkedInAt: new Date().toISOString(),
};

export const mockInvalidCheckinResult: CheckinResult = {
  status: 'invalid',
  message: 'This booking code has expired. The booking window closed 30 minutes ago.',
};

export const mockDuplicateCheckinResult: CheckinResult = {
  status: 'duplicate',
  message: 'This booking has already been checked in.',
  booking: {
    id: 'bk_001',
    sessionId: 'sess_001',
    classTitle: 'Creative Movement (Ages 3-5)',
    startAt: format(today, "yyyy-MM-dd'T'09:00:00"),
    kidNameMasked: 'Emma S.',
  },
  checkedInAt: format(subDays(today, 0), "yyyy-MM-dd'T'08:52:00"),
};

export const mockEarningsReport: EarningsReport = {
  period: format(today, 'yyyy-MM'),
  estimatedTotalUsd: 2847.50,
  lineItems: [
    {
      date: format(subDays(today, 1), 'yyyy-MM-dd'),
      sessionId: 'sess_007',
      classTitle: 'Hip Hop Kids',
      checkinsCount: 5,
      amountUsd: 112.50,
    },
    {
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
      sessionId: 'sess_prev_001',
      classTitle: 'Junior Ballet',
      checkinsCount: 3,
      amountUsd: 67.50,
    },
    {
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
      sessionId: 'sess_prev_002',
      classTitle: 'Creative Movement (Ages 3-5)',
      checkinsCount: 4,
      amountUsd: 90.00,
    },
    {
      date: format(subDays(today, 3), 'yyyy-MM-dd'),
      sessionId: 'sess_prev_003',
      classTitle: 'Tumbling & Gymnastics',
      checkinsCount: 3,
      amountUsd: 67.50,
    },
    {
      date: format(subDays(today, 5), 'yyyy-MM-dd'),
      sessionId: 'sess_prev_004',
      classTitle: 'Hip Hop Kids',
      checkinsCount: 4,
      amountUsd: 90.00,
    },
  ],
};

export const mockPayoutBatches: PayoutBatch[] = [
  {
    id: 'payout_003',
    periodStart: format(subDays(today, 60), 'yyyy-MM-dd'),
    periodEnd: format(subDays(today, 31), 'yyyy-MM-dd'),
    amountUsd: 3245.00,
    status: 'paid',
    paidAt: format(subDays(today, 25), 'yyyy-MM-dd'),
  },
  {
    id: 'payout_002',
    periodStart: format(subDays(today, 90), 'yyyy-MM-dd'),
    periodEnd: format(subDays(today, 61), 'yyyy-MM-dd'),
    amountUsd: 2890.50,
    status: 'paid',
    paidAt: format(subDays(today, 55), 'yyyy-MM-dd'),
  },
  {
    id: 'payout_001',
    periodStart: format(subDays(today, 120), 'yyyy-MM-dd'),
    periodEnd: format(subDays(today, 91), 'yyyy-MM-dd'),
    amountUsd: 2567.00,
    status: 'paid',
    paidAt: format(subDays(today, 85), 'yyyy-MM-dd'),
  },
];

export const mockPartnerOrganization: PartnerOrganization = {
  id: 'org_abc123',
  displayName: 'Little Movers Dance Studio',
  legalName: 'Little Movers LLC',
  locations: [
    {
      id: 'loc_001',
      name: 'South End Studio',
      address: '123 South Blvd, Charlotte, NC 28203',
      isActive: true,
    },
    {
      id: 'loc_002',
      name: 'NoDa Location',
      address: '456 Davidson St, Charlotte, NC 28206',
      isActive: true,
    },
  ],
  staff: [
    {
      id: 'staff_001',
      email: 'owner@littlemovers.com',
      firstName: 'Sarah',
      lastName: 'Mitchell',
      role: 'manager',
      invitedAt: format(subDays(today, 180), 'yyyy-MM-dd'),
      joinedAt: format(subDays(today, 180), 'yyyy-MM-dd'),
      status: 'active',
    },
    {
      id: 'staff_002',
      email: 'instructor@littlemovers.com',
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'staff',
      invitedAt: format(subDays(today, 90), 'yyyy-MM-dd'),
      joinedAt: format(subDays(today, 89), 'yyyy-MM-dd'),
      status: 'active',
    },
    {
      id: 'staff_003',
      email: 'newhire@littlemovers.com',
      role: 'staff',
      invitedAt: format(subDays(today, 2), 'yyyy-MM-dd'),
      status: 'pending',
    },
  ],
  stripeConnectStatus: 'connected',
  stripeConnectUrl: 'https://connect.stripe.com/setup/complete',
};

// Mock user for auth context
export const mockUser = {
  id: 'user_001',
  email: 'owner@littlemovers.com',
  role: 'partner_manager' as const,
  partnerOrgId: 'org_abc123',
  firstName: 'Sarah',
  lastName: 'Mitchell',
};

// Mock Analytics Data
export const mockMonthlyAnalytics: MonthlyAnalytics = {
  period: format(today, 'yyyy-MM'),
  overview: {
    totalSessions: 48,
    totalCheckins: 127,
    uniqueKids: 89,
    totalCreditsUsed: 254,
    estimatedRevenueUsd: 2847.50,
    avgCheckinsPerSession: 2.65,
    kvpUtilizationRate: 78.5,
  },
  comparison: {
    sessionsChange: 12.5,
    checkinsChange: 18.2,
    revenueChange: 15.8,
  },
  topClasses: [
    {
      classTemplateId: 'ct_003',
      classTitle: 'Hip Hop Kids',
      totalSessions: 16,
      totalCheckins: 52,
      avgAttendance: 3.25,
      revenueUsd: 1170.00,
    },
    {
      classTemplateId: 'ct_002',
      classTitle: 'Junior Ballet',
      totalSessions: 12,
      totalCheckins: 34,
      avgAttendance: 2.83,
      revenueUsd: 765.00,
    },
    {
      classTemplateId: 'ct_001',
      classTitle: 'Creative Movement (Ages 3-5)',
      totalSessions: 12,
      totalCheckins: 28,
      avgAttendance: 2.33,
      revenueUsd: 630.00,
    },
    {
      classTemplateId: 'ct_004',
      classTitle: 'Tumbling & Gymnastics',
      totalSessions: 8,
      totalCheckins: 13,
      avgAttendance: 1.63,
      revenueUsd: 282.50,
    },
  ],
  locationBreakdown: [
    {
      locationId: 'loc_001',
      locationName: 'South End Studio',
      sessions: 32,
      checkins: 89,
      revenueUsd: 2002.50,
    },
    {
      locationId: 'loc_002',
      locationName: 'NoDa Location',
      sessions: 16,
      checkins: 38,
      revenueUsd: 845.00,
    },
  ],
  weeklyTrend: [
    {
      weekStart: format(subDays(startOfWeek(today), 21), 'yyyy-MM-dd'),
      sessions: 11,
      checkins: 28,
      revenueUsd: 630.00,
    },
    {
      weekStart: format(subDays(startOfWeek(today), 14), 'yyyy-MM-dd'),
      sessions: 12,
      checkins: 32,
      revenueUsd: 720.00,
    },
    {
      weekStart: format(subDays(startOfWeek(today), 7), 'yyyy-MM-dd'),
      sessions: 13,
      checkins: 35,
      revenueUsd: 787.50,
    },
    {
      weekStart: format(startOfWeek(today), 'yyyy-MM-dd'),
      sessions: 12,
      checkins: 32,
      revenueUsd: 710.00,
    },
  ],
  peakTimes: [
    { dayOfWeek: 6, hour: 10, avgCheckins: 4.2 }, // Saturday 10am
    { dayOfWeek: 6, hour: 9, avgCheckins: 3.8 },  // Saturday 9am
    { dayOfWeek: 0, hour: 14, avgCheckins: 3.5 }, // Sunday 2pm
    { dayOfWeek: 3, hour: 16, avgCheckins: 3.2 }, // Wednesday 4pm
    { dayOfWeek: 2, hour: 17, avgCheckins: 2.9 }, // Tuesday 5pm
  ],
};
