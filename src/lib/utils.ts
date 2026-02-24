import { type ClassValue, clsx } from 'clsx';

// Combine class names conditionally
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date for display
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

// Format time for display
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Format date and time together
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Get relative time (e.g., "2 hours ago")
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateString);
}

// Get status badge color classes
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Session status
    open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    canceled: 'bg-red-100 text-red-700 border-red-200',
    // Payout status
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    held: 'bg-red-100 text-red-700 border-red-200',
    // Check-in status
    valid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    invalid: 'bg-red-100 text-red-700 border-red-200',
    duplicate: 'bg-amber-100 text-amber-700 border-amber-200',
    attended: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    // Stripe status
    connected: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending_verification: 'bg-amber-100 text-amber-700 border-amber-200',
    action_needed: 'bg-red-100 text-red-700 border-red-200',
    not_started: 'bg-slate-100 text-slate-600 border-slate-200',
    // Staff status
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    removed: 'bg-red-100 text-red-700 border-red-200',
  };
  return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
}

// Format status for display
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Group sessions by date
export function groupSessionsByDate<T extends { startAt: string }>(
  sessions: T[]
): Record<string, T[]> {
  return sessions.reduce((groups, session) => {
    const date = session.startAt.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, T[]>);
}

// Get date range for current week
export function getCurrentWeekRange(): { from: string; to: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return {
    from: startOfWeek.toISOString().split('T')[0],
    to: endOfWeek.toISOString().split('T')[0],
  };
}

// Get date range for current month
export function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    from: startOfMonth.toISOString().split('T')[0],
    to: endOfMonth.toISOString().split('T')[0],
  };
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Generate a simple ID (for mock data)
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
