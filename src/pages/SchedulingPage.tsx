import { useState } from 'react';
import {
  Calendar,
  Plus,
  Users,
  Building2,
  Wrench,
  UserCircle,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UnifiedSchedulingDialog from '@/components/scheduling/UnifiedSchedulingDialog';
import { createScheduleItem } from '@/lib/calendarService';
import { useToast } from '@/hooks/use-toast';

const SchedulingPage = () => {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedScheduleType, setSelectedScheduleType] = useState<{
    entityType:
      | 'project_milestone'
      | 'schedule_item'
      | 'work_order'
      | 'contact_interaction'
      | 'personal_task';
    title: string;
    description: string;
  } | null>(null);

  const { toast } = useToast();

  const scheduleTypes = [
    {
      entityType: 'schedule_item' as const,
      title: 'Project Schedule Item',
      description: 'Schedule work activities for specific projects',
      icon: Building2,
      color: 'bg-blue-500',
      calendar: 'AJC Projects Calendar',
      examples: ['Foundation inspection', 'Plumbing rough-in', 'Final walkthrough'],
      features: ['Project context', 'Team notifications', 'Progress tracking'],
    },
    {
      entityType: 'work_order' as const,
      title: 'Work Order',
      description: 'Schedule maintenance and service work',
      icon: Wrench,
      color: 'bg-orange-500',
      calendar: 'Work Orders Calendar',
      examples: ['HVAC repair', 'Electrical maintenance', 'Emergency service'],
      features: ['Service tracking', 'Technician assignment', 'Priority handling'],
    },
    {
      entityType: 'contact_interaction' as const,
      title: 'Client Meeting',
      description: 'Schedule meetings with clients and stakeholders',
      icon: Users,
      color: 'bg-green-500',
      calendar: 'Context-dependent',
      examples: ['Design review', 'Project kickoff', 'Status update'],
      features: ['Client communication', 'Meeting notes', 'Follow-up tracking'],
    },
    {
      entityType: 'personal_task' as const,
      title: 'Personal Task',
      description: 'Schedule personal reminders and administrative tasks',
      icon: UserCircle,
      color: 'bg-purple-500',
      calendar: 'Personal Calendar',
      examples: ['Equipment maintenance', 'Training session', 'Admin tasks'],
      features: ['Personal reminders', 'Task management', 'Time blocking'],
    },
  ];

  const handleScheduleTypeSelect = (scheduleType: (typeof scheduleTypes)[0]) => {
    setSelectedScheduleType({
      entityType: scheduleType.entityType,
      title: `New ${scheduleType.title}`,
      description: scheduleType.description,
    });
    setScheduleDialogOpen(true);
  };

  const handleScheduleSave = async (eventData: any) => {
    try {
      const result = await createScheduleItem(eventData);

      if (result.id) {
        toast({
          title: 'Event Scheduled Successfully',
          description: `Added to project calendar. Event ID: ${result.google_event_id}`,
        });
        return true;
      } else {
        toast({
          title: 'Scheduling Failed',
          description: 'Failed to schedule event',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error scheduling event:', error);
      toast({
        title: 'Scheduling Error',
        description: error.message || 'An unexpected error occurred while scheduling',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Scheduling Center</h1>
            <p className="text-xl text-muted-foreground mt-2">
              Intelligent calendar integration for all your scheduling needs
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-sm flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Smart Calendar Selection
          </Badge>
          <Badge variant="outline" className="text-sm flex items-center gap-1">
            <Users className="h-3 w-3 text-blue-500" />
            Automatic Invites
          </Badge>
          <Badge variant="outline" className="text-sm flex items-center gap-1">
            <Clock className="h-3 w-3 text-purple-500" />
            Real-time Sync
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-lg font-semibold">Project Items</p>
                  <p className="text-sm text-muted-foreground">AJC Projects Calendar</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wrench className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-lg font-semibold">Work Orders</p>
                  <p className="text-sm text-muted-foreground">Work Orders Calendar</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-lg font-semibold">Client Meetings</p>
                  <p className="text-sm text-muted-foreground">Context-aware</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCircle className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-lg font-semibold">Personal Tasks</p>
                  <p className="text-sm text-muted-foreground">Personal Calendar</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Type Cards */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Choose Your Scheduling Type</h2>
          <p className="text-muted-foreground">Select the type of event you want to schedule</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduleTypes.map(scheduleType => {
            const IconComponent = scheduleType.icon;
            return (
              <Card
                key={scheduleType.entityType}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
                onClick={() => handleScheduleTypeSelect(scheduleType)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${scheduleType.color} text-white shadow-lg`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{scheduleType.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {scheduleType.calendar}
                        </Badge>
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    {scheduleType.description}
                  </CardDescription>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Key Features:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {scheduleType.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Examples:</p>
                      <ul className="text-sm space-y-1">
                        {scheduleType.examples.map((example, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button
                    className="w-full group-hover:bg-primary/90 transition-colors mt-4"
                    onClick={e => {
                      e.stopPropagation();
                      handleScheduleTypeSelect(scheduleType);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule {scheduleType.title}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-blue-600" />
            Intelligent Calendar Features
          </CardTitle>
          <CardDescription className="text-lg">
            Our smart scheduling system automatically handles calendar selection and invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Smart Calendar Selection</h4>
                <p className="text-muted-foreground">
                  Automatically chooses the right calendar based on context and entity type
                </p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="p-4 bg-green-100 rounded-full w-fit mx-auto">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Automatic Invites</h4>
                <p className="text-muted-foreground">
                  Sends calendar invites to all selected assignees with proper notifications
                </p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Context Awareness</h4>
                <p className="text-muted-foreground">
                  Understands project vs work order vs personal scheduling requirements
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Scheduling Dialog */}
      {selectedScheduleType && (
        <UnifiedSchedulingDialog
          open={scheduleDialogOpen}
          onOpenChange={setScheduleDialogOpen}
          context={{
            entityType: selectedScheduleType.entityType,
            title: selectedScheduleType.title,
            description: selectedScheduleType.description,
          }}
          onSave={handleScheduleSave}
          onCancel={() => {
            setScheduleDialogOpen(false);
            setSelectedScheduleType(null);
          }}
        />
      )}
    </div>
  );
};

export default SchedulingPage;
