import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import {
  Loader2,
  ArrowLeft,
  FileText,
  BarChart3,
  Banknote,
  FileDown,
  MoreHorizontal,
  Edit,
  Trash,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import StatusBadge from '@/components/common/status/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ProjectMilestones from './milestones/ProjectMilestones';
import ProjectProgress from './progress/ProjectProgress';
import ProjectBudget from './budget/ProjectBudget';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusType } from '@/types/common';
import ProjectHeader from '@/components/projects/detail/ProjectHeader';
import ProjectInfoCard from '@/components/projects/detail/ProjectInfoCard';
import ProjectClientCard from '@/components/projects/detail/ProjectClientCard';
import FinancialSummaryTab from '@/components/projects/detail/tabs/FinancialSummaryTab';
import ExpenseFormDialog from '@/components/projects/budget/ExpenseFormDialog';
import ChangeOrderDialog from '@/components/changeOrders/ChangeOrderDialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Discount } from '@/services/discountService';
import FinancialSnapshotCard from '@/components/projects/detail/cards/FinancialSnapshotCard';
import ProjectHealthCard from '@/components/projects/detail/cards/ProjectHealthCard';
import UpcomingDatesCard from '@/components/projects/detail/cards/UpcomingDatesCard';
import { useToast } from '@/hooks/use-toast';

type Project = Database['public']['Tables']['projects']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];
type Milestone = Database['public']['Tables']['project_milestones']['Row'];
type FetchedChangeOrder = Pick<
  Database['public']['Tables']['change_orders']['Row'],
  'id' | 'title' | 'cost_impact' | 'revenue_impact'
>;

interface ProjectDetailData {
  project: Project | null;
  customer: Customer | null;
  budgetItems: BudgetItem[];
  milestones: Milestone[];
  approvedChangeOrders: FetchedChangeOrder[];
  discounts: Discount[];
}

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data: projectDetailData,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<ProjectDetailData, Error>({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      try {
        if (!projectId) throw new Error('Project ID is missing');

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('projectid', projectId)
          .maybeSingle();

        if (projectError && projectError.code !== 'PGRST116') throw projectError;
        if (!projectData) throw new Error('Project not found');

        setProject(projectData as Project);

        if (
          projectData.customerid &&
          (!projectData.customername || projectData.customername.trim() === '')
        ) {
          console.log('Fetching customer details for ID:', projectData.customerid);
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('customerid, customername')
            .eq('customerid', projectData.customerid)
            .single();

          if (customerError) {
            console.warn('Error fetching customer details:', customerError);
          } else if (customerData) {
            console.log('Found customer details:', customerData);
            setCustomerDetails(customerData as Customer);

            setProject(prev =>
              prev
                ? {
                    ...prev,
                    customername: customerData.customername,
                  }
                : prev
            );
          }
        }

        const customerId = projectData.customerid;
        const [
          customerResult,
          budgetItemsResult,
          milestonesResult,
          changeOrdersResult,
          discountsResult,
        ] = await Promise.all([
          customerId
            ? supabase.from('customers').select('*').eq('customerid', customerId).single()
            : Promise.resolve({ data: null, error: null }),
          supabase
            .from('project_budget_items')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at'),
          supabase
            .from('project_milestones')
            .select('*')
            .eq('projectid', projectId)
            .order('due_date'),
          supabase
            .from('change_orders')
            .select('id, title, cost_impact, revenue_impact')
            .eq('entity_type', 'PROJECT')
            .eq('entity_id', projectId),
          supabase.from('discounts').select('*').eq('project_id', projectId),
        ]);

        return {
          project: projectData as Project | null,
          customer: customerResult?.data as Customer | null,
          budgetItems: (budgetItemsResult.data ?? []) as BudgetItem[],
          milestones: (milestonesResult.data ?? []) as Milestone[],
          approvedChangeOrders: (changeOrdersResult.data ?? []) as FetchedChangeOrder[],
          discounts: (discountsResult.data ?? []) as Discount[],
        };
      } catch (error: any) {
        console.error('Error fetching project details:', error);
        setError(error.message);
        toast({
          title: 'Error loading project',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });

  const handleBackClick = () => {
    navigate('/projects');
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    if (window.confirm(`Are you sure you want to delete project "${project.projectname}"?`)) {
      try {
        const { error } = await supabase
          .from('projects')
          .update({ status: 'cancelled' })
          .eq('projectid', project.projectid);

        if (error) throw error;

        toast({
          title: 'Project cancelled',
          description: `Project "${project.projectname}" has been cancelled.`,
        });

        navigate('/projects');
      } catch (error: any) {
        toast({
          title: 'Error cancelling project',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const getCustomerName = () => {
    return projectDetailData?.customer?.customername || 'No Customer';
  };

  const getCustomerId = () => {
    return projectDetailData?.customer?.customerid || projectDetailData?.project?.customerid || '';
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackClick} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>

          {loading ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </>
          ) : queryError ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{queryError.message}</p>
              <Button onClick={handleBackClick}>Return to Projects</Button>
            </div>
          ) : project ? (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">{project.projectname}</h1>
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <span className="mr-2">{project.projectid}</span>
                    <span className="mx-2">•</span>
                    <span>Created on {formatDate(project.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center">
                  <StatusBadge status={project.status as StatusType} className="mr-4" />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/projects/${project.projectid}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                        <Trash className="h-4 w-4 mr-2" />
                        Cancel Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Customer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{getCustomerName()}</div>
                    <div className="text-sm text-muted-foreground">{getCustomerId()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Site Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.site_address ? (
                      <div>
                        <div>{project.site_address}</div>
                        <div>
                          {project.site_city}, {project.site_state} {project.site_zip}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Same as customer address</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(project.total_budget)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {project.current_expenses
                            ? formatCurrency(project.current_expenses) + ' spent'
                            : 'No expenses'}
                        </div>
                      </div>
                      {project.budget_status && (
                        <StatusBadge status={project.budget_status as StatusType} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.description ? (
                    <p>{project.description}</p>
                  ) : (
                    <p className="text-muted-foreground">No job description provided.</p>
                  )}
                </CardContent>
              </Card>

              <Tabs defaultValue="progress">
                <TabsList className="mb-4">
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="milestones">Tasks & Milestones</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                </TabsList>

                <TabsContent value="progress">
                  <ProjectProgress projectId={project.projectid} />
                </TabsContent>

                <TabsContent value="milestones">
                  <ProjectMilestones projectId={project.projectid} />
                </TabsContent>

                <TabsContent value="budget">
                  <ProjectBudget projectId={project.projectid} />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-12">
              <p>Project not found.</p>
              <Button onClick={handleBackClick} className="mt-4">
                Return to Projects
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;
