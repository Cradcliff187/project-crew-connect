
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatCurrency, formatHours } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SubcontractorTimelogsProps {
  subcontractorId: string;
}

interface Timelog {
  timelog_id: string;
  work_order_id: string;
  work_order_title: string;
  date: string;
  hours: number;
  rate: number;
  total: number;
}

const SubcontractorTimelogs = ({ subcontractorId }: SubcontractorTimelogsProps) => {
  const [timelogs, setTimelogs] = useState<Timelog[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch timelogs
  useEffect(() => {
    const fetchTimelogs = async () => {
      setLoading(true);
      try {
        // Fetch timelogs from the database
        const { data, error } = await supabase
          .from('timelogs')
          .select('timelog_id, work_order_id, date, hours, rate')
          .eq('subcontractor_id', subcontractorId);

        if (error) throw error;

        // Fetch work order titles for each timelog
        if (data && data.length > 0) {
          const workOrderIds = [...new Set(data.map(log => log.work_order_id))];
          
          const { data: workOrders, error: woError } = await supabase
            .from('work_orders')
            .select('work_order_id, title')
            .in('work_order_id', workOrderIds);
          
          if (woError) throw woError;
          
          const workOrderMap = (workOrders || []).reduce((acc, wo) => {
            acc[wo.work_order_id] = wo.title;
            return acc;
          }, {} as Record<string, string>);
          
          // Combine data
          const enrichedTimelogs = data.map(log => ({
            ...log,
            work_order_title: workOrderMap[log.work_order_id] || 'Unknown Work Order',
            total: log.hours * (log.rate || 0)
          }));
          
          setTimelogs(enrichedTimelogs);
        } else {
          setTimelogs([]);
        }
      } catch (error: any) {
        console.error('Error fetching timelogs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load time logs. ' + error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimelogs();
  }, [subcontractorId]);

  const totalHours = timelogs.reduce((sum, log) => sum + log.hours, 0);
  const totalAmount = timelogs.reduce((sum, log) => sum + log.total, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Time Logs</CardTitle>
        <Button size="sm" className="bg-[#0485ea] hover:bg-[#0375d1]">
          <Plus className="h-4 w-4 mr-2" />
          Add Time Log
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
          </div>
        ) : timelogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No time logs found for this subcontractor</p>
            <Button size="sm" className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Time Log
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timelogs.map((log) => (
                    <TableRow key={log.timelog_id}>
                      <TableCell>{log.work_order_title}</TableCell>
                      <TableCell>{formatDate(log.date)}</TableCell>
                      <TableCell>{formatHours(log.hours)}</TableCell>
                      <TableCell>{formatCurrency(log.rate)}</TableCell>
                      <TableCell>{formatCurrency(log.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <div className="bg-muted p-4 rounded-md w-64">
                <div className="flex justify-between mb-2">
                  <span>Total Hours:</span>
                  <span className="font-medium">{formatHours(totalHours)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubcontractorTimelogs;
