'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PartnerSummary } from '@/types';
import { getPartnerSummary } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout';
import { SummaryCard } from '@/components/partner';
import { Button, Card, Badge } from '@/components/ui';
import { LoadingState, ErrorState, CardSkeleton } from '@/components/ui/states';
import {
  CalendarDays,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Plus,
  ScanLine,
  Calendar,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function PartnerDashboard() {
  const [summary, setSummary] = useState<PartnerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getPartnerSummary();
    
    if (result.error) {
      setError(result.error);
    } else {
      setSummary(result.data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's your studio overview."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <ErrorState message={error} onRetry={fetchSummary} />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`Welcome, ${summary.partnerOrgName}`}
        description="Here's your studio overview for today."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Today's Sessions"
          value={summary.todaySessionsCount}
          subtitle="Scheduled classes"
          icon={<CalendarDays className="w-6 h-6" />}
          variant="teal"
        />
        <SummaryCard
          title="Monthly Check-ins"
          value={summary.monthCheckinsCount}
          subtitle="Verified attendees"
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="orange"
        />
        <SummaryCard
          title="Estimated Earnings"
          value={formatCurrency(summary.estimatedEarningsUsd)}
          subtitle="This period"
          icon={<DollarSign className="w-6 h-6" />}
          variant="blue"
        />
        <SummaryCard
          title="Payout Status"
          value={summary.payoutStatus.charAt(0).toUpperCase() + summary.payoutStatus.slice(1)}
          subtitle={
            summary.stripeConnectStatus === 'connected'
              ? 'Stripe connected'
              : 'Complete setup →'
          }
          icon={<CreditCard className="w-6 h-6" />}
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-deep-play-blue mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/partner/calendar">
          <Card className="hover:shadow-card-hover hover:border-explorer-teal/30 border-2 border-transparent transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-explorer-teal/10 text-explorer-teal group-hover:bg-explorer-teal group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-deep-play-blue">Create Session</h3>
                <p className="text-sm text-slate-500">Schedule a new class</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-explorer-teal transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/partner/scanner">
          <Card className="hover:shadow-card-hover hover:border-adventure-orange/30 border-2 border-transparent transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-adventure-orange/10 text-adventure-orange group-hover:bg-adventure-orange group-hover:text-white transition-colors">
                <ScanLine className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-deep-play-blue">Open Scanner</h3>
                <p className="text-sm text-slate-500">Check in attendees</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-adventure-orange transition-colors" />
            </div>
          </Card>
        </Link>

        <Link href="/partner/calendar">
          <Card className="hover:shadow-card-hover hover:border-deep-play-blue/30 border-2 border-transparent transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-deep-play-blue/10 text-deep-play-blue group-hover:bg-deep-play-blue group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-deep-play-blue">View Calendar</h3>
                <p className="text-sm text-slate-500">Manage your schedule</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-deep-play-blue transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Stripe Connect Status */}
      {summary.stripeConnectStatus !== 'connected' && (
        <Card className="bg-gradient-to-r from-adventure-orange/5 to-adventure-orange/10 border-adventure-orange/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-adventure-orange" />
                <h3 className="font-semibold text-deep-play-blue">
                  Complete Your Payout Setup
                </h3>
              </div>
              <p className="text-sm text-slate-600">
                Connect your Stripe account to receive payouts for attended sessions.
              </p>
            </div>
            <Badge variant="status" status={summary.stripeConnectStatus} />
            <Button variant="secondary" size="sm">
              Complete Setup
            </Button>
          </div>
        </Card>
      )}

      {/* Partner Info Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-xs text-slate-400">
          Partner Organization ID: <span className="font-mono">{summary.partnerOrgId}</span>
        </p>
      </div>
    </div>
  );
}
