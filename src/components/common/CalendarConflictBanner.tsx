import React from 'react';
import { AlertTriangle, Calendar, X, Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export type ConflictType = 'overlap' | 'sync_error' | 'permission_error' | 'resource_conflict';

interface CalendarConflictInfo {
  type: ConflictType;
  message: string;
  details?: string;
  conflictingEventId?: string;
  conflictingEventTitle?: string;
  conflictingEventTime?: string;
}

interface CalendarConflictBannerProps {
  conflicts: CalendarConflictInfo[];
  onDismiss?: (conflictId: ConflictType) => void;
  onResolve?: (conflict: CalendarConflictInfo) => Promise<boolean>;
  onRetry?: (conflict: CalendarConflictInfo) => Promise<boolean>;
}

const CalendarConflictBanner: React.FC<CalendarConflictBannerProps> = ({
  conflicts,
  onDismiss,
  onResolve,
  onRetry,
}) => {
  if (!conflicts || conflicts.length === 0) return null;

  const getConflictIcon = (type: ConflictType) => {
    switch (type) {
      case 'overlap':
        return <Calendar className="h-4 w-4" />;
      case 'sync_error':
        return <RefreshCw className="h-4 w-4" />;
      case 'permission_error':
      case 'resource_conflict':
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getBannerVariant = (type: ConflictType) => {
    switch (type) {
      case 'overlap':
        return 'warning';
      case 'sync_error':
        return 'default';
      case 'permission_error':
      case 'resource_conflict':
      default:
        return 'destructive';
    }
  };

  const getActionButton = (conflict: CalendarConflictInfo) => {
    switch (conflict.type) {
      case 'overlap':
        return onResolve ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve(conflict)}
            className="ml-auto mt-2 sm:mt-0"
          >
            Resolve Conflict
          </Button>
        ) : null;
      case 'sync_error':
        return onRetry ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRetry(conflict)}
            className="ml-auto mt-2 sm:mt-0"
          >
            Retry Sync
          </Button>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {conflicts.map((conflict, index) => (
        <Alert key={index} variant={getBannerVariant(conflict.type) as any}>
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-1">{getConflictIcon(conflict.type)}</div>
            <div className="ml-3 flex-1">
              <AlertTitle>{conflict.message}</AlertTitle>
              <AlertDescription>
                <div className="mt-1">
                  {conflict.details}
                  {conflict.conflictingEventTitle && (
                    <div className="mt-1">
                      <span className="font-medium">Event:</span> {conflict.conflictingEventTitle}
                    </div>
                  )}
                  {conflict.conflictingEventTime && (
                    <div>
                      <span className="font-medium">Time:</span> {conflict.conflictingEventTime}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </div>
            <div className="ml-auto flex items-start gap-2">
              {getActionButton(conflict)}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDismiss(conflict.type)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default CalendarConflictBanner;
