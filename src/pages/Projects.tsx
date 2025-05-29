import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import ProjectsTable from '@/components/projects/ProjectsTable';
import { useQuery } from '@tanstack/react-query';

const fetchProjects = async () => {
  // 1. Fetch projects and related customer data
  const { data: projectsData, error: projectsError } = await supabase
    .from('projects')
    .select(
      // Select necessary project fields including cost basis
      'projectid, projectname, status, created_at, customerid, total_budget, current_expenses, original_base_cost, customers(customerid, customername)'
    )
    .order('created_at', { ascending: false });

  if (projectsError) {
    throw projectsError;
  }

  if (!projectsData || projectsData.length === 0) {
    return []; // Return empty if no projects found
  }

  const projectIds = projectsData.map(p => p.projectid);

  // 2. Fetch progress data (existing logic)
  const { data: progressData, error: progressError } = await supabase
    .from('project_progress')
    .select('projectid, progress_percentage')
    .in('projectid', projectIds); // Filter by fetched project IDs

  if (progressError) {
    console.warn('Error fetching progress data:', progressError);
  }
  const progressMap = new Map();
  if (progressData) {
    progressData.forEach(item => {
      progressMap.set(item.projectid, item.progress_percentage);
    });
  }

  // 3. Fetch Change Order Cost Impact Sums
  const { data: coCostData, error: coCostError } = await supabase
    .from('project_change_orders') // Assuming this is the correct table name
    .select('project_id, cost_impact')
    .in('project_id', projectIds)
    .eq('status', 'Approved'); // Only include Approved COs in cost budget

  if (coCostError) {
    console.warn('Error fetching change order cost impacts:', coCostError);
  }
  const coCostMap = new Map<string, number>();
  if (coCostData) {
    coCostData.forEach(item => {
      const currentSum = coCostMap.get(item.project_id) || 0;
      coCostMap.set(item.project_id, currentSum + (item.cost_impact || 0));
    });
  }

  // 4. Transform data
  return projectsData.map(project => {
    const originalBaseCost = project.original_base_cost || 0;
    const changeOrderCostSum = coCostMap.get(project.projectid) || 0;
    const totalEstimatedCostBudget = originalBaseCost + changeOrderCostSum;
    const currentExpenses = project.current_expenses || 0;

    return {
      ...project,
      createdon: project.created_at, // Keep existing alias if needed elsewhere
      customername:
        project.customers?.customername || (project.customerid ? 'Unknown Customer' : 'No Client'),
      budget: project.total_budget || 0, // Keep original 'budget' field mapped to total_budget (revenue)
      spent: currentExpenses, // Keep original 'spent' field mapped to current_expenses
      progress: progressMap.has(project.projectid) ? progressMap.get(project.projectid) : 0,
      original_base_cost: originalBaseCost, // Pass original base cost
      total_estimated_cost_budget: totalEstimatedCostBudget, // Pass calculated total cost budget
      // Ensure total_budget is still passed for Est. Revenue column
      total_budget: project.total_budget || 0,
    };
  });
};

const Projects = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { user } = useAuth();

  const {
    data: projects = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const error = queryError ? (queryError as Error).message : null;

  // Calculate metrics for summary cards
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    project => project.status === 'active' || project.status === 'in_progress'
  ).length;
  const completedThisMonth = projects.filter(project => {
    if (project.status !== 'completed') return false;
    if (!project.created_at) return false;
    const created = new Date(project.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const totalBudget = projects.reduce((sum, project) => sum + (project.total_budget || 0), 0);
  const behindSchedule = projects.filter(project => {
    const progress = project.progress || 0;
    return project.status === 'active' && progress < 50; // Simple heuristic
  }).length;

  // Function to trigger refresh of projects
  const handleProjectAdded = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              <Building className="h-8 w-8 mr-3 text-blue-600" />
              Projects Management
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
            >
              {user?.role || 'User'}
            </Badge>
          </div>
          <p className="text-gray-600 font-opensans">
            Manage project timelines, budgets, and progress
          </p>
        </div>

        {/* Summary Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium font-opensans">Active Projects</p>
                  <p className="text-2xl font-bold text-blue-900 font-montserrat">
                    {activeProjects}
                  </p>
                </div>
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium font-opensans">
                    Completed This Month
                  </p>
                  <p className="text-2xl font-bold text-green-900 font-montserrat">
                    {completedThisMonth}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium font-opensans">Total Budget</p>
                  <p className="text-2xl font-bold text-purple-900 font-montserrat">
                    ${totalBudget.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium font-opensans">
                    Behind Schedule
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 font-montserrat">
                    {behindSchedule}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Maximum Space for Project Data */}
        <PageTransition>
          <div className="flex flex-col">
            <ProjectsHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onProjectAdded={handleProjectAdded}
              showAddDialog={showAddDialog}
              setShowAddDialog={setShowAddDialog}
            />

            <div className="mt-4">
              <ProjectsTable
                projects={projects}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default Projects;
