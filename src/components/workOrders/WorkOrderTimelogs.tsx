
import { useState } from 'react';
import { useWorkOrderTimelogs } from './hooks/useWorkOrderTimelogs';
import { TimelogsInfoSection } from './timelogs/components';

interface WorkOrderTimelogsProps {
  workOrderId: string;
  onTimeLogAdded?: () => void;
}

const WorkOrderTimelogs = ({ workOrderId, onTimeLogAdded }: WorkOrderTimelogsProps) => {
  const {
    timelogs,
    loading,
    employees,
    fetchTimelogs,
    handleDeleteTimelog
  } = useWorkOrderTimelogs(workOrderId);
  
  // Map employee data structure to match what TimelogsInfoSection expects
  const mappedEmployees = employees.map(emp => ({
    id: emp.employee_id,
    name: emp.name
  }));
  
  const handleSuccessfulAdd = () => {
    fetchTimelogs();
    if (onTimeLogAdded) onTimeLogAdded();
  };
  
  return (
    <TimelogsInfoSection
      timelogs={timelogs}
      loading={loading}
      employees={mappedEmployees}
      workOrderId={workOrderId}
      onDelete={handleDeleteTimelog}
      onTimeLogAdded={handleSuccessfulAdd}
    />
  );
};

export default WorkOrderTimelogs;
