'use client';

import { useEffect, useState } from 'react';
import { EarningsReport, PayoutBatch } from '@/types';
import { getEarningsReport, getPayoutBatches } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout';
import { SummaryCard } from '@/components/partner';
import { Card, Badge, Button, Select } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState, CardSkeleton } from '@/components/ui/states';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
} from 'lucide-react';
import { format, subMonths } from 'date-fns';

export default function EarningsPage() {
  const [report, setReport] = useState<EarningsReport | null>(null);
  const [payouts, setPayouts] = useState<PayoutBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'));

  // Generate period options (last 12 months)
  const periodOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    const [reportResult, payoutsResult] = await Promise.all([
      getEarningsReport(selectedPeriod),
      getPayoutBatches(),
    ]);

    if (reportResult.error) {
      setError(reportResult.error);
    } else {
      setReport(reportResult.data);
    }

    if (payoutsResult.data) {
      setPayouts(payoutsResult.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const totalPaid = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountUsd, 0);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Earnings"
        description="Track your earnings and payout history."
        actions={
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
        }
      />

      {/* Disclaimer Banner */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Earnings Disclaimer
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Displayed earnings are estimates based on verified check-ins. Final payout amounts
              are calculated according to KidVenture Pass settlement rules and may differ from estimates.
              Payouts are processed monthly after the settlement period ends.
            </p>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState message={error} onRetry={fetchData} />
      )}

      {/* Earnings Content */}
      {!isLoading && !error && report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <SummaryCard
              title="Estimated This Period"
              value={formatCurrency(report.estimatedTotalUsd)}
              subtitle={format(new Date(report.period + '-01'), 'MMMM yyyy')}
              icon={<DollarSign className="w-6 h-6" />}
              variant="teal"
            />
            <SummaryCard
              title="Sessions with Check-ins"
              value={report.lineItems.length}
              subtitle="This period"
              icon={<TrendingUp className="w-6 h-6" />}
              variant="orange"
            />
            <SummaryCard
              title="Total Paid to Date"
              value={formatCurrency(totalPaid)}
              subtitle={`${payouts.filter(p => p.status === 'paid').length} payouts`}
              icon={<CheckCircle2 className="w-6 h-6" />}
              variant="blue"
            />
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Items */}
            <Card>
              <h3 className="text-lg font-semibold text-deep-play-blue mb-4">
                Earnings Breakdown
              </h3>
              {report.lineItems.length > 0 ? (
                <div className="space-y-3">
                  {report.lineItems.map((item, index) => (
                    <div
                      key={`${item.sessionId}-${index}`}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-deep-play-blue">
                          {item.classTitle}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(item.date)} • {item.checkinsCount} check-in
                          {item.checkinsCount !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {item.sessionId}
                        </p>
                      </div>
                      <p className="font-semibold text-explorer-teal">
                        {formatCurrency(item.amountUsd)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No earnings this period"
                  description="Earnings will appear here after check-ins are recorded."
                />
              )}
            </Card>

            {/* Payout History */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-deep-play-blue">
                  Payout History
                </h3>
              </div>
              {payouts.length > 0 ? (
                <div className="space-y-3">
                  {payouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            p-2 rounded-lg
                            ${payout.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-600'
                              : payout.status === 'processing'
                              ? 'bg-blue-100 text-blue-600'
                              : payout.status === 'held'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-amber-100 text-amber-600'
                            }
                          `}
                        >
                          {payout.status === 'paid' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-deep-play-blue">
                            {formatCurrency(payout.amountUsd)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="status" status={payout.status} size="sm" />
                        {payout.paidAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            Paid {formatDate(payout.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FileText className="w-8 h-8 text-adventure-orange" />}
                  title="No payouts yet"
                  description="Your payout history will appear here once you receive your first payout."
                />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
