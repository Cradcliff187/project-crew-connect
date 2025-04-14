import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type WorkOrderStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ALL';

interface StatusFilterProps {
  onStatusChange: (status: WorkOrderStatus) => void;
  defaultValue?: WorkOrderStatus;
}

const StatusFilter = ({ onStatusChange, defaultValue = 'ALL' }: StatusFilterProps) => {
  return (
    <Select
      onValueChange={value => onStatusChange(value as WorkOrderStatus)}
      defaultValue={defaultValue}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Statuses</SelectItem>
        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
        <SelectItem value="ON_HOLD">On Hold</SelectItem>
        <SelectItem value="COMPLETED">Completed</SelectItem>
        <SelectItem value="CANCELLED">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
