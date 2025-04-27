import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

import { Database } from '@/integrations/supabase/types';
import { Discount } from '@/services/discountService';
import FinancialSnapshotCard from '@/components/projects/detail/cards/FinancialSnapshotCard';
import ProjectHealthCard from '@/components/projects/detail/cards/ProjectHealthCard';
import UpcomingDatesCard from '@/components/projects/detail/cards/UpcomingDatesCard';

type Project = Database['public']['Tables']['projects']['Row'];
type BudgetItem = Database['public']['Tables']['project_budget_items']['Row'];
type Milestone = Database['public']['Tables']['project_milestones']['Row'];
type FetchedChangeOrder = {
  id: string;
  title: string | null;
  status: string;
  cost_impact: number | null;
  revenue_impact: number | null;
};

type Customer = Database['public']['Tables']['customers']['Row'];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [approvedChangeOrders, setApprovedChangeOrders] = useState<FetchedChangeOrder[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showAddChangeOrderDialog, setShowAddChangeOrderDialog] = useState(false);
  const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
  const [editingChangeOrderId, setEditingChangeOrderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    } else {
      setError('Project ID is missing');
      setLoading(false);
    }
  }, [projectId]);

  const fetchProjectData = async (id: string) => {
    setLoading(true);
    setError(null);
    setCustomer(null);
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('projectid', id)
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error('Project not found');
      setProject(projectData);

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
        supabase.from('project_budget_items').select('*').eq('project_id', id).order('created_at'),
        supabase.from('project_milestones').select('*').eq('projectid', id).order('due_date'),
        supabase
          .from('change_orders')
          .select('id, title, status, cost_impact, revenue_impact')
          .eq('entity_type', 'PROJECT')
          .eq('entity_id', id)
          .in('status', ['APPROVED', 'IMPLEMENTED']),
        supabase.from('discounts').select('*').eq('project_id', id),
      ]);

      if (customerResult?.error) {
        console.warn('Error fetching customer:', customerResult.error);
      } else {
        setCustomer(customerResult?.data || null);
      }

      if (budgetItemsResult.error) {
        console.warn('Error fetching budget items:', budgetItemsResult.error);
        setBudgetItems([]);
      } else {
        setBudgetItems(budgetItemsResult.data || []);
      }

      if (milestonesResult.error) {
        console.warn('Error fetching milestones:', milestonesResult.error);
        setMilestones([]);
      } else {
        setMilestones(milestonesResult.data || []);
      }

      if (changeOrdersResult.error) {
        console.warn('Error fetching change orders:', changeOrdersResult.error);
        setApprovedChangeOrders([]);
      } else {
        setApprovedChangeOrders(changeOrdersResult.data || []);
      }

      if (discountsResult.error) {
        console.warn('Error fetching discounts:', discountsResult.error);
        setDiscounts([]);
      } else {
        setDiscounts(discountsResult.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching project data:', error);
      setError(error.message || 'Error fetching project data');
    } finally {
      setLoading(false);
    }
  };

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
    fetchProjectData(projectId!);
  };

  const handleChangeOrderSaved = () => {
    setShowAddChangeOrderDialog(false);
    setEditingChangeOrderId(undefined);
    fetchProjectData(projectId!);
  };

  const handleDocumentUploadSuccess = () => {
    setShowAddDocumentDialog(false);
    fetchProjectData(projectId!);
  };

  const handleExpenseDialogClose = () => {
    setShowAddExpenseDialog(false);
  };

  // --- Calculations for Overview --- (Can be moved to a hook later)
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
      if (budgetVariance < 0)
        budgetStatus = 'critical'; // Over budget
      else if (budgetVariance < 15)
        budgetStatus = 'warning'; // Nearing budget
      else budgetStatus = 'on_track';
      budgetStatusLabel = budgetStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    } else {
      budgetVariance = 0; // Avoid NaN/Infinity if budget is 0
    }

    // TODO: Add Schedule Status calculation based on milestones
    const scheduleStatusLabel = 'TBD'; // Placeholder

    return {
      budget,
      spent,
      contract,
      estGP,
      budgetVariance: Math.max(0, budgetVariance), // Cap at 0% for display
      budgetStatus,
      budgetStatusLabel,
      scheduleStatusLabel,
    };
  };

  const overviewData = calculateOverviewData();

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        </div>
      </PageTransition>
    );
  }

  if (error || !project) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/projects')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Error Loading Project</h1>
                <p className="mt-2 text-gray-600">{error || 'Project not found'}</p>
                <Button
                  onClick={() => navigate('/projects')}
                  className="mt-4 bg-[#0485ea] hover:bg-[#0373ce]"
                >
                  Return to Projects
                </Button>
              </div>
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
                  // TODO: Pass actual dates (project.start_date, project.target_end_date, milestones?)
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
                onDataRefresh={() => fetchProjectData(projectId!)}
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
            entityId={projectId!}
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
