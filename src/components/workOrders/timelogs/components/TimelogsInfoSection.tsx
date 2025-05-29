import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { TimelogAddSheet } from './TimelogAddSheet';
import { Button } from '@/components/ui/button';
import { formatTime, formatHoursToDuration } from '@/utils/time/timeUtils';
import { Employee } from '@/types/common';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar } from 'lucide-react';

interface TimelogsInfoSectionProps {
  timelogs: any[];
  loading: boolean;
  employees: Employee[];
  workOrderId: string;
  onDelete: (id: string) => void;
  onTimeLogAdded: () => void;
  totalHours: number;
  totalLaborCost: number;
  totalEntries: number;
  lastEntryDate?: string;
}

export const TimelogsInfoSection = ({
  timelogs,
  loading,
  employees,
  workOrderId,
  onDelete,
  onTimeLogAdded,
  totalHours,
  totalLaborCost,
  totalEntries,
  lastEntryDate,
}: TimelogsInfoSectionProps) => {
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-montserrat">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-montserrat">
            {formatHoursToDuration(totalHours)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-montserrat">Time Entries</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-montserrat">{totalEntries}</div>
          <p className="text-xs text-muted-foreground font-opensans">
            {totalEntries === 1 ? 'entry' : 'entries'} logged
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-montserrat">Last Entry</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-montserrat">
            {lastEntryDate ? (
              <Badge variant="outline" className="font-opensans">
                {lastEntryDate}
              </Badge>
            ) : (
              <span className="text-muted-foreground font-opensans">No entries</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
