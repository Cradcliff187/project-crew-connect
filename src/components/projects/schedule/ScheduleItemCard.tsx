import { useState } from 'react';
import {
  Calendar,
  Check,
  AlertCircle,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { ScheduleItem } from '@/types/schedule';

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
  onSync?: (id: string) => Promise<boolean>;
}

export function ScheduleItemCard({ item, onEdit, onDelete, onSync }: ScheduleItemCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (!onSync) return;

    setIsSyncing(true);
    try {
      await onSync(item.id);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-base">{item.title}</h3>
              {item.is_completed && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            {item.description && (
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatDateTime(item.start_datetime)}</span>
              <span>→</span>
              <span>{formatDateTime(item.end_datetime)}</span>
            </div>

            {/* Calendar Sync Status */}
            <div className="flex items-center gap-2 mt-3">
              {item.calendar_integration_enabled && (
                <>
                  {item.google_event_id ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Calendar Synced
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Google Calendar Event ID: {item.google_event_id}</p>
                          {item.invite_status && <p>Status: {item.invite_status}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Not Synced
                    </Badge>
                  )}

                  {item.last_sync_error && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Sync Error
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{item.last_sync_error}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              )}

              {/* Assignee Info */}
              {item.assignee_type && item.assignee_id && (
                <Badge variant="outline" className="text-xs">
                  {item.assignee_type === 'employee' ? 'Employee' : 'Subcontractor'}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}

              {onSync && item.calendar_integration_enabled && (
                <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
                  {isSyncing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Sync with Calendar
                </DropdownMenuItem>
              )}

              {(onEdit || onSync) && onDelete && <DropdownMenuSeparator />}

              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(item.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
