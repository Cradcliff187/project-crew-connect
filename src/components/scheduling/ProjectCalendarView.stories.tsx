import type { Meta, StoryObj } from '@storybook/react';
import ProjectCalendarView from './ProjectCalendarView';
import { ScheduleItem } from '@/types/schedule';
import { addDays } from 'date-fns';

// Create sample schedule items
const baseDate = new Date();
const today = new Date(baseDate);
const tomorrow = addDays(new Date(baseDate), 1);
const dayAfterTomorrow = addDays(new Date(baseDate), 2);
const nextWeek = addDays(new Date(baseDate), 7);

// First day of current month
const firstDayOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

const sampleScheduleItems: ScheduleItem[] = [
  {
    id: '1',
    project_id: 'proj-1',
    title: 'Client Meeting',
    description: 'Review project progress with client',
    start_datetime: new Date(today).toISOString(),
    end_datetime: new Date(today.getTime() + 90 * 60000).toISOString(), // 90 minutes later
    assignee_type: 'employee',
    assignee_id: 'emp-1',
    is_completed: false,
    object_type: 'meeting',
    recurrence: {
      frequency: 'weekly',
      weekDays: ['MO'],
      count: 8,
    },
  },
  {
    id: '2',
    project_id: 'proj-1',
    title: 'Site Inspection',
    description: 'Check on construction progress',
    start_datetime: new Date(tomorrow).toISOString(),
    end_datetime: new Date(tomorrow.getTime() + 120 * 60000).toISOString(), // 2 hours later
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
    start_datetime: new Date(tomorrow.getTime() + 5 * 60 * 60000).toISOString(), // 5 hours after tomorrow start
    end_datetime: new Date(tomorrow.getTime() + 7 * 60 * 60000).toISOString(), // 7 hours after tomorrow start
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
    start_datetime: new Date(dayAfterTomorrow).toISOString(),
    end_datetime: new Date(dayAfterTomorrow.getTime() + 24 * 60 * 60000 - 1000).toISOString(), // Almost 24 hours later
    is_all_day: true,
    is_completed: true,
    object_type: 'milestone',
  },
  {
    id: '5',
    project_id: 'proj-1',
    title: 'Team Standup',
    description: 'Daily team meeting',
    start_datetime: new Date(today.getTime()).toISOString(),
    end_datetime: new Date(today.getTime() + 15 * 60000).toISOString(), // 15 minutes later
    assignee_type: 'employee',
    assignee_id: 'emp-1',
    is_completed: false,
    object_type: 'meeting',
    recurrence: {
      frequency: 'daily',
      interval: 1,
      count: 20,
    },
  },
  {
    id: '6',
    project_id: 'proj-1',
    title: 'Monthly Status Report',
    description: 'Monthly report preparation',
    start_datetime: firstDayOfMonth.toISOString(),
    end_datetime: new Date(firstDayOfMonth.getTime() + 2 * 60 * 60000).toISOString(), // 2 hours later
    assignee_type: 'employee',
    assignee_id: 'emp-1',
    is_completed: false,
    object_type: 'task',
    recurrence: {
      frequency: 'monthly',
      monthDay: 1,
      count: 6,
    },
  },
];

// Meta information for the component
const meta = {
  title: 'Scheduling/ProjectCalendarView',
  component: ProjectCalendarView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProjectCalendarView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic calendar story
export const Default: Story = {
  args: {
    scheduleItems: sampleScheduleItems,
    onItemClick: item => console.log('Item clicked:', item),
    onDateClick: date => console.log('Date clicked:', date),
    onAddClick: () => console.log('Add button clicked'),
  },
};

// Empty calendar
export const Empty: Story = {
  args: {
    scheduleItems: [],
    onItemClick: item => console.log('Item clicked:', item),
    onDateClick: date => console.log('Date clicked:', date),
    onAddClick: () => console.log('Add button clicked'),
  },
};

// Calendar with completed items
export const WithCompletedItems: Story = {
  args: {
    scheduleItems: [
      ...sampleScheduleItems,
      {
        id: '7',
        project_id: 'proj-1',
        title: 'Completed Task',
        description: 'This task has been completed',
        start_datetime: new Date(tomorrow.getTime() + 4 * 60 * 60000).toISOString(), // 4 hours after tomorrow start
        end_datetime: new Date(tomorrow.getTime() + 6 * 60 * 60000).toISOString(), // 6 hours after tomorrow start
        assignee_type: 'employee',
        assignee_id: 'emp-3',
        is_completed: true,
        object_type: 'task',
      },
      {
        id: '8',
        project_id: 'proj-1',
        title: 'Another Completed Task',
        description: 'This task has also been completed',
        start_datetime: new Date(dayAfterTomorrow.getTime() + 3 * 60 * 60000).toISOString(), // 3 hours after day after tomorrow
        end_datetime: new Date(dayAfterTomorrow.getTime() + 5 * 60 * 60000).toISOString(), // 5 hours after day after tomorrow
        assignee_type: 'employee',
        assignee_id: 'emp-2',
        is_completed: true,
        object_type: 'task',
      },
    ],
    onItemClick: item => console.log('Item clicked:', item),
    onDateClick: date => console.log('Date clicked:', date),
    onAddClick: () => console.log('Add button clicked'),
  },
};
