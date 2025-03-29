
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, AlertCircle, Pause, X, Play, Clock, ArrowUpRight } from 'lucide-react';
import { StatusOption } from './UniversalStatusControl';
import { useStatusOptions } from '@/hooks/useStatusOptions';

export interface StatusHistoryEntry {
  id: string;
  status: string;
  previous_status?: string;
  changed_date: string;
  changed_by?: string;
  notes?: string;
}

interface StatusHistoryViewProps {
  entityId: string;
  entityType: 'PROJECT' | 'WORK_ORDER' | 'CHANGE_ORDER' | 'CONTACT' | 'VENDOR';
  historyTable?: string;
  entityIdField?: string;
  className?: string;
}

const StatusHistoryView: React.FC<StatusHistoryViewProps> = ({
  entityId,
  entityType,
  historyTable,
  entityIdField,
  className = ''
}) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { allStatusOptions } = useStatusOptions(entityType);
  
  // Map entity types to their respective tables and id fields
  const getHistoryTableInfo = () => {
    switch (entityType) {
      case 'CHANGE_ORDER':
        return {
          table: historyTable || 'change_order_status_history',
          idField: entityIdField || 'change_order_id'
        };
      case 'PROJECT':
        return {
          table: historyTable || 'project_status_history',
          idField: entityIdField || 'projectid'
        };
      case 'WORK_ORDER':
        return {
          table: historyTable || 'work_order_status_history',
          idField: entityIdField || 'work_order_id'
        };
      case 'CONTACT':
        return {
          table: historyTable || 'contact_status_history',
          idField: entityIdField || 'contact_id'
        };
      case 'VENDOR':
        return {
          table: historyTable || 'vendor_status_history',
          idField: entityIdField || 'vendorid'
        };
      default:
        return {
          table: 'activitylog',
          idField: 'referenceid'
        };
    }
  };
  
  useEffect(() => {
    const fetchStatusHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { table, idField } = getHistoryTableInfo();
        
        // Check if the table exists first
        const { data: tableExists, error: checkError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', table)
          .eq('table_schema', 'public')
          .maybeSingle();
          
        if (checkError) {
          console.error('Error checking table existence:', checkError);
          // Default to activity log if specified table doesn't exist
          const { data: activityData, error: activityError } = await supabase
            .from('activitylog')
            .select('*')
            .eq('referenceid', entityId)
            .eq('moduletype', entityType)
            .order('timestamp', { ascending: false });
            
          if (activityError) throw activityError;
          
          if (activityData && activityData.length > 0) {
            const activityHistory = activityData.map(activity => ({
              id: activity.logid || activity.id,
              status: activity.status || 'unknown',
              previous_status: activity.previousstatus,
              changed_date: activity.timestamp || activity.created_at,
              changed_by: activity.useremail,
              notes: activity.action
            }));
            setHistory(activityHistory);
          } else {
            setHistory([]);
          }
          return;
        }
        
        if (!tableExists) {
          // Fall back to activity log
          const { data: activityData, error: activityError } = await supabase
            .from('activitylog')
            .select('*')
            .eq('referenceid', entityId)
            .eq('moduletype', entityType)
            .order('timestamp', { ascending: false });
            
          if (activityError) throw activityError;
          
          if (activityData && activityData.length > 0) {
            const activityHistory = activityData.map(activity => ({
              id: activity.logid || activity.id,
              status: activity.status || 'unknown',
              previous_status: activity.previousstatus,
              changed_date: activity.timestamp || activity.created_at,
              changed_by: activity.useremail,
              notes: activity.action
            }));
            setHistory(activityHistory);
          } else {
            setHistory([]);
          }
          return;
        }
        
        // Fetch from the specific status history table
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq(idField, entityId)
          .order('changed_date', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setHistory(data as StatusHistoryEntry[]);
        } else {
          setHistory([]);
        }
      } catch (error: any) {
        console.error('Error fetching status history:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (entityId) {
      fetchStatusHistory();
    }
  }, [entityId, entityType, historyTable, entityIdField]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP p');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('progress')) {
      return <Play className="h-4 w-4 text-emerald-500" />;
    } else if (statusLower.includes('hold') || statusLower.includes('pending')) {
      return <Pause className="h-4 w-4 text-amber-500" />;
    } else if (statusLower.includes('complete')) {
      return <Check className="h-4 w-4 text-green-500" />;
    } else if (statusLower.includes('cancel') || statusLower.includes('reject')) {
      return <X className="h-4 w-4 text-red-500" />;
    } else if (statusLower.includes('new')) {
      return <ArrowUpRight className="h-4 w-4 text-purple-500" />;
    } else if (statusLower.includes('wait') || statusLower.includes('review')) {
      return <Clock className="h-4 w-4 text-blue-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusLabel = (statusCode: string): string => {
    // Find matching status option from our options
    const option = allStatusOptions.find(opt => 
      opt.value.toLowerCase() === statusCode.toLowerCase()
    );
    
    if (option) return option.label;
    
    // If no option found, format the status code nicely
    return statusCode
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('active') || statusLower.includes('progress')) {
      return 'text-emerald-800 bg-emerald-50 border-emerald-100';
    } else if (statusLower.includes('hold') || statusLower.includes('pending')) {
      return 'text-amber-800 bg-amber-50 border-amber-100';
    } else if (statusLower.includes('complete')) {
      return 'text-green-800 bg-green-50 border-green-100';
    } else if (statusLower.includes('cancel') || statusLower.includes('reject')) {
      return 'text-red-800 bg-red-50 border-red-100';
    } else if (statusLower.includes('new')) {
      return 'text-purple-800 bg-purple-50 border-purple-100';
    } else if (statusLower.includes('wait') || statusLower.includes('review')) {
      return 'text-blue-800 bg-blue-50 border-blue-100';
    } else {
      return 'text-gray-800 bg-gray-50 border-gray-100';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Status History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : history.length === 0 ? (
          <div className="text-muted-foreground text-sm">No status history available.</div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div 
                key={entry.id || index}
                className="border-l-2 border-gray-200 pl-4 py-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                        <span className="ml-1">{getStatusLabel(entry.status)}</span>
                      </span>
                      
                      {entry.previous_status && (
                        <span className="text-xs text-muted-foreground ml-2">
                          from {getStatusLabel(entry.previous_status)}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(entry.changed_date)}
                    </div>
                  </div>
                  
                  {entry.changed_by && (
                    <div className="text-sm font-medium">{entry.changed_by}</div>
                  )}
                </div>
                
                {entry.notes && (
                  <div className="mt-2 text-sm bg-muted/50 p-2 rounded-md">
                    {entry.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusHistoryView;
