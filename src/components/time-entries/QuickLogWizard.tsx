import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Loader2,
  Camera,
  Upload,
  Receipt,
  DollarSign,
  User,
  Tag,
} from 'lucide-react';
import { format, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  QuickLogWizardProps,
  QuickLogFormData,
  FieldUserAssignment,
} from '@/types/role-based-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import TimeEntryReceiptUpload from '@/components/time-entries/receipts/TimeEntryReceiptUpload';

interface Assignment {
  id: string;
  name: string;
  entity_type: 'project' | 'work_order';
  entity_id: string;
  location?: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

interface CostCategory {
  category_id: string;
  name: string;
  description?: string;
}

const QuickLogWizard: React.FC<QuickLogWizardProps> = ({
  onComplete,
  onCancel,
  assignments: propAssignments,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<QuickLogFormData>>({
    date_worked: new Date(),
    start_time: '08:00',
    end_time: '17:00',
    has_receipts: false,
    receipt_data: {
      is_billable: true,
    },
  });
  const [selectedAssignment, setSelectedAssignment] = useState<FieldUserAssignment | null>(null);
  const [calculatedHours, setCalculatedHours] = useState(0);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [assignments, setAssignments] = useState<FieldUserAssignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [submittedTimeEntryId, setSubmittedTimeEntryId] = useState<string | null>(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [createdTimeEntryId, setCreatedTimeEntryId] = useState<string | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);

  const totalSteps = 4;

  // Fetch active projects and work orders
  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoadingAssignments(true);
      try {
        const assignmentsList: FieldUserAssignment[] = [];

        // Fetch active projects
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, status')
          .eq('status', 'active')
          .order('updated_at', { ascending: false })
          .limit(20);

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
        } else if (projects) {
          projects.forEach((project, index) => {
            assignmentsList.push({
              id: `project_${project.projectid}`,
              title: project.projectname || `Project ${project.projectid}`,
              entity_type: 'project',
              entity_id: project.projectid,
              due_date: new Date().toISOString(),
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
          .select('work_order_id, title, status')
          .in('status', ['NEW', 'IN_PROGRESS'])
          .order('updated_at', { ascending: false })
          .limit(20);

        if (workOrdersError) {
          console.error('Error fetching work orders:', workOrdersError);
        } else if (workOrders) {
          workOrders.forEach((workOrder, index) => {
            assignmentsList.push({
              id: `workorder_${workOrder.work_order_id}`,
              title: workOrder.title || `Work Order ${workOrder.work_order_id.substring(0, 8)}`,
              entity_type: 'work_order',
              entity_id: workOrder.work_order_id,
              due_date: new Date().toISOString(),
              priority: workOrder.status === 'IN_PROGRESS' ? 'high' : 'medium',
              status: workOrder.status,
              description: `${workOrder.status === 'IN_PROGRESS' ? 'In progress' : 'New'} work order`,
              location: 'Work Site',
            });
          });
        }

        setAssignments(assignmentsList);

        if (assignmentsList.length === 0) {
          toast({
            title: 'No Active Work Available',
            description: 'No active projects or work orders found for time logging.',
            variant: 'destructive',
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

    const fetchCategories = async () => {
      try {
        // Set default categories that we know exist from our database test
        setExpenseCategories([
          {
            id: '273cc2b8-019a-487a-b85c-b3aa3deb6c5d',
            name: 'Materials',
            description: 'Construction materials, supplies, and equipment',
          },
          {
            id: '108c00d1-8338-4223-8cc0-2c1d58dadb5d',
            name: 'Tools & Equipment',
            description: 'Tool purchases, rentals, and equipment costs',
          },
          {
            id: '1e8ea606-daee-48c6-8255-da38fb465d0e',
            name: 'Transportation',
            description: 'Vehicle fuel, mileage, and transportation costs',
          },
          {
            id: '8c49e693-0c3f-42e3-a8f1-a28a55cebab0',
            name: 'Safety Equipment',
            description: 'PPE, safety gear, and safety-related expenses',
          },
          {
            id: 'de67d4c8-2f15-421e-8de5-611035ae5903',
            name: 'Other',
            description: 'Miscellaneous project-related expenses',
          },
        ]);

        setCostCategories([
          {
            category_id: '59bbeefb-63f3-4588-9c03-0eb6049c07d9',
            name: 'Materials',
            description: 'Cost of raw materials and supplies',
          },
          {
            category_id: '9ee87389-7ed6-4f16-8b0f-89c2872e9969',
            name: 'Labor',
            description: 'Direct labor costs',
          },
          {
            category_id: '79261722-b2ca-4d12-a553-da0862b0520d',
            name: 'Equipment',
            description: 'Costs related to equipment rental or usage',
          },
          {
            category_id: '7d6852b4-b97e-481d-ba73-feb37ad34f5c',
            name: 'Subcontractor',
            description: 'Costs associated with subcontractors',
          },
          {
            category_id: '2d067a66-b2d4-414e-b548-bd9e06c85492',
            name: 'Other',
            description: 'Miscellaneous costs not fitting other categories',
          },
        ]);
      } catch (error) {
        console.error('Error setting categories:', error);
      }
    };

    // Use prop assignments if provided, otherwise fetch from database
    if (propAssignments && propAssignments.length > 0) {
      setAssignments(propAssignments);
      setIsLoadingAssignments(false);
    } else {
      fetchAssignments();
    }

    // Always fetch categories
    fetchCategories();
  }, [propAssignments]);

  // Calculate hours when times change
  useEffect(() => {
    if (formData.start_time && formData.end_time && formData.date_worked) {
      const startTime = new Date(
        `${formData.date_worked.toISOString().split('T')[0]}T${formData.start_time}`
      );
      const endTime = new Date(
        `${formData.date_worked.toISOString().split('T')[0]}T${formData.end_time}`
      );

      if (endTime > startTime) {
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        setCalculatedHours(hours);
        setOvertimeHours(Math.max(hours - 8, 0));
      }
    }
  }, [formData.start_time, formData.end_time, formData.date_worked]);

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
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

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedAssignment !== null;
      case 2:
        return formData.date_worked !== undefined;
      case 3:
        return formData.start_time && formData.end_time && calculatedHours > 0;
      case 4:
        return (
          !formData.has_receipts ||
          (formData.receipt_data?.expense_category_id && formData.receipt_data?.cost_category_id)
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canProceedToNext()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (selectedAssignment && formData.date_worked && formData.start_time && formData.end_time) {
      const completeData: QuickLogFormData = {
        entity_type: selectedAssignment.entity_type,
        entity_id: selectedAssignment.entity_id,
        date_worked: formData.date_worked,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
        has_receipts: formData.has_receipts,
        receipt_data: formData.receipt_data,
      };

      try {
        // Create the time entry and get the ID
        const timeEntryId = await createTimeEntryAndGetId(completeData);

        if (formData.has_receipts && timeEntryId) {
          // Show receipt upload modal instead of completing immediately
          setSubmittedTimeEntryId(timeEntryId);
          setShowReceiptUpload(true);
        } else {
          // Complete normally if no receipts
          onComplete(completeData);
        }
      } catch (error) {
        console.error('Error creating time entry:', error);
        toast({
          title: 'Error',
          description: 'Failed to create time entry. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Helper function to create time entry and return the ID
  const createTimeEntryAndGetId = async (data: QuickLogFormData): Promise<string | null> => {
    // Calculate hours worked
    const startTime = new Date(
      `${data.date_worked.toISOString().split('T')[0]}T${data.start_time}`
    );
    const endTime = new Date(`${data.date_worked.toISOString().split('T')[0]}T${data.end_time}`);
    const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const calculateOvertime = (hours: number) => {
      const regular = Math.min(hours, 8);
      const overtime = Math.max(hours - 8, 0);
      return { regular, overtime };
    };

    const { regular, overtime } = calculateOvertime(hoursWorked);

    // Get current user's employee ID (this should be available from auth context)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('employee_id, hourly_rate, bill_rate, cost_rate')
      .eq('user_id', user.id)
      .single();

    if (empError) throw empError;

    const calculateCosts = (
      hours: number,
      overtimeHours: number,
      employeeRate: number,
      billRate: number
    ) => {
      const regularCost = hours * employeeRate;
      const overtimeCost = overtimeHours * (employeeRate * 1.5);
      const totalCost = regularCost + overtimeCost;

      const regularBillable = hours * billRate;
      const overtimeBillable = overtimeHours * (billRate * 1.5);
      const totalBillable = regularBillable + overtimeBillable;

      return { totalCost, totalBillable };
    };

    const { totalCost, totalBillable } = calculateCosts(
      regular,
      overtime,
      employee?.cost_rate || employee?.hourly_rate || 0,
      employee?.bill_rate || 0
    );

    const { data: insertedEntry, error: insertError } = await supabase
      .from('time_entries')
      .insert({
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        date_worked: data.date_worked.toISOString().split('T')[0],
        start_time: data.start_time,
        end_time: data.end_time,
        hours_worked: hoursWorked,
        hours_regular: regular,
        hours_ot: overtime,
        employee_id: employee.employee_id,
        employee_rate: employee?.hourly_rate || 0,
        cost_rate: employee?.cost_rate || employee?.hourly_rate || 0,
        bill_rate: employee?.bill_rate || 0,
        total_cost: totalCost,
        total_billable: totalBillable,
        notes: data.notes,
        has_receipts: data.has_receipts || false,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return insertedEntry?.id || null;
  };

  const handleReceiptUploadComplete = () => {
    setShowReceiptUpload(false);
    toast({
      title: 'Time Entry & Receipts Complete! 🎉',
      description: 'Your time entry has been logged and receipts uploaded successfully.',
    });
    onComplete({
      entity_type: selectedAssignment!.entity_type,
      entity_id: selectedAssignment!.entity_id,
      date_worked: formData.date_worked!,
      start_time: formData.start_time!,
      end_time: formData.end_time!,
      notes: formData.notes,
      has_receipts: formData.has_receipts,
      receipt_data: formData.receipt_data,
    });
  };

  const handleSkipReceiptUpload = () => {
    setShowReceiptUpload(false);
    toast({
      title: 'Time Entry Logged Successfully! ⏰',
      description: 'You can upload receipts later from your time entries page.',
    });
    onComplete({
      entity_type: selectedAssignment!.entity_type,
      entity_id: selectedAssignment!.entity_id,
      date_worked: formData.date_worked!,
      start_time: formData.start_time!,
      end_time: formData.end_time!,
      notes: formData.notes,
      has_receipts: formData.has_receipts,
      receipt_data: formData.receipt_data,
    });
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              i + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            )}
          >
            {i + 1 <= currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={cn('w-12 h-1 mx-2', i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200')}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Assignment</h3>
        <p className="text-gray-600">Choose the project or work order you're logging time for</p>
      </div>

      {isLoadingAssignments ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading active work...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Work Available</h3>
          <p className="text-gray-600">No active projects or work orders found for time logging.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {assignments.map(assignment => (
            <Card
              key={assignment.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md border-l-4',
                assignment.priority === 'high' && 'border-l-red-500',
                assignment.priority === 'medium' && 'border-l-yellow-500',
                assignment.priority === 'low' && 'border-l-green-500',
                selectedAssignment?.id === assignment.id && 'ring-2 ring-blue-500 bg-blue-50'
              )}
              onClick={() => setSelectedAssignment(assignment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {assignment.entity_type === 'project' ? (
                      <Building2 className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Briefcase className="h-4 w-4 text-green-600" />
                    )}
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(assignment.priority)}>
                      {assignment.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {assignment.entity_type === 'project' ? 'Project' : 'Work Order'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  {assignment.location}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Details</h3>
        <p className="text-gray-600">When did you work and do you have receipts?</p>
      </div>

      <div className="space-y-4">
        {/* Date Selection */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">Work Date</Label>
          <div className="space-y-3">
            {[0, -1, -2].map(dayOffset => {
              const date = new Date();
              date.setDate(date.getDate() + dayOffset);
              const isSelected = formData.date_worked?.toDateString() === date.toDateString();

              return (
                <Card
                  key={dayOffset}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md',
                    isSelected && 'ring-2 ring-blue-500 bg-blue-50'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, date_worked: date }))}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(date)}</p>
                          <p className="text-sm text-gray-600">{format(date, 'EEEE, MMMM d')}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <Label htmlFor="custom-date">Custom Date</Label>
                    <Input
                      id="custom-date"
                      type="date"
                      value={formData.date_worked?.toISOString().split('T')[0] || ''}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          date_worked: new Date(e.target.value),
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Work Description */}
        <div>
          <Label htmlFor="work-description">Work Description (Optional)</Label>
          <Textarea
            id="work-description"
            placeholder="Brief description of work performed..."
            value={formData.notes || ''}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={2}
            className="mt-1"
          />
        </div>

        {/* Receipt Checkbox */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="has-receipts"
                checked={formData.has_receipts || false}
                onChange={e => setFormData(prev => ({ ...prev, has_receipts: e.target.checked }))}
                className="mt-1 rounded border-gray-300"
              />
              <div className="flex-1">
                <Label htmlFor="has-receipts" className="font-medium text-blue-900 cursor-pointer">
                  I have receipts to upload
                </Label>
                <p className="text-sm text-blue-700 mt-1">
                  Check this if you have receipts for materials, tools, or other expenses related to
                  this work
                </p>
              </div>
              <Receipt className="h-5 w-5 text-blue-600 mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Time</h3>
        <p className="text-gray-600">What time did you start and finish?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={formData.start_time || ''}
            onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={formData.end_time || ''}
            onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      {calculatedHours > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Time Summary</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Total Hours</p>
                <p className="text-xl font-bold text-blue-900">{calculatedHours.toFixed(1)}h</p>
              </div>
              {overtimeHours > 0 && (
                <div>
                  <p className="text-orange-700">Overtime</p>
                  <p className="text-xl font-bold text-orange-900">{overtimeHours.toFixed(1)}h</p>
                </div>
              )}
            </div>
            {overtimeHours > 0 && (
              <div className="mt-2 flex items-center space-x-1 text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Overtime will be calculated at 1.5x rate</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Time Presets */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Quick Start Times</Label>
          <div className="grid grid-cols-4 gap-2">
            {['07:00', '08:00', '09:00', '10:00'].map(time => (
              <Button
                key={time}
                variant={formData.start_time === time ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, start_time: time }))}
                className="text-xs"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Quick End Times</Label>
          <div className="grid grid-cols-4 gap-2">
            {['16:00', '17:00', '18:00', '19:00'].map(time => (
              <Button
                key={time}
                variant={formData.end_time === time ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, end_time: time }))}
                className="text-xs"
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* Common Work Day Presets */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Common Work Days</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFormData(prev => ({ ...prev, start_time: '08:00', end_time: '17:00' }))
              }
              className="text-xs"
            >
              8AM - 5PM (9h)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFormData(prev => ({ ...prev, start_time: '09:00', end_time: '17:00' }))
              }
              className="text-xs"
            >
              9AM - 5PM (8h)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Receipt Categories</h3>
        <p className="text-gray-600">How should receipts be categorized?</p>
      </div>

      {formData.has_receipts ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="expense-category">Expense Category</Label>
            <Select
              value={formData.receipt_data?.expense_category_id || ''}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  receipt_data: { ...prev.receipt_data, expense_category_id: value },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expense category..." />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-gray-500">{category.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cost-category">Cost Category</Label>
            <Select
              value={formData.receipt_data?.cost_category_id || ''}
              onValueChange={value =>
                setFormData(prev => ({
                  ...prev,
                  receipt_data: { ...prev.receipt_data, cost_category_id: value },
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cost category..." />
              </SelectTrigger>
              <SelectContent>
                {costCategories.map(category => (
                  <SelectItem key={category.category_id} value={category.category_id}>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-xs text-gray-500">{category.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="receipt-description">Receipt Description (Optional)</Label>
            <Input
              id="receipt-description"
              placeholder="e.g., Materials for kitchen renovation"
              value={formData.receipt_data?.description || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  receipt_data: { ...prev.receipt_data, description: e.target.value },
                }))
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-billable"
              checked={formData.receipt_data?.is_billable ?? true}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  receipt_data: { ...prev.receipt_data, is_billable: e.target.checked },
                }))
              }
              className="rounded border-gray-300"
            />
            <Label htmlFor="is-billable" className="text-sm">
              This expense is billable to the client
            </Label>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No receipts to categorize</p>
          <p className="text-sm text-gray-500 mt-1">
            You can always add receipts later from the time entries page
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={!showReceiptUpload} onOpenChange={onCancel}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Quick Log Time</span>
            </DialogTitle>
            <DialogDescription>
              Step {currentStep} of {totalSteps}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {renderStepIndicator()}

            <div className="min-h-[300px]">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={currentStep === 1 ? onCancel : handlePrevious}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{currentStep === 1 ? 'Cancel' : 'Previous'}</span>
              </Button>

              <Button
                onClick={currentStep === totalSteps ? handleSubmit : handleNext}
                disabled={!canProceedToNext()}
                className="flex items-center space-x-2"
              >
                <span>{currentStep === totalSteps ? 'Submit' : 'Next'}</span>
                {currentStep === totalSteps ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Upload Modal */}
      {showReceiptUpload && submittedTimeEntryId && (
        <Dialog open={showReceiptUpload} onOpenChange={() => setShowReceiptUpload(false)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5 text-green-600" />
                <span>Upload Receipts</span>
              </DialogTitle>
              <DialogDescription>
                Your time entry has been logged! Now upload any receipts for expenses related to
                this work.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <TimeEntryReceiptUpload
                timeEntryId={submittedTimeEntryId}
                employeeName={selectedAssignment?.title || 'Time Entry'}
                date={formData.date_worked?.toISOString()}
                onReceiptAdded={handleReceiptUploadComplete}
              />

              <Separator className="my-6" />

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handleSkipReceiptUpload}
                  className="flex items-center space-x-2"
                >
                  <span>Skip for Now</span>
                </Button>

                <Button
                  onClick={handleReceiptUploadComplete}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Done</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default QuickLogWizard;
