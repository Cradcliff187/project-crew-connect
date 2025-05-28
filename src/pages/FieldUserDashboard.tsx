import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleBasedTimeEntries } from '@/hooks/useRoleBasedTimeEntries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import QuickLogWizard from '@/components/time-entries/QuickLogWizard';
import {
  Clock,
  MapPin,
  Calendar,
  Plus,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Timer,
  Briefcase,
  Building2,
  Loader2,
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { QuickLogFormData, FieldUserAssignment } from '@/types/role-based-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const FieldUserDashboard: React.FC = () => {
  const { user, role, isFieldUser, isAdmin } = useAuth();
  const { timeEntries, isLoading, createTimeEntry, refetch } = useRoleBasedTimeEntries();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [assignments, setAssignments] = useState<FieldUserAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);

  // Allow access for field users OR admins on testing route
  const isTestingRoute = window.location.pathname.includes('/test/field-dashboard');
  const hasAccess = isFieldUser || (isAdmin && isTestingRoute);

  // Fetch active assignments from database
  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        const assignmentsList: FieldUserAssignment[] = [];

        // Fetch active projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, status, created_at, target_end_date')
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(10);

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
        } else if (projects) {
          projects.forEach(project => {
            assignmentsList.push({
              id: `project_${project.projectid}`,
              title: project.projectname || `Project ${project.projectid}`,
              entity_type: 'project',
              entity_id: project.projectid,
              due_date:
                project.target_end_date ||
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              priority: 'medium',
              status: 'ACTIVE',
              description: `Active project: ${project.projectname}`,
              location: 'Project Site',
            });
          });
        }

        // Fetch active work orders
        const { data: workOrders, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, status, created_at, description')
          .in('status', ['NEW', 'IN_PROGRESS'])
          .order('updated_at', { ascending: false })
          .limit(10);

        if (workOrdersError) {
          console.error('Error fetching work orders:', workOrdersError);
        } else if (workOrders) {
          workOrders.forEach(workOrder => {
            assignmentsList.push({
              id: `workorder_${workOrder.work_order_id}`,
              title: workOrder.title || `Work Order ${workOrder.work_order_id.substring(0, 8)}`,
              entity_type: 'work_order',
              entity_id: workOrder.work_order_id,
              due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Default 3 days from now
              priority: workOrder.status === 'IN_PROGRESS' ? 'high' : 'medium',
              status: workOrder.status,
              description:
                workOrder.description ||
                `${workOrder.status === 'IN_PROGRESS' ? 'In progress' : 'New'} work order`,
              location: 'Work Site',
            });
          });
        }

        setAssignments(assignmentsList);

        if (assignmentsList.length === 0) {
          toast({
            title: 'No Active Work Available',
            description: 'No active projects or work orders found.',
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast({
          title: 'Error Loading Work',
          description: 'Failed to load active projects and work orders.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    fetchAssignments();
  }, []);

  // Redirect if no access
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              This page is only accessible to field users.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SCHEDULED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'NEW':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleQuickLogComplete = async (data: QuickLogFormData) => {
    // The QuickLogWizard now handles time entry creation internally
    // This function is called when the entire flow (including receipts) is complete
    setShowQuickLog(false);

    // Refresh the time entries to show the new entry
    // Note: We might want to add a refetch function to the useRoleBasedTimeEntries hook
    refetch();
  };

  // Calculate weekly summary from actual time entries
  const weeklyStats = {
    totalHours: timeEntries.reduce((sum, entry) => sum + entry.hours_worked, 0),
    projects: new Set(timeEntries.filter(e => e.entity_type === 'project').map(e => e.entity_id))
      .size,
    workOrders: new Set(
      timeEntries.filter(e => e.entity_type === 'work_order').map(e => e.entity_id)
    ).size,
    expenses: timeEntries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0),
  };

  // Transform time entries for display
  const recentEntries = timeEntries.slice(0, 5).map(entry => ({
    id: entry.id,
    date: entry.date_worked,
    hours: entry.hours_worked,
    entity_name: `${entry.entity_type === 'project' ? 'Project' : 'Work Order'} - ${entry.entity_id}`,
    status: entry.processed_at ? 'processed' : 'submitted',
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Good morning! 👋</h1>
            <div className="flex items-center space-x-2">
              {isTestingRoute && isAdmin && (
                <Badge
                  variant="destructive"
                  className="bg-orange-100 text-orange-800 border-orange-200"
                >
                  Admin Testing Mode
                </Badge>
              )}
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Field User Interface
              </Badge>
            </div>
          </div>
          <p className="text-gray-600">
            {isTestingRoute && isAdmin
              ? `Testing field user interface as ${user?.user_metadata?.full_name || 'Admin'}`
              : `Welcome back, ${user?.user_metadata?.full_name || 'Field User'}`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card
            className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => setShowQuickLog(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Quick Log</h3>
              <p className="text-sm text-gray-600">Log time for current work</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Add Receipt</h3>
              <p className="text-sm text-gray-600">Scan expense receipts</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Assignments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
              My Assignments
            </h2>
            {isLoadingAssignments ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {assignments.length} active
              </Badge>
            )}
          </div>

          {isLoadingAssignments ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gray-300 rounded" />
                        <div className="h-5 bg-gray-300 rounded w-48" />
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-16 h-6 bg-gray-300 rounded" />
                        <div className="w-20 h-6 bg-gray-300 rounded" />
                      </div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-full mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-gray-300 rounded w-24" />
                      <div className="h-4 bg-gray-300 rounded w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map(assignment => (
                <Card
                  key={assignment.id}
                  className={cn(
                    'hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4',
                    assignment.priority === 'high' && 'border-l-red-500',
                    assignment.priority === 'medium' && 'border-l-yellow-500',
                    assignment.priority === 'low' && 'border-l-green-500',
                    selectedAssignment === assignment.id && 'ring-2 ring-blue-500 ring-opacity-50'
                  )}
                  onClick={() => setSelectedAssignment(assignment.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {assignment.entity_type === 'project' ? (
                          <Building2 className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Briefcase className="h-5 w-5 text-green-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(assignment.priority)}>
                          {assignment.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(assignment.status)}>
                          {assignment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{assignment.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Due: {formatDate(assignment.due_date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{assignment.location}</span>
                      </div>
                    </div>

                    {selectedAssignment === assignment.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={e => {
                              e.stopPropagation();
                              setShowQuickLog(true);
                            }}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            Log Time
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
                <p className="text-gray-600 mb-4">
                  No active projects or work orders found for time logging
                </p>
                <Button onClick={() => setShowQuickLog(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Time Anyway
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Time Entries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-green-600" />
              My Recent Entries
            </h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                        <div>
                          <div className="h-4 bg-gray-300 rounded w-32 mb-1" />
                          <div className="h-3 bg-gray-300 rounded w-24" />
                        </div>
                      </div>
                      <div className="w-16 h-6 bg-gray-300 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentEntries.length > 0 ? (
            <div className="space-y-3">
              {recentEntries.map(entry => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            'w-3 h-3 rounded-full',
                            entry.status === 'processed' ? 'bg-green-500' : 'bg-yellow-500'
                          )}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{entry.entity_name}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(entry.date)} • {entry.hours}h
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {entry.status === 'processed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <Badge
                          variant={entry.status === 'processed' ? 'default' : 'secondary'}
                          className={cn(
                            entry.status === 'processed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries yet</h3>
                <p className="text-gray-600 mb-4">
                  Start logging your work time to see entries here
                </p>
                <Button onClick={() => setShowQuickLog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Entry
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Weekly Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Timer className="h-5 w-5 mr-2" />
              This Week's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">
                  {weeklyStats.totalHours.toFixed(1)}
                </p>
                <p className="text-sm text-blue-700">Total Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{weeklyStats.projects}</p>
                <p className="text-sm text-blue-700">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">{weeklyStats.workOrders}</p>
                <p className="text-sm text-blue-700">Work Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">
                  ${weeklyStats.expenses.toFixed(0)}
                </p>
                <p className="text-sm text-blue-700">Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Log Wizard */}
        {showQuickLog && (
          <QuickLogWizard
            onComplete={handleQuickLogComplete}
            onCancel={() => setShowQuickLog(false)}
            assignments={assignments}
          />
        )}
      </div>
    </div>
  );
};

export default FieldUserDashboard;
