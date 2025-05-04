import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Calendar, Check, Plus, Trash, UsersRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProjectCalendar } from '@/hooks/useProjectCalendar';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarAccessLevel } from '@/types/calendar';

interface ProjectCalendarSetupProps {
  projectId: string;
  projectName: string;
}

export default function ProjectCalendarSetup({
  projectId,
  projectName,
}: ProjectCalendarSetupProps) {
  const { isAuthenticated, login } = useGoogleCalendar();
  const {
    loading,
    error,
    calendar,
    accessList,
    createProjectCalendar,
    updateProjectCalendar,
    addCalendarAccess,
    updateCalendarAccess,
    removeCalendarAccess,
  } = useProjectCalendar({ projectId });

  const [employeeId, setEmployeeId] = useState('');
  const [accessLevel, setAccessLevel] = useState<CalendarAccessLevel>('read');
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const handleCreateCalendar = async () => {
    if (!isAuthenticated) {
      // Prompt the user to authenticate with Google first
      login();
      return;
    }

    // Create with default settings first, we'll let users customize it later
    const newCalendar = await createProjectCalendar();
    if (newCalendar) {
      // If needed, perform additional setup
    }
  };

  const handleToggleCalendar = async (enabled: boolean) => {
    if (calendar) {
      await updateProjectCalendar(calendar.id, { is_enabled: enabled });
    }
  };

  const handleAddAccess = async () => {
    if (calendar && employeeId) {
      await addCalendarAccess(calendar.id, employeeId, accessLevel);
      setEmployeeId('');
      setAccessLevel('read');
      setEmployeeDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full max-w-sm" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Project Calendar
        </CardTitle>
        <CardDescription>
          Manage the shared calendar for this project. Grant access to team members to see events
          and tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!calendar ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="rounded-full bg-blue-50 p-3">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-1">No Project Calendar Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a shared calendar to manage tasks and events for this project.
              </p>
              <Button onClick={handleCreateCalendar}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project Calendar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Calendar Status */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="calendar-status" className="font-medium">
                  Calendar Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this project calendar
                </p>
              </div>
              <Switch
                id="calendar-status"
                checked={calendar.is_enabled}
                onCheckedChange={handleToggleCalendar}
              />
            </div>

            <Separator />

            {/* Calendar Access */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Team Access</h3>
                <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UsersRound className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member Access</DialogTitle>
                      <DialogDescription>
                        Select an employee and set their access level for this project calendar.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="employee">Employee</Label>
                        <Select value={employeeId} onValueChange={setEmployeeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* This would be populated from your database */}
                            <SelectItem value="employee-1">John Doe</SelectItem>
                            <SelectItem value="employee-2">Jane Smith</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="access-level">Access Level</Label>
                        <Select
                          value={accessLevel}
                          onValueChange={value => setAccessLevel(value as CalendarAccessLevel)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="read">Read Only</SelectItem>
                            <SelectItem value="write">Can Edit</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddAccess}>
                        <Check className="mr-2 h-4 w-4" />
                        Add Access
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {accessList.length === 0 ? (
                <div className="text-center py-6 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    No team members have been granted access yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessList.map(access => (
                      <TableRow key={access.id}>
                        <TableCell>{access.employee_id}</TableCell>
                        <TableCell>
                          <Select
                            value={access.access_level}
                            onValueChange={value =>
                              updateCalendarAccess(access.id, value as CalendarAccessLevel)
                            }
                          >
                            <SelectTrigger className="h-8 w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read">Read Only</SelectItem>
                              <SelectItem value="write">Can Edit</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeCalendarAccess(access.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
