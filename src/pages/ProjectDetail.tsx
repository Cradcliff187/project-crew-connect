import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft, FileText, BarChart3, Banknote, FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

import ProjectHeader from '@/components/projects/detail/ProjectHeader';
import ProjectInfoCard from '@/components/projects/detail/ProjectInfoCard';
import ProjectClientCard from '@/components/projects/detail/ProjectClientCard';
import ProjectBudgetCard from '@/components/projects/detail/ProjectBudgetCard';
import ProjectDescription from '@/components/projects/detail/ProjectDescription';
import ProjectBudget from '@/components/projects/budget/ProjectBudget';
import ProjectMilestones from '@/components/projects/detail/ProjectMilestones';
import ProjectDocumentsList from '@/components/projects/detail/DocumentsList';
import ProjectChangeOrdersList from '@/components/projects/detail/ChangeOrdersList';
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

// Define project types manually to avoid TypeScript errors
interface Project {
  projectid: string;
  projectname?: string | null;
  description?: string | null;
  status?: string | null;
  customerid?: string | null;
  total_budget?: number | null;
  current_expenses?: number | null;
  contract_value?: number | null;
  start_date?: string | null;
  target_end_date?: string | null;
  // Add other fields as needed
}

interface BudgetItem {
  id: string;
  project_id: string;
  description?: string | null;
  category: string;
  estimated_amount: number;
  actual_amount?: number | null;
  document_id?: string | null;
  // Add other fields as needed
}

interface Milestone {
  id: string;
  projectid: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  is_completed: boolean;
  // Add other fields as needed
}

type FetchedChangeOrder = {
  id: string;
  title: string | null;
  cost_impact: number | null;
  revenue_impact: number | null;
};

interface Customer {
  customerid: string;
  customername?: string | null;
  // Add other fields as needed
}

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

      console.log(`[useQuery ProjectDetail] Fetching project with id: ${projectId}`);

      // Use any type assertion for supabase to bypass TypeScript checking
      const supabaseAny = supabase as any;

      const { data: projectData, error: projectError } = await supabaseAny
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
          ? supabaseAny.from('customers').select('*').eq('customerid', customerId).single()
          : Promise.resolve({ data: null, error: null }),
        supabaseAny
          .from('project_budget_items')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at'),
        supabaseAny
          .from('project_milestones')
          .select('*')
          .eq('projectid', projectId)
          .order('due_date'),
        supabaseAny
          .from('change_orders')
          .select('id, title, cost_impact, revenue_impact')
          .eq('entity_type', 'PROJECT')
          .eq('entity_id', projectId),
        supabaseAny.from('discounts').select('*').eq('project_id', projectId),
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
        project: projectData as Project,
        customer: customerResult?.data as Customer | null,
        budgetItems: (budgetItemsResult.data as BudgetItem[]) || [],
        milestones: (milestonesResult.data as Milestone[]) || [],
        approvedChangeOrders: (changeOrdersResult.data as FetchedChangeOrder[]) || [],
        discounts: discountsResult.data || [],
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
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Error Loading Project</h1>
                <p className="mt-2 text-gray-600">
                  {(error as Error).message || 'Could not load project data'}
                </p>
                <Button onClick={() => refetch()} className="mt-4 bg-[#0485ea] hover:bg-[#0373ce]">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (!isLoading && !project) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="py-8 text-center">
              <h1 className="text-2xl font-bold text-orange-500">Project Not Found</h1>
              <p className="mt-2 text-gray-600">
                The requested project (ID: {projectId}) could not be found.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <ProjectHeader
          project={project}
          onAddExpenseClick={handleAddExpenseClick}
          onAddChangeOrderClick={handleAddChangeOrderClick}
          onAddDocumentClick={handleAddDocumentClick}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 w-full rounded-lg border p-1">
            <TabsTrigger value="overview">
              <Banknote className="h-4 w-4 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="financials">
              <BarChart3 className="h-4 w-4 mr-1" /> Financials
            </TabsTrigger>
            <TabsTrigger value="budget">
              <Banknote className="h-4 w-4 mr-1" /> Budget
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <FileText className="h-4 w-4 mr-1" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="changes">
              <FileDown className="h-4 w-4 mr-1" /> Change Orders
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-1" /> Documents
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-2 lg:col-span-1 space-y-6">
                  <ProjectInfoCard project={project} />
                  <ProjectClientCard
                    customerName={customer?.customername || '-'}
                    customerId={project.customerid}
                  />
                </div>

                <div className="space-y-6">
                  <FinancialSnapshotCard
                    contractValue={overviewData.contract}
                    budget={overviewData.budget}
                    spent={overviewData.spent}
                    estimatedGP={overviewData.estGP}
                  />
                  <ProjectHealthCard
                    budgetStatusLabel={overviewData.budgetStatusLabel}
                    scheduleStatusLabel={overviewData.scheduleStatusLabel}
                    budgetVariance={overviewData.budgetVariance}
                  />
                </div>

                <div className="space-y-6">
                  <ProjectDescription description={project.description} />
                  <UpcomingDatesCard
                    startDate={project.start_date}
                    targetEndDate={project.target_end_date}
                  />
                </div>
              </div>
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
              <ProjectMilestones projectId={project.projectid} />
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
    </PageTransition>
  );
};

export default ProjectDetail;
