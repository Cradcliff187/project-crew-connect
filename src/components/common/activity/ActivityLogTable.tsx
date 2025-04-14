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
import StatusBadge from '@/components/ui/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ActivityLogEntry {
  id: string;
  action: string;
  moduletype?: string;
  timestamp: string;
  status?: string;
  previousstatus?: string;
  useremail?: string;
  referenceid?: string;
  detailsjson?: string;
}

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
            {activities.map(activity => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {format(new Date(activity.timestamp), 'MM/dd/yyyy h:mm a')}
                </TableCell>
                <TableCell>{activity.action}</TableCell>
                <TableCell>
                  {activity.status && (
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={activity.status as any} />
                      {activity.previousstatus && (
                        <span className="text-xs text-muted-foreground">
                          from <StatusBadge status={activity.previousstatus as any} size="sm" />
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
