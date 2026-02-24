'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckinRecord, AttendanceFilters } from '@/types';
import { getCheckinRecords } from '@/lib/api';
import { formatDateTime, formatDate, getCurrentMonthRange } from '@/lib/utils';
import { PageHeader } from '@/components/layout';
import { DisputeModal } from '@/components/partner';
import { Button, Card, Badge, Input, Select } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from '@/components/ui/states';
import { ClipboardList, Filter, AlertTriangle, Download } from 'lucide-react';
import { mockPartnerOrganization, mockClassTemplates } from '@/lib/mock-data';
import { format, subDays } from 'date-fns';

export default function AttendancePage() {
  const [records, setRecords] = useState<CheckinRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({
    dateFrom: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    dateTo: format(new Date(), 'yyyy-MM-dd'),
  });
  const [showFilters, setShowFilters] = useState(false);
  const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getCheckinRecords(filters);

    if (result.error) {
      setError(result.error);
    } else {
      setRecords(result.data || []);
    }

    setIsLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleFilterChange = (key: keyof AttendanceFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const locationOptions = [
    { value: '', label: 'All Locations' },
    ...mockPartnerOrganization.locations.map(l => ({
      value: l.id,
      label: l.name,
    })),
  ];

  const classOptions = [
    { value: '', label: 'All Classes' },
    ...mockClassTemplates.map(t => ({
      value: t.id,
      label: t.title,
    })),
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Attendance Records"
        description="View check-in history and request disputes if needed."
        actions={
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        }
      />

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="From Date"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
            <Select
              label="Location"
              value={filters.locationId || ''}
              onChange={(e) => handleFilterChange('locationId', e.target.value)}
              options={locationOptions}
            />
            <Select
              label="Class"
              value={filters.classTemplateId || ''}
              onChange={(e) => handleFilterChange('classTemplateId', e.target.value)}
              options={classOptions}
            />
          </div>
        </Card>
      )}

      {/* Important Notice */}
      <Card className="mb-6 bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              Read-Only Attendance Records
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Attendance records cannot be edited after check-in. If you believe there's an error,
              please use the "Request Dispute" button to submit a review request.
            </p>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={5} />}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState message={error} onRetry={fetchRecords} />
      )}

      {/* Records List */}
      {!isLoading && !error && records.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left p-4 text-sm font-medium text-slate-500">
                    Session
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">
                    Attendee
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">
                    Check-in Time
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">
                    Credits
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-deep-play-blue">
                          {record.classTitle}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(record.sessionStartAt)} • {record.locationName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          Session: {record.sessionId}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-deep-play-blue">
                        {record.kidNameMasked || 'N/A'}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-deep-play-blue">
                        {formatDateTime(record.checkedInAt)}
                      </p>
                    </td>
                    <td className="p-4">
                      <Badge variant="status" status={record.bookingStatus} />
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-deep-play-blue">
                        {record.creditsCost}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDisputeBookingId(record.bookingId)}
                      >
                        Request Dispute
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {records.length} record{records.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm font-medium text-deep-play-blue">
                Total Credits: {records.reduce((sum, r) => sum + r.creditsCost, 0)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && records.length === 0 && (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8 text-adventure-orange" />}
          title="No attendance records found"
          description="Check-in records will appear here after attendees are scanned in."
        />
      )}

      {/* Dispute Modal */}
      {disputeBookingId && (
        <DisputeModal
          isOpen={!!disputeBookingId}
          onClose={() => setDisputeBookingId(null)}
          bookingId={disputeBookingId}
          onSuccess={() => {
            setDisputeBookingId(null);
            // Optionally show success message
          }}
        />
      )}
    </div>
  );
}
