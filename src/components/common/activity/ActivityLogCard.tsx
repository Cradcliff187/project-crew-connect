
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Clock, User, FileText, Settings, Activity } from 'lucide-react';

interface ActivityLogCardProps {
  entityId: string;
  entityType?: string;
  limit?: number;
  title?: string;
  className?: string;
}

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({
  entityId,
  entityType,
  limit = 10,
  title = "Recent Activity",
  className = ''
}) => {
  const { activities, loading, error } = useActivityLog({
    entityId,
    entityType,
    limit
  });
  
  // Get an appropriate icon for the activity type
  const getActivityIcon = (activity: any) => {
    const action = activity.action?.toLowerCase() || '';
    
    if (action.includes('create') || action.includes('add')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (action.includes('update') || action.includes('edit') || action.includes('change')) {
      return <Settings className="h-4 w-4 text-amber-500" />;
    } else if (action.includes('status')) {
      return <Activity className="h-4 w-4 text-green-500" />;
    } else if (action.includes('user') || action.includes('assign')) {
      return <User className="h-4 w-4 text-purple-500" />;
    } else {
      return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Format the timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">Error loading activities</div>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground text-sm">No activity recorded yet.</div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div 
                key={activity.logid || activity.id || index}
                className="flex items-start space-x-3 border-b border-gray-100 pb-3 last:border-0"
              >
                <div className="mt-0.5">{getActivityIcon(activity)}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {activity.action || 'Activity recorded'}
                    {activity.status && (
                      <span className="ml-1 text-muted-foreground">
                        - {activity.status}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                    <span>{formatTimestamp(activity.timestamp || activity.created_at)}</span>
                    {activity.useremail && (
                      <span className="font-medium">{activity.useremail}</span>
                    )}
                  </div>
                  {activity.detailsjson && (
                    <div className="mt-1 text-xs bg-muted/30 p-1.5 rounded">
                      {typeof activity.detailsjson === 'string' 
                        ? activity.detailsjson 
                        : JSON.stringify(activity.detailsjson)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityLogCard;
