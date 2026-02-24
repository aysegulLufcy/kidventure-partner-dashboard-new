'use client';

import { Session } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { formatTime, formatDate } from '@/lib/utils';
import { Clock, MapPin, Users, Edit2, Lock } from 'lucide-react';

interface SessionCardProps {
  session: Session;
  onEdit?: (session: Session) => void;
  onClose?: (session: Session) => void;
  showDate?: boolean;
}

export function SessionCard({
  session,
  onEdit,
  onClose,
  showDate = false,
}: SessionCardProps) {
  const spotsBooked = session.capacityKvp - session.kvpSpotsLeft;
  const isFull = session.kvpSpotsLeft === 0;

  return (
    <Card className="hover:shadow-card-hover transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Time block */}
        <div className="flex-shrink-0 text-center sm:text-left sm:w-24">
          {showDate && (
            <p className="text-xs text-slate-500 mb-1">
              {formatDate(session.startAt)}
            </p>
          )}
          <p className="text-lg font-semibold text-deep-play-blue">
            {formatTime(session.startAt)}
          </p>
          <p className="text-sm text-slate-400">
            {formatTime(session.endAt)}
          </p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-16 bg-slate-200" />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-deep-play-blue truncate">
                {session.classTitle}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {session.locationName}
                </span>
              </div>
            </div>
            <Badge variant="status" status={session.status} />
          </div>

          {/* Capacity info */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-explorer-teal" />
              <span className="text-sm">
                <span className="font-medium text-deep-play-blue">
                  {spotsBooked}/{session.capacityKvp}
                </span>
                <span className="text-slate-400"> KVP spots</span>
              </span>
              {isFull && (
                <Badge size="sm" className="bg-adventure-orange/10 text-adventure-orange border-adventure-orange/20">
                  Full
                </Badge>
              )}
            </div>
            <div className="text-sm text-slate-400">
              {session.capacityTotal} total capacity
            </div>
          </div>

          {/* ID for audit */}
          <p className="text-xs text-slate-300 mt-2 font-mono">
            ID: {session.id}
          </p>
        </div>

        {/* Actions */}
        {(onEdit || onClose) && session.status === 'open' && (
          <div className="flex sm:flex-col gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(session)}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClose(session)}
                leftIcon={<Lock className="w-3.5 h-3.5" />}
              >
                Close
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
