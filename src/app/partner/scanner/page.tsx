'use client';

import { PageHeader } from '@/components/layout';
import { CheckinScanner } from '@/components/partner';
import { Card } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

export default function ScannerPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Check-in Scanner"
        description="Scan QR codes or enter booking tokens to check in attendees."
      />

      {/* Info Banner */}
      <Card className="mb-6 bg-explorer-teal/5 border-explorer-teal/20">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-explorer-teal flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-deep-play-blue">
              <strong>Important:</strong> Check-ins can only be performed within the allowed time window
              (typically 30 minutes before and 15 minutes after the session start time).
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Each booking token can only be used once. Attendance records are locked after check-in.
            </p>
          </div>
        </div>
      </Card>

      {/* Scanner Component */}
      <CheckinScanner />

      {/* Tips Section */}
      <div className="mt-8 max-w-xl mx-auto">
        <h3 className="text-sm font-semibold text-deep-play-blue mb-3">
          Quick Tips
        </h3>
        <div className="space-y-2 text-sm text-slate-500">
          <p>
            • Ask parents to show their booking confirmation QR code
          </p>
          <p>
            • If scanning doesn't work, parents can read their booking code aloud
          </p>
          <p>
            • For any issues, use the "Help" link above to contact support
          </p>
        </div>
      </div>
    </div>
  );
}
