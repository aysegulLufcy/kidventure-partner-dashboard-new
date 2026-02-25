import {
  PartnerSummary,
  Session,
  CreateSessionRequest,
  UpdateSessionRequest,
  CheckinResult,
  CheckinRecord,
  EarningsReport,
  PayoutBatch,
  PartnerOrganization,
  ClassTemplate,
  DisputeCreateRequest,
  Dispute,
  InviteStaffRequest,
  StaffMember,
  ApiResponse,
  SessionFilters,
  AttendanceFilters,
  MonthlyAnalytics,
} from '@/types';
import {
  mockPartnerSummary,
  mockSessions,
  mockCheckinRecords,
  mockValidCheckinResult,
  mockEarningsReport,
  mockPayoutBatches,
  mockPartnerOrganization,
  mockClassTemplates,
  mockMonthlyAnalytics,
} from './mock-data';

// ============================================
// API Client Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Simulate network delay for mock data
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        data: null,
        error: errorData.message || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

// ============================================
// Partner Summary API
// ============================================

export async function getPartnerSummary(): Promise<ApiResponse<PartnerSummary>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    return { data: mockPartnerSummary, error: null };
  }
  return apiRequest<PartnerSummary>('/api/partner/summary');
}

// ============================================
// Sessions API
// ============================================

export async function getSessions(filters: SessionFilters): Promise<ApiResponse<Session[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    const filtered = mockSessions.filter(session => {
      const sessionDate = new Date(session.startAt);
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);
      return sessionDate >= fromDate && sessionDate <= toDate;
    });
    return { data: filtered, error: null };
  }
  
  const params = new URLSearchParams({
    from: filters.from,
    to: filters.to,
    ...(filters.locationId && { locationId: filters.locationId }),
    ...(filters.status && { status: filters.status }),
  });
  
  return apiRequest<Session[]>(`/api/partner/sessions?${params}`);
}

export async function createSession(
  request: CreateSessionRequest
): Promise<ApiResponse<Session>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(600);
    const template = mockClassTemplates.find(t => t.id === request.classTemplateId);
    const newSession: Session = {
      id: `sess_${Date.now()}`,
      classTemplateId: request.classTemplateId,
      classTitle: template?.title || 'New Class',
      locationId: request.locationId,
      locationName: mockPartnerOrganization.locations.find(l => l.id === request.locationId)?.name || 'Unknown',
      startAt: `${request.date}T${request.startTime}:00`,
      endAt: `${request.date}T${request.endTime}:00`,
      capacityTotal: request.capacityTotal,
      capacityKvp: request.capacityKvp,
      kvpSpotsLeft: request.capacityKvp,
      status: 'open',
    };
    return { data: newSession, error: null };
  }
  
  return apiRequest<Session>('/api/partner/sessions', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateSession(
  sessionId: string,
  request: UpdateSessionRequest
): Promise<ApiResponse<Session>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    const session = mockSessions.find(s => s.id === sessionId);
    if (!session) {
      return { data: null, error: 'Session not found' };
    }
    const updated = { ...session, ...request };
    return { data: updated, error: null };
  }
  
  return apiRequest<Session>(`/api/partner/sessions/${sessionId}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export async function closeSessionBookings(sessionId: string): Promise<ApiResponse<Session>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    const session = mockSessions.find(s => s.id === sessionId);
    if (!session) {
      return { data: null, error: 'Session not found' };
    }
    return { data: { ...session, status: 'closed' }, error: null };
  }
  
  return apiRequest<Session>(`/api/partner/sessions/${sessionId}/close`, {
    method: 'POST',
  });
}

// ============================================
// Check-in API
// ============================================

export async function submitCheckin(token: string): Promise<ApiResponse<CheckinResult>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(800);
    // Simulate different responses based on token
    if (token.toLowerCase().includes('invalid')) {
      return {
        data: {
          status: 'invalid',
          message: 'This booking code is invalid or has expired.',
        },
        error: null,
      };
    }
    if (token.toLowerCase().includes('duplicate')) {
      return {
        data: {
          status: 'duplicate',
          message: 'This booking has already been checked in.',
          booking: {
            id: 'bk_001',
            sessionId: 'sess_001',
            classTitle: 'Creative Movement (Ages 3-5)',
            startAt: new Date().toISOString(),
            kidNameMasked: 'Emma S.',
          },
          checkedInAt: new Date(Date.now() - 3600000).toISOString(),
        },
        error: null,
      };
    }
    return { data: mockValidCheckinResult, error: null };
  }
  
  return apiRequest<CheckinResult>('/api/partner/checkins', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// ============================================
// Attendance API
// ============================================

export async function getCheckinRecords(
  filters: AttendanceFilters
): Promise<ApiResponse<CheckinRecord[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    let filtered = [...mockCheckinRecords];
    
    if (filters.dateFrom) {
      filtered = filtered.filter(r => r.sessionStartAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => r.sessionStartAt <= filters.dateTo!);
    }
    if (filters.locationId) {
      filtered = filtered.filter(r => 
        mockSessions.find(s => s.id === r.sessionId)?.locationId === filters.locationId
      );
    }
    
    return { data: filtered, error: null };
  }
  
  const params = new URLSearchParams();
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.locationId) params.set('locationId', filters.locationId);
  if (filters.classTemplateId) params.set('classTemplateId', filters.classTemplateId);
  
  return apiRequest<CheckinRecord[]>(`/api/partner/checkins?${params}`);
}

// ============================================
// Earnings API
// ============================================

export async function getEarningsReport(period: string): Promise<ApiResponse<EarningsReport>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    return { data: mockEarningsReport, error: null };
  }
  
  return apiRequest<EarningsReport>(`/api/partner/earnings?period=${period}`);
}

export async function getPayoutBatches(): Promise<ApiResponse<PayoutBatch[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    return { data: mockPayoutBatches, error: null };
  }
  
  return apiRequest<PayoutBatch[]>('/api/partner/payouts');
}

// ============================================
// Disputes API
// ============================================

export async function createDispute(
  request: DisputeCreateRequest
): Promise<ApiResponse<Dispute>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(600);
    const dispute: Dispute = {
      id: `disp_${Date.now()}`,
      bookingId: request.bookingId,
      reason: request.reason,
      notes: request.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return { data: dispute, error: null };
  }
  
  return apiRequest<Dispute>('/api/partner/disputes', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// ============================================
// Settings API
// ============================================

export async function getPartnerOrganization(): Promise<ApiResponse<PartnerOrganization>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    return { data: mockPartnerOrganization, error: null };
  }
  
  return apiRequest<PartnerOrganization>('/api/partner/organization');
}

export async function updatePartnerOrganization(
  updates: Partial<Pick<PartnerOrganization, 'displayName'>>
): Promise<ApiResponse<PartnerOrganization>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(400);
    return { 
      data: { ...mockPartnerOrganization, ...updates }, 
      error: null 
    };
  }
  
  return apiRequest<PartnerOrganization>('/api/partner/organization', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function inviteStaff(
  request: InviteStaffRequest
): Promise<ApiResponse<StaffMember>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    const newStaff: StaffMember = {
      id: `staff_${Date.now()}`,
      email: request.email,
      role: request.role,
      invitedAt: new Date().toISOString(),
      status: 'pending',
    };
    return { data: newStaff, error: null };
  }
  
  // In production, this calls the backend API which uses Supabase Admin
  // to send an invite email with the signup redirect URL
  return apiRequest<StaffMember>('/api/partner/staff/invite', {
    method: 'POST',
    body: JSON.stringify({
      ...request,
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/signup`,
    }),
  });
}

export async function removeStaffAccess(staffId: string): Promise<ApiResponse<void>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    return { data: undefined, error: null };
  }
  
  return apiRequest<void>(`/api/partner/staff/${staffId}`, {
    method: 'DELETE',
  });
}

// ============================================
// Class Templates API
// ============================================

export async function getClassTemplates(): Promise<ApiResponse<ClassTemplate[]>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(300);
    return { data: mockClassTemplates, error: null };
  }
  
  return apiRequest<ClassTemplate[]>('/api/partner/class-templates');
}

// ============================================
// Analytics API
// ============================================

export async function getMonthlyAnalytics(period: string): Promise<ApiResponse<MonthlyAnalytics>> {
  if (USE_MOCK_DATA) {
    await simulateDelay(500);
    // Return mock data with the requested period
    return { 
      data: { ...mockMonthlyAnalytics, period }, 
      error: null 
    };
  }
  
  return apiRequest<MonthlyAnalytics>(`/api/partner/analytics?period=${period}`);
}
