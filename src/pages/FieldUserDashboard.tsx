import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with real data hooks
const mockAssignments = [
  {
    id: '1',
    title: 'Kitchen Renovation - Phase 2',
    entity_type: 'project' as const,
    entity_id: 'proj_001',
    due_date: new Date().toISOString(),
    priority: 'high' as const,
    status: 'IN_PROGRESS',
    description: 'Complete cabinet installation and countertop measurements',
    location: '123 Main St, Downtown',
    estimated_hours: 6,
  },
  {
    id: '2',
    title: 'HVAC System Maintenance',
    entity_type: 'work_order' as const,
    entity_id: 'wo_001',
    due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    priority: 'medium' as const,
    status: 'SCHEDULED',
    description: 'Quarterly maintenance check and filter replacement',
    location: '456 Oak Ave, Midtown',
    estimated_hours: 3,
  },
  {
    id: '3',
    title: 'Bathroom Tile Repair',
    entity_type: 'work_order' as const,
    entity_id: 'wo_002',
    due_date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    priority: 'low' as const,
    status: 'NEW',
    description: 'Replace damaged tiles in master bathroom',
    location: '789 Pine St, Uptown',
    estimated_hours: 4,
  },
];

const mockRecentEntries = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    hours: 7.5,
    entity_name: 'Office Building Renovation',
    status: 'submitted' as const,
  },
  {
    id: '2',
    date: new Date().toISOString(), // Today
    hours: 4.0,
    entity_name: 'HVAC Repair - Unit 5',
    status: 'draft' as const,
  },
];

const FieldUserDashboard: React.FC = () => {
  const { user, role, isFieldUser } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Redirect if not field user
  if (!isFieldUser) {
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Good morning! 👋</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Field User
            </Badge>
          </div>
          <p className="text-gray-600">
            Welcome back, {user?.user_metadata?.full_name || 'Field User'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
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
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {mockAssignments.length} active
            </Badge>
          </div>

          <div className="space-y-4">
            {mockAssignments.map(assignment => (
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{assignment.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Timer className="h-4 w-4 mr-2" />
                      <span>{assignment.estimated_hours}h estimated</span>
                    </div>
                  </div>

                  {selectedAssignment === assignment.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1">
                          <Clock className="h-4 w-4 mr-2" />
                          Start Timer
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

          <div className="space-y-3">
            {mockRecentEntries.map(entry => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          entry.status === 'submitted' ? 'bg-green-500' : 'bg-yellow-500'
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
                      {entry.status === 'submitted' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <Badge
                        variant={entry.status === 'submitted' ? 'default' : 'secondary'}
                        className={cn(
                          entry.status === 'submitted'
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
                <p className="text-2xl font-bold text-blue-900">32.5</p>
                <p className="text-sm text-blue-700">Total Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">4</p>
                <p className="text-sm text-blue-700">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">2</p>
                <p className="text-sm text-blue-700">Work Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-900">$1,240</p>
                <p className="text-sm text-blue-700">Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FieldUserDashboard;
