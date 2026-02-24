import { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: ReactNode;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'teal' | 'orange' | 'blue';
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: SummaryCardProps) {
  const variants = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    teal: {
      bg: 'bg-gradient-to-br from-explorer-teal to-kvp-teal-600',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
    },
    orange: {
      bg: 'bg-gradient-to-br from-adventure-orange to-kvp-orange-600',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
    },
    blue: {
      bg: 'bg-gradient-to-br from-deep-play-blue to-kvp-blue-700',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
    },
  };

  const isColored = variant !== 'default';
  const colors = variants[variant];

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-transform hover:scale-[1.02]',
        colors.bg,
        isColored && 'border-0 shadow-lg'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              isColored ? 'text-white/80' : 'text-slate-500'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'text-3xl font-bold mt-1',
              isColored ? 'text-white' : 'text-deep-play-blue'
            )}
          >
            {value}
          </p>
          {subtitle && (
            <p
              className={cn(
                'text-sm mt-1',
                isColored ? 'text-white/70' : 'text-slate-400'
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive
                    ? isColored
                      ? 'text-emerald-200'
                      : 'text-emerald-600'
                    : isColored
                    ? 'text-red-200'
                    : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span
                className={cn(
                  'text-sm',
                  isColored ? 'text-white/60' : 'text-slate-400'
                )}
              >
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl',
            colors.iconBg,
            colors.iconColor
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
