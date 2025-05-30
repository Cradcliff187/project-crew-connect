import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '@/components/ui/PageLayout';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import {
  Loader2,
  ArrowLeft,
  FileText,
  BarChart3,
  Banknote,
  FileDown,
  Edit,
  Plus,
  PlusCircle,
  FilePlus,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import ProjectHeader from '@/components/projects/detail/ProjectHeader';
import ProjectInfoCard from '@/components/projects/detail/ProjectInfoCard';
import ProjectClientCard from '@/components/projects/detail/ProjectClientCard';
import ProjectBudgetCard from '@/components/projects/detail/ProjectBudgetCard';
import ProjectDescription from '@/components/projects/detail/ProjectDescription';
import ProjectBudget from '@/components/projects/budget/ProjectBudget';
import ProjectMilestones from '@/components/projects/milestones/ProjectMilestones';
import ProjectDocumentsList from '@/components/projects/detail/DocumentsList';
import ProjectChangeOrdersList from '@/components/projects/detail/ChangeOrdersList';
import FinancialSummaryTab from '@/components/projects/detail/tabs/FinancialSummaryTab';
import ExpenseFormDialog from '@/components/projects/budget/ExpenseFormDialog';
import ChangeOrderDialog from '@/components/changeOrders/ChangeOrderDialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Discount } from '@/services/discountService';
import FinancialSnapshotCard from '@/components/projects/detail/cards/FinancialSnapshotCard';
import ProjectHealthCard from '@/components/projects/detail/cards/ProjectHealthCard';
import UpcomingDatesCard from '@/components/projects/detail/cards/UpcomingDatesCard';
import ProjectOverviewTab from '@/components/projects/detail/tabs/ProjectOverviewTab';
import ProjectScheduleTab from '@/components/projects/schedule/ProjectScheduleTab';
import StatusBadge from '@/components/common/status/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Define type aliases using generated types
type Project = Database['public']['Tables']['projects']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];
type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];
type Milestone = Database['public']['Tables']['project_milestones']['Row'];
type FetchedChangeOrder = Pick<
  Database['public']['Tables']['change_orders']['Row'],
  'id' | 'title' | 'cost_impact' | 'revenue_impact'
>; // Use Pick for specific columns

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
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showAddChangeOrderDialog, setShowAddChangeOrderDialog] = useState(false);
  const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
  const [editingChangeOrderId, setEditingChangeOrderId] = useState<string | undefined>(undefined);

  const {
    data: projectDetailData,
    isLoading,
    error,
    refetch,
  } = useQuery<ProjectDetailData, Error>({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is missing');

      // console.log(`[useQuery ProjectDetail] Fetching project with id: ${projectId}`);

      // Use typed client calls
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', projectId)
        .maybeSingle();

      if (projectError && projectError.code !== 'PGRST116') throw projectError;
      if (!projectData) throw new Error('Project not found');

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
          .from('change_orders') // Ensure type matches FetchedChangeOrder definition
          .select('id, title, cost_impact, revenue_impact')
          .eq('entity_type', 'PROJECT')
          .eq('entity_id', projectId),
        supabase.from('discounts').select('*').eq('project_id', projectId), // Assuming Discount type is compatible
      ]);

      if (customerResult?.error) console.warn('Error fetching customer:', customerResult.error);
      if (budgetItemsResult.error)
        console.warn('Error fetching budget items:', budgetItemsResult.error);
      if (milestonesResult.error)
        console.warn('Error fetching milestones:', milestonesResult.error);
      if (changeOrdersResult.error)
        console.warn('Error fetching change orders:', changeOrdersResult.error);
      if (discountsResult.error) console.warn('Error fetching discounts:', discountsResult.error);

      return {
        project: projectData, // No cast needed
        customer: customerResult?.data ?? null, // No cast needed
        budgetItems: budgetItemsResult.data ?? [], // No cast needed
        milestones: milestonesResult.data ?? [], // No cast needed
        approvedChangeOrders: changeOrdersResult.data ?? [], // No cast needed
        discounts: discountsResult.data ?? [], // Assuming Discount type is correct
      };
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });

  const project = projectDetailData?.project ?? null;
  const customer = projectDetailData?.customer ?? null;
  const budgetItems = projectDetailData?.budgetItems ?? [];
  const milestones = projectDetailData?.milestones ?? [];
  const approvedChangeOrders = projectDetailData?.approvedChangeOrders ?? [];
  const discounts = projectDetailData?.discounts ?? [];

  const handleAddExpenseClick = () => {
    setShowAddExpenseDialog(true);
  };

  const handleAddChangeOrderClick = () => {
    setEditingChangeOrderId(undefined);
    setShowAddChangeOrderDialog(true);
  };

  const handleAddDocumentClick = () => {
    setShowAddDocumentDialog(true);
  };

  const handleExpenseSaved = () => {
    setShowAddExpenseDialog(false);
    queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-budget-summary', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-expenses', projectId] });
  };

  const handleChangeOrderSaved = () => {
    setShowAddChangeOrderDialog(false);
    setEditingChangeOrderId(undefined);
    queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] });
    queryClient.invalidateQueries({ queryKey: ['project-budget-summary', projectId] });
  };

  const handleDocumentUploadSuccess = () => {
    setShowAddDocumentDialog(false);
    queryClient.invalidateQueries({ queryKey: ['project-detail', projectId] });
  };

  const handleExpenseDialogClose = () => {
    setShowAddExpenseDialog(false);
  };

  const calculateOverviewData = () => {
    if (!project) return {};

    const budget = project.total_budget || 0;
    const spent = project.current_expenses || 0;
    const contract = project.contract_value || 0;
    const estGP = contract - budget;

    let budgetVariance = budget > 0 ? ((budget - spent) / budget) * 100 : 0;
    let budgetStatus: 'on_track' | 'warning' | 'critical' | 'default' = 'default';
    let budgetStatusLabel = 'Not Set';

    if (budget > 0) {
      if (budgetVariance < 0) budgetStatus = 'critical';
      else if (budgetVariance < 15) budgetStatus = 'warning';
      else budgetStatus = 'on_track';
      budgetStatusLabel = budgetStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else {
      budgetVariance = 0;
    }

    const scheduleStatusLabel = 'TBD';

    return {
      budget,
      spent,
      contract,
      estGP,
      budgetVariance: Math.max(0, budgetVariance),
      budgetStatus,
      budgetStatusLabel,
      scheduleStatusLabel,
    };
  };

  const overviewData = calculateOverviewData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <PageLayout title="Error Loading Project" icon={AlertCircle}>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="mt-2 text-muted-foreground">
                {(error as Error).message || 'Could not load project data'}
              </p>
              <div className="mt-4 space-x-2">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={() => refetch()}>Retry</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  if (!isLoading && !project) {
    return (
      <PageLayout title="Project Not Found" icon={AlertCircle}>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mt-2 text-muted-foreground">
              The requested project (ID: {projectId}) could not be found.
            </p>
            <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Determine budget status for badge
  const getBudgetStatusBadge = () => {
    const { budgetStatus } = overviewData;
    switch (budgetStatus) {
      case 'critical':
        return { text: 'Over Budget', variant: 'destructive' as const };
      case 'warning':
        return { text: 'Near Budget', variant: 'secondary' as const };
      case 'on_track':
        return { text: 'On Track', variant: 'default' as const };
      default:
        return { text: 'Active', variant: 'outline' as const };
    }
  };

  return (
    <PageLayout
      title={project.projectname}
      subtitle={`${customer?.customername || 'No customer assigned'} • ID: ${project.projectid}`}
      icon={Building2}
      badge={getBudgetStatusBadge()}
    >
      <div className="space-y-6">
        {/* Action Buttons Row */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${project.projectid}/edit`)}
            className="font-opensans"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            onClick={handleAddExpenseClick}
            className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddChangeOrderClick}
            className="font-opensans"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Change Order
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddDocumentClick}
            className="font-opensans"
          >
            <FileText className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full rounded-lg border p-1">
            <TabsTrigger value="overview" className="font-opensans">
              <Banknote className="h-4 w-4 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="financials" className="font-opensans">
              <BarChart3 className="h-4 w-4 mr-1" /> Financials
            </TabsTrigger>
            <TabsTrigger value="budget" className="font-opensans">
              <Banknote className="h-4 w-4 mr-1" /> Budget
            </TabsTrigger>
            <TabsTrigger value="schedule" className="font-opensans">
              <FileText className="h-4 w-4 mr-1" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="changes" className="font-opensans">
              <FileDown className="h-4 w-4 mr-1" /> Change Orders
            </TabsTrigger>
            <TabsTrigger value="documents" className="font-opensans">
              <FileText className="h-4 w-4 mr-1" /> Documents
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="overview" className="mt-0">
              <ProjectOverviewTab
                project={{
                  ...project,
                  description: project?.description || '',
                  contract_value: project?.contract_value || 0,
                }}
                customerName={customer?.customername || null}
                customerId={project?.customerid || null}
                onEditClick={() => {
                  // We can reuse the existing navigation logic here
                  if (project) {
                    navigate(`/projects/${project.projectid}/edit`);
                  }
                }}
                onAddItemClick={handleAddExpenseClick}
              />
            </TabsContent>

            <TabsContent value="financials" className="mt-0">
              <FinancialSummaryTab
                project={project}
                budgetItems={budgetItems}
                approvedChangeOrders={approvedChangeOrders}
                discounts={discounts}
                onDataRefresh={() => refetch()}
              />
            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <ProjectBudget projectId={project.projectid} />
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <ProjectScheduleTab projectId={project.projectid} />
            </TabsContent>

            <TabsContent value="changes" className="mt-0">
              <ProjectChangeOrdersList projectId={project.projectid} />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <ProjectDocumentsList projectId={project.projectid} />
            </TabsContent>
          </div>
        </Tabs>

        {showAddExpenseDialog && (
          <ExpenseFormDialog
            projectId={project.projectid}
            expense={null}
            onSave={handleExpenseSaved}
            onCancel={handleExpenseDialogClose}
            open={showAddExpenseDialog}
            onOpenChange={setShowAddExpenseDialog}
          />
        )}

        {showAddChangeOrderDialog && (
          <ChangeOrderDialog
            isOpen={showAddChangeOrderDialog}
            onClose={() => setShowAddChangeOrderDialog(false)}
            entityType="PROJECT"
            projectId={projectId!}
            changeOrder={undefined}
            onSaved={handleChangeOrderSaved}
          />
        )}

        {showAddDocumentDialog && (
          <Dialog open={showAddDocumentDialog} onOpenChange={setShowAddDocumentDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Document to Project</DialogTitle>
                <DialogDescription>
                  Upload files to attach directly to this project.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 max-h-[80vh] overflow-y-auto">
                <EnhancedDocumentUpload
                  entityType="PROJECT"
                  entityId={projectId!}
                  onSuccess={handleDocumentUploadSuccess}
                  onCancel={() => setShowAddDocumentDialog(false)}
                  preventFormPropagation={true}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageLayout>
  );
};

export default ProjectDetail;
