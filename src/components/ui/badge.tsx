import { HTMLAttributes, forwardRef } from 'react';
import { cn, getStatusColor, formatStatus } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status';
  status?: string;
  size?: 'sm' | 'md';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', status, size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full border';

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    const defaultStyles = 'bg-slate-100 text-slate-700 border-slate-200';

    const statusStyles = status ? getStatusColor(status) : defaultStyles;

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          variant === 'status' ? statusStyles : defaultStyles,
          className
        )}
        {...props}
      >
        {variant === 'status' && status ? formatStatus(status) : children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
