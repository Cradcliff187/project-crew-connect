import { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { TimelogAddButton } from '.';
import { TimelogAddSheet } from '.';

interface TimelogAddHeaderProps {
  workOrderId: string;
  employees: { employee_id: string; name: string }[];
  onTimeLogAdded: () => void;
}

const TimelogAddHeader = ({ workOrderId, employees, onTimeLogAdded }: TimelogAddHeaderProps) => {
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg">Time Tracking</CardTitle>
      <TimelogAddButton onClick={() => setShowAddSheet(true)} />

      <TimelogAddSheet
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        workOrderId={workOrderId}
        employees={employees}
        onSuccess={() => {
          setShowAddSheet(false);
          onTimeLogAdded();
        }}
      />
    </CardHeader>
  );
};

export default TimelogAddHeader;
