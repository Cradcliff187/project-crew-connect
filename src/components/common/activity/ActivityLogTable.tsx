import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/common/status/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusType } from '@/types/common';
import { Database } from '@/integrations/supabase/types'; // Import Database types

// Use generated type for ActivityLogEntry
export type ActivityLogEntry = Database['public']['Tables']['activitylog']['Row'];

// Remove manual ActivityLogEntry interface
// export interface ActivityLogEntry {
//   id: string; // logid is string | null in generated type
//   action: string | null;
//   moduletype?: string | null;
//   timestamp: string | null;
//   status?: string | null;
//   previousstatus?: string | null;
//   useremail?: string | null;
//   referenceid?: string | null;
//   detailsjson?: string | null;
// }

interface ActivityLogTableProps {
  activities: ActivityLogEntry[];
  loading?: boolean;
  title?: string;
  className?: string;
}

const ActivityLogTable: React.FC<ActivityLogTableProps> = ({
  activities,
  loading = false,
  title = 'Activity Log',
  className = '',
}) => {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading activity data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">No activities recorded yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date/Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Ensure activities is an array before mapping */}
            {Array.isArray(activities) &&
              activities.map(activity => (
                // Use logid if available and unique, otherwise index or another stable key
                <TableRow key={activity.logid || activity.created_at}>
                  <TableCell className="font-medium">
                    {/* Handle potentially null timestamp */}
                    {activity.timestamp
                      ? format(new Date(activity.timestamp), 'MM/dd/yyyy h:mm a')
                      : '-'}
                  </TableCell>
                  <TableCell>{activity.action || 'N/A'}</TableCell>
                  <TableCell>
                    {activity.status && (
                      <div className="flex flex-col gap-1">
                        {/* Pass status directly. StatusBadge handles string | StatusType */}
                        <StatusBadge status={activity.status} />
                        {activity.previousstatus && (
                          <span className="text-xs text-muted-foreground">
                            from <StatusBadge status={activity.previousstatus} size="sm" />
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{activity.useremail || 'System'}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ActivityLogTable;
