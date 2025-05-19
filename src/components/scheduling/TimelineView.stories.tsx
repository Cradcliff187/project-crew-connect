import type { Meta, StoryObj } from '@storybook/react';
import { TimelineView } from './TimelineView';
import { ScheduleItem } from '@/types/schedule';
import { addDays } from 'date-fns';

// Create sample schedule items
const today = new Date();
const tomorrow = addDays(today, 1);
const dayAfterTomorrow = addDays(today, 2);
const nextWeek = addDays(today, 7);

const sampleScheduleItems: ScheduleItem[] = [
  {
    id: '1',
    project_id: 'proj-1',
    title: 'Client Meeting',
    description: 'Review project progress with client',
    start_datetime: new Date(today.setHours(10, 0, 0, 0)).toISOString(),
    end_datetime: new Date(today.setHours(11, 30, 0, 0)).toISOString(),
    assignee_type: 'employee',
    assignee_id: 'emp-1',
    is_completed: false,
    object_type: 'meeting',
  },
  {
    id: '2',
    project_id: 'proj-1',
    title: 'Site Inspection',
    description: 'Check on construction progress',
    start_datetime: new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString(),
    end_datetime: new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString(),
    assignee_type: 'employee',
    assignee_id: 'emp-2',
    is_completed: false,
    object_type: 'task',
  },
  {
    id: '3',
    project_id: 'proj-1',
    title: 'Material Delivery',
    description: 'Receive lumber delivery',
    start_datetime: new Date(tomorrow.setHours(14, 0, 0, 0)).toISOString(),
    end_datetime: new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString(),
    assignee_type: 'subcontractor',
    assignee_id: 'sub-1',
    is_completed: false,
    object_type: 'deadline',
  },
  {
    id: '4',
    project_id: 'proj-1',
    title: 'Project Milestone: Foundation Complete',
    description: 'Foundation has been completed and inspected',
    start_datetime: new Date(dayAfterTomorrow.setHours(0, 0, 0, 0)).toISOString(),
    end_datetime: new Date(dayAfterTomorrow.setHours(23, 59, 59, 0)).toISOString(),
    is_all_day: true,
    is_completed: true,
    object_type: 'milestone',
  },
  {
    id: '5',
    project_id: 'proj-1',
    title: 'Subcontractor Meeting',
    description: 'Coordinate next phase with subcontractors',
    start_datetime: new Date(nextWeek.setHours(13, 0, 0, 0)).toISOString(),
    end_datetime: new Date(nextWeek.setHours(14, 30, 0, 0)).toISOString(),
    assignee_type: 'employee',
    assignee_id: 'emp-1',
    is_completed: false,
    object_type: 'meeting',
  },
  {
    id: '6',
    project_id: 'proj-1',
    title: 'Multi-day Framing Work',
    description: 'Framing of the main structure',
    start_datetime: new Date(dayAfterTomorrow.setHours(8, 0, 0, 0)).toISOString(),
    end_datetime: new Date(nextWeek.setHours(17, 0, 0, 0)).toISOString(),
    assignee_type: 'subcontractor',
    assignee_id: 'sub-2',
    is_completed: false,
    object_type: 'task',
  },
];

// Meta information for the component
const meta = {
  title: 'Scheduling/TimelineView',
  component: TimelineView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    groupBy: {
      control: {
        type: 'select',
        options: ['day', 'week', 'status', 'assignee', 'type'],
      },
    },
  },
} satisfies Meta<typeof TimelineView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base story with day grouping
export const ByDay: Story = {
  args: {
    scheduleItems: sampleScheduleItems,
    groupBy: 'day',
    startDate: today,
    endDate: nextWeek,
    onItemClick: item => console.log('Item clicked:', item),
  },
};

// Group by status (completed/pending)
export const ByStatus: Story = {
  args: {
    ...ByDay.args,
    groupBy: 'status',
  },
};

// Group by assignee
export const ByAssignee: Story = {
  args: {
    ...ByDay.args,
    groupBy: 'assignee',
  },
};

// Group by type
export const ByType: Story = {
  args: {
    ...ByDay.args,
    groupBy: 'type',
  },
};

// Empty state
export const Empty: Story = {
  args: {
    scheduleItems: [],
    groupBy: 'day',
  },
};

// With Multi-day items highlighted
export const MultiDayEvents: Story = {
  args: {
    scheduleItems: [
      ...sampleScheduleItems,
      {
        id: '7',
        project_id: 'proj-1',
        title: 'Another Multi-day Task',
        description: 'This spans several days',
        start_datetime: new Date(tomorrow.setHours(9, 0, 0, 0)).toISOString(),
        end_datetime: new Date(addDays(tomorrow, 3).setHours(17, 0, 0, 0)).toISOString(),
        assignee_type: 'employee',
        assignee_id: 'emp-3',
        is_completed: false,
        object_type: 'task',
      },
    ],
    groupBy: 'day',
  },
};
