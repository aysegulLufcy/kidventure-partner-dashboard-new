'use client';

import { useEffect, useState } from 'react';
import { MonthlyAnalytics } from '@/types';
import { getMonthlyAnalytics } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/layout';
import { SummaryCard } from '@/components/partner';
import { Card, Select, Badge } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/ui/states';
import {
  CalendarDays,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { format, subMonths } from 'date-fns';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null);
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

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getMonthlyAnalytics(selectedPeriod);

    if (result.error) {
      setError(result.error);
    } else {
      setAnalytics(result.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const renderTrendBadge = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span
        className={`
          inline-flex items-center gap-1 text-sm font-medium
          ${isPositive ? 'text-emerald-600' : 'text-red-600'}
        `}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    );
  };

  // Simple bar chart component
  const BarChart = ({ 
    data, 
    maxValue,
    color = 'bg-explorer-teal'
  }: { 
    data: { label: string; value: number }[]; 
    maxValue: number;
    color?: string;
  }) => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-600">{item.label}</span>
            <span className="text-sm font-medium text-deep-play-blue">{item.value}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-500`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          description="Monthly performance reports for your studio."
        />
        <LoadingState message="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Analytics" />
        <ErrorState message={error} onRetry={fetchAnalytics} />
      </div>
    );
  }

  if (!analytics) return null;

  const { overview, comparison, topClasses, locationBreakdown, weeklyTrend, peakTimes } = analytics;

  // Prepare chart data
  const weeklyChartData = weeklyTrend.map(week => ({
    label: format(new Date(week.weekStart), 'MMM d'),
    value: week.checkins,
  }));
  const maxWeeklyCheckins = Math.max(...weeklyTrend.map(w => w.checkins));

  const classChartData = topClasses.map(c => ({
    label: c.classTitle,
    value: c.totalCheckins,
  }));
  const maxClassCheckins = Math.max(...topClasses.map(c => c.totalCheckins));

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Monthly performance reports for your studio via KidVenture Pass."
        actions={
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Sessions"
          value={overview.totalSessions}
          subtitle={
            <span className="flex items-center gap-2">
              vs last month {renderTrendBadge(comparison.sessionsChange)}
            </span>
          }
          icon={<CalendarDays className="w-6 h-6" />}
          variant="teal"
        />
        <SummaryCard
          title="Total Check-ins"
          value={overview.totalCheckins}
          subtitle={
            <span className="flex items-center gap-2">
              vs last month {renderTrendBadge(comparison.checkinsChange)}
            </span>
          }
          icon={<Users className="w-6 h-6" />}
          variant="orange"
        />
        <SummaryCard
          title="Unique Kids"
          value={overview.uniqueKids}
          subtitle={`${overview.totalCreditsUsed} credits used`}
          icon={<Target className="w-6 h-6" />}
          variant="blue"
        />
        <SummaryCard
          title="Est. Revenue"
          value={formatCurrency(overview.estimatedRevenueUsd)}
          subtitle={
            <span className="flex items-center gap-2">
              vs last month {renderTrendBadge(comparison.revenueChange)}
            </span>
          }
          icon={<DollarSign className="w-6 h-6" />}
        />
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-explorer-teal/10 text-explorer-teal">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg Check-ins/Session</p>
              <p className="text-2xl font-bold text-deep-play-blue">
                {overview.avgCheckinsPerSession.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-adventure-orange/10 text-adventure-orange">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">KVP Utilization Rate</p>
              <p className="text-2xl font-bold text-deep-play-blue">
                {overview.kvpUtilizationRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-deep-play-blue/10 text-deep-play-blue">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Revenue per Check-in</p>
              <p className="text-2xl font-bold text-deep-play-blue">
                {formatCurrency(overview.estimatedRevenueUsd / overview.totalCheckins)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Trend */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-explorer-teal/10 text-explorer-teal">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-deep-play-blue">Weekly Check-in Trend</h3>
              <p className="text-sm text-slate-500">Check-ins by week this month</p>
            </div>
          </div>
          <BarChart data={weeklyChartData} maxValue={maxWeeklyCheckins} />
          
          {/* Weekly summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Sessions/Week</p>
              <p className="font-semibold text-deep-play-blue">
                {(weeklyTrend.reduce((sum, w) => sum + w.sessions, 0) / weeklyTrend.length).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Check-ins/Week</p>
              <p className="font-semibold text-deep-play-blue">
                {(weeklyTrend.reduce((sum, w) => sum + w.checkins, 0) / weeklyTrend.length).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg Revenue/Week</p>
              <p className="font-semibold text-deep-play-blue">
                {formatCurrency(weeklyTrend.reduce((sum, w) => sum + w.revenueUsd, 0) / weeklyTrend.length)}
              </p>
            </div>
          </div>
        </Card>

        {/* Top Classes */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-adventure-orange/10 text-adventure-orange">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-deep-play-blue">Top Performing Classes</h3>
              <p className="text-sm text-slate-500">By total check-ins this month</p>
            </div>
          </div>
          <BarChart data={classChartData} maxValue={maxClassCheckins} color="bg-adventure-orange" />
          
          {/* Class details table */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left font-medium pb-2">Class</th>
                  <th className="text-right font-medium pb-2">Sessions</th>
                  <th className="text-right font-medium pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topClasses.map((cls) => (
                  <tr key={cls.classTemplateId} className="border-t border-slate-50">
                    <td className="py-2 text-deep-play-blue truncate max-w-[150px]">
                      {cls.classTitle}
                    </td>
                    <td className="py-2 text-right text-slate-600">{cls.totalSessions}</td>
                    <td className="py-2 text-right font-medium text-deep-play-blue">
                      {formatCurrency(cls.revenueUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Location & Peak Times Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Breakdown */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-deep-play-blue/10 text-deep-play-blue">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-deep-play-blue">Performance by Location</h3>
              <p className="text-sm text-slate-500">Revenue and check-ins by studio</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {locationBreakdown.map((location) => {
              const percentage = (location.revenueUsd / overview.estimatedRevenueUsd) * 100;
              return (
                <div key={location.locationId} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-deep-play-blue">{location.locationName}</h4>
                    <Badge size="sm">{percentage.toFixed(0)}% of revenue</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Sessions</p>
                      <p className="font-semibold text-deep-play-blue">{location.sessions}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Check-ins</p>
                      <p className="font-semibold text-deep-play-blue">{location.checkins}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Revenue</p>
                      <p className="font-semibold text-explorer-teal">
                        {formatCurrency(location.revenueUsd)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Peak Times */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-explorer-teal/10 text-explorer-teal">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-deep-play-blue">Peak Check-in Times</h3>
              <p className="text-sm text-slate-500">Best performing time slots</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {peakTimes.map((peak, index) => {
              const hour = peak.hour;
              const timeStr = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
              const barWidth = (peak.avgCheckins / peakTimes[0].avgCheckins) * 100;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 flex-shrink-0">
                    <p className="text-sm font-medium text-deep-play-blue">
                      {DAYS_OF_WEEK[peak.dayOfWeek]}
                    </p>
                    <p className="text-xs text-slate-500">{timeStr}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-explorer-teal to-explorer-teal/70 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-xs font-medium text-white">
                          {peak.avgCheckins.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-explorer-teal/10 text-explorer-teal border-explorer-teal/20">
                      Top
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-deep-play-blue">💡 Insight:</span> Your busiest times are 
              {' '}<strong>{DAYS_OF_WEEK[peakTimes[0].dayOfWeek]} mornings</strong>. Consider adding more 
              KVP spots during these peak hours to maximize revenue.
            </p>
          </div>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500">
          <strong>Note:</strong> Analytics data is based on verified check-ins through KidVenture Pass. 
          Revenue figures are estimates and final payouts may vary based on settlement rules. 
          Data refreshes daily.
        </p>
      </div>
    </div>
  );
}
