'use client';

import { useEffect, useState, useCallback } from 'react';
import { Session, CreateSessionRequest, UpdateSessionRequest } from '@/types';
import { getSessions, createSession, updateSession, closeSessionBookings } from '@/lib/api';
import { groupSessionsByDate } from '@/lib/utils';
import { PageHeader } from '@/components/layout';
import { SessionCard, SessionForm } from '@/components/partner';
import { Button, Card } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { Plus, ChevronLeft, ChevronRight, Calendar, LayoutGrid, List, CalendarDays } from 'lucide-react';
import { 
  addDays, 
  subDays, 
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  format, 
  startOfWeek, 
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameMonth,
  isToday as isDateToday,
  getDay,
} from 'date-fns';

type CalendarView = 'day' | 'week' | 'month';

export default function CalendarPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [view, setView] = useState<CalendarView>('week');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize currentDate on client side only to avoid hydration mismatch
  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Calculate date range based on view
  const getDateRange = useCallback((date: Date, viewType: CalendarView) => {
    switch (viewType) {
      case 'day':
        return { start: startOfDay(date), end: endOfDay(date) };
      case 'week':
        return { start: startOfWeek(date), end: endOfWeek(date) };
      case 'month':
        return { start: startOfMonth(date), end: endOfMonth(date) };
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    if (!currentDate) return;
    
    const { start, end } = getDateRange(currentDate, view);
    setIsLoading(true);
    setError(null);

    const result = await getSessions({
      from: format(start, 'yyyy-MM-dd'),
      to: format(end, 'yyyy-MM-dd'),
    });

    if (result.error) {
      setError(result.error);
    } else {
      setSessions(result.data || []);
    }

    setIsLoading(false);
  }, [currentDate, view, getDateRange]);

  useEffect(() => {
    if (currentDate) {
      fetchSessions();
    }
  }, [currentDate, view, fetchSessions]);

  const handlePrev = () => {
    if (!currentDate) return;
    switch (view) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    if (!currentDate) return;
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateSession = async (data: CreateSessionRequest | UpdateSessionRequest) => {
    setIsSubmitting(true);
    
    const result = await createSession(data as CreateSessionRequest);
    
    if (result.error) {
      setError(result.error);
    } else {
      setIsFormOpen(false);
      fetchSessions();
    }
    
    setIsSubmitting(false);
  };

  const handleUpdateSession = async (data: CreateSessionRequest | UpdateSessionRequest) => {
    if (!editingSession) return;
    setIsSubmitting(true);
    
    const result = await updateSession(editingSession.id, data as UpdateSessionRequest);
    
    if (result.error) {
      setError(result.error);
    } else {
      setEditingSession(null);
      fetchSessions();
    }
    
    setIsSubmitting(false);
  };

  const handleCloseBookings = async (session: Session) => {
    if (!confirm(`Are you sure you want to close bookings for "${session.classTitle}"?`)) {
      return;
    }

    const result = await closeSessionBookings(session.id);
    
    if (result.error) {
      setError(result.error);
    } else {
      fetchSessions();
    }
  };

  // Show loading until currentDate is initialized
  if (!currentDate) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Calendar"
          description="Manage your class sessions and schedules."
        />
        <LoadingState message="Loading calendar..." />
      </div>
    );
  }

  const { start: rangeStart, end: rangeEnd } = getDateRange(currentDate, view);
  const groupedSessions = groupSessionsByDate(sessions);

  // Get title based on view
  const getTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        return `${format(rangeStart, 'MMM d')} - ${format(rangeEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
    }
  };

  // Generate days for current view
  const getDaysToDisplay = () => {
    switch (view) {
      case 'day':
        return [format(currentDate, 'yyyy-MM-dd')];
      case 'week':
        return Array.from({ length: 7 }, (_, i) => 
          format(addDays(rangeStart, i), 'yyyy-MM-dd')
        );
      case 'month':
        return eachDayOfInterval({ start: rangeStart, end: rangeEnd })
          .map(date => format(date, 'yyyy-MM-dd'));
    }
  };

  const daysToDisplay = getDaysToDisplay();

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Calendar"
        description="Manage your class sessions and schedules."
        actions={
          <Button
            onClick={() => setIsFormOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Session
          </Button>
        }
      />

      {/* Calendar Controls */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-deep-play-blue ml-2">
              {getTitle()}
            </h2>
          </div>

          {/* View Selector & Today Button */}
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setView('day')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${view === 'day' 
                    ? 'bg-white text-deep-play-blue shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Day</span>
              </button>
              <button
                onClick={() => setView('week')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${view === 'week' 
                    ? 'bg-white text-deep-play-blue shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                <CalendarDays className="w-4 h-4" />
                <span className="hidden sm:inline">Week</span>
              </button>
              <button
                onClick={() => setView('month')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${view === 'month' 
                    ? 'bg-white text-deep-play-blue shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Month</span>
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading sessions..." />}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState message={error} onRetry={fetchSessions} />
      )}

      {/* Calendar Content */}
      {!isLoading && !error && (
        <>
          {/* Month View - Grid Layout */}
          {view === 'month' && (
            <Card padding="none" className="overflow-hidden">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-slate-500">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before month start */}
                {Array.from({ length: getDay(rangeStart) }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50" />
                ))}
                
                {/* Month days */}
                {daysToDisplay.map((dateStr) => {
                  const date = new Date(dateStr + 'T00:00:00');
                  const daySessions = groupedSessions[dateStr] || [];
                  const isToday = isDateToday(date);

                  return (
                    <div
                      key={dateStr}
                      className={`
                        min-h-[100px] border-b border-r border-slate-100 p-2
                        ${isToday ? 'bg-explorer-teal/5' : 'hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`
                            w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                            ${isToday 
                              ? 'bg-explorer-teal text-white' 
                              : 'text-deep-play-blue'}
                          `}
                        >
                          {format(date, 'd')}
                        </span>
                        {daySessions.length > 0 && (
                          <span className="text-xs text-slate-400">
                            {daySessions.length}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        {daySessions.slice(0, 3).map((session) => (
                          <button
                            key={session.id}
                            onClick={() => setEditingSession(session)}
                            className={`
                              w-full text-left text-xs px-1.5 py-1 rounded truncate
                              ${session.status === 'open' 
                                ? 'bg-explorer-teal/10 text-explorer-teal hover:bg-explorer-teal/20' 
                                : 'bg-slate-100 text-slate-500'}
                            `}
                          >
                            {format(new Date(session.startAt), 'h:mm a')} {session.classTitle}
                          </button>
                        ))}
                        {daySessions.length > 3 && (
                          <p className="text-xs text-slate-400 pl-1">
                            +{daySessions.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Day/Week View - List Layout */}
          {(view === 'day' || view === 'week') && (
            <div className="space-y-6">
              {daysToDisplay.map((dateStr) => {
                const daySessions = groupedSessions[dateStr] || [];
                const date = new Date(dateStr + 'T00:00:00');
                const isToday = isDateToday(date);

                return (
                  <div key={dateStr}>
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`
                          w-12 h-12 rounded-xl flex flex-col items-center justify-center
                          ${isToday ? 'bg-explorer-teal text-white' : 'bg-white shadow-sm'}
                        `}
                      >
                        <span className="text-xs font-medium uppercase">
                          {format(date, 'EEE')}
                        </span>
                        <span className="text-lg font-bold">
                          {format(date, 'd')}
                        </span>
                      </div>
                      <div>
                        <h3 className={`font-medium ${isToday ? 'text-explorer-teal' : 'text-deep-play-blue'}`}>
                          {format(date, 'EEEE, MMMM d')}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {daySessions.length} session{daySessions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Sessions for this day */}
                    {daySessions.length > 0 ? (
                      <div className="space-y-3 ml-15">
                        {daySessions
                          .sort((a, b) => a.startAt.localeCompare(b.startAt))
                          .map((session) => (
                            <SessionCard
                              key={session.id}
                              session={session}
                              onEdit={(s) => setEditingSession(s)}
                              onClose={handleCloseBookings}
                            />
                          ))}
                      </div>
                    ) : (
                      <Card className="ml-15 bg-slate-50 border-dashed border-2 border-slate-200">
                        <p className="text-center text-slate-400 py-4">
                          No sessions scheduled
                        </p>
                      </Card>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State for entire period */}
          {sessions.length === 0 && (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-adventure-orange" />}
              title={`No sessions this ${view}`}
              description="Create your first session to start accepting KidVenture Pass bookings."
              action={{
                label: 'Create Session',
                onClick: () => setIsFormOpen(true),
              }}
            />
          )}
        </>
      )}

      {/* Create Session Modal */}
      <SessionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateSession}
        isLoading={isSubmitting}
      />

      {/* Edit Session Modal */}
      <SessionForm
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        onSubmit={handleUpdateSession}
        session={editingSession}
        isLoading={isSubmitting}
      />
    </div>
  );
}
