import { useState } from 'react';
import { AssigneeSelector } from './AssigneeSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarAssigneeType } from '@/types/unifiedCalendar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export function TestAssigneeSelectors() {
  // Track the selected assignee for each entity type
  const [scheduleItemAssignee, setScheduleItemAssignee] = useState<{
    type?: string;
    id?: string;
  } | null>(null);
  const [milestoneAssignee, setMilestoneAssignee] = useState<{ type?: string; id?: string } | null>(
    null
  );
  const [workOrderAssignee, setWorkOrderAssignee] = useState<{ type?: string; id?: string } | null>(
    null
  );
  const [timeEntryAssignee, setTimeEntryAssignee] = useState<{ type?: string; id?: string } | null>(
    null
  );
  const [contactAssignee, setContactAssignee] = useState<{ type?: string; id?: string } | null>(
    null
  );

  // Track dropdown open states
  const [isScheduleDropdownOpen, setIsScheduleDropdownOpen] = useState(false);
  const [isMilestoneDropdownOpen, setIsMilestoneDropdownOpen] = useState(false);
  const [isWorkOrderDropdownOpen, setIsWorkOrderDropdownOpen] = useState(false);
  const [isTimeEntryDropdownOpen, setIsTimeEntryDropdownOpen] = useState(false);
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);

  // Reset all selections
  const resetAll = () => {
    setScheduleItemAssignee(null);
    setMilestoneAssignee(null);
    setWorkOrderAssignee(null);
    setTimeEntryAssignee(null);
    setContactAssignee(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AssigneeSelector Test</h1>
        <Button variant="destructive" onClick={resetAll}>
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Schedule Item Assignee */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Item</CardTitle>
            <div className="text-sm text-muted-foreground">
              (Should allow Employees and Subcontractors only)
            </div>
          </CardHeader>
          <CardContent>
            <AssigneeSelector
              value={scheduleItemAssignee}
              onChange={setScheduleItemAssignee}
              allowedTypes={['employee', 'subcontractor']}
              onDropdownOpenChange={setIsScheduleDropdownOpen}
            />
            <div className="mt-4 text-sm">
              Selected:{' '}
              {scheduleItemAssignee
                ? `${scheduleItemAssignee.type}: ${scheduleItemAssignee.id}`
                : 'None'}
            </div>
          </CardContent>
        </Card>

        {/* Milestone Assignee */}
        <Card>
          <CardHeader>
            <CardTitle>Project Milestone</CardTitle>
            <div className="text-sm text-muted-foreground">
              (Should allow Employees and Subcontractors only)
            </div>
          </CardHeader>
          <CardContent>
            <AssigneeSelector
              value={milestoneAssignee}
              onChange={setMilestoneAssignee}
              allowedTypes={['employee', 'subcontractor']}
              onDropdownOpenChange={setIsMilestoneDropdownOpen}
            />
            <div className="mt-4 text-sm">
              Selected:{' '}
              {milestoneAssignee ? `${milestoneAssignee.type}: ${milestoneAssignee.id}` : 'None'}
            </div>
          </CardContent>
        </Card>

        {/* Work Order Assignee */}
        <Card>
          <CardHeader>
            <CardTitle>Work Order</CardTitle>
            <div className="text-sm text-muted-foreground">(Should allow Employees only)</div>
          </CardHeader>
          <CardContent>
            <AssigneeSelector
              value={workOrderAssignee}
              onChange={setWorkOrderAssignee}
              allowedTypes={['employee']}
              onDropdownOpenChange={setIsWorkOrderDropdownOpen}
            />
            <div className="mt-4 text-sm">
              Selected:{' '}
              {workOrderAssignee ? `${workOrderAssignee.type}: ${workOrderAssignee.id}` : 'None'}
            </div>
          </CardContent>
        </Card>

        {/* Time Entry Assignee */}
        <Card>
          <CardHeader>
            <CardTitle>Time Entry</CardTitle>
            <div className="text-sm text-muted-foreground">(Should allow Employees only)</div>
          </CardHeader>
          <CardContent>
            <AssigneeSelector
              value={timeEntryAssignee}
              onChange={setTimeEntryAssignee}
              allowedTypes={['employee']}
              onDropdownOpenChange={setIsTimeEntryDropdownOpen}
            />
            <div className="mt-4 text-sm">
              Selected:{' '}
              {timeEntryAssignee ? `${timeEntryAssignee.type}: ${timeEntryAssignee.id}` : 'None'}
            </div>
          </CardContent>
        </Card>

        {/* Contact Interaction */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Interaction</CardTitle>
            <div className="text-sm text-muted-foreground">(Should allow all assignee types)</div>
          </CardHeader>
          <CardContent>
            <AssigneeSelector
              value={contactAssignee}
              onChange={setContactAssignee}
              onDropdownOpenChange={setIsContactDropdownOpen}
            />
            <div className="mt-4 text-sm">
              Selected:{' '}
              {contactAssignee ? `${contactAssignee.type}: ${contactAssignee.id}` : 'None'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm mb-2 font-medium">Debug Information:</div>
      <Card>
        <CardContent className="py-4">
          <div className="text-xs font-mono whitespace-pre-wrap">
            {JSON.stringify(
              {
                scheduleItemAssignee,
                milestoneAssignee,
                workOrderAssignee,
                timeEntryAssignee,
                contactAssignee,
                isScheduleDropdownOpen,
                isMilestoneDropdownOpen,
                isWorkOrderDropdownOpen,
                isTimeEntryDropdownOpen,
                isContactDropdownOpen,
              },
              null,
              2
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
