
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import BudgetOverview from './BudgetOverview';
import BudgetItems from './BudgetItems';
import ProjectExpenses from './ProjectExpenses';
import BudgetFormDialog from './BudgetFormDialog';
import { DollarSign, Plus } from 'lucide-react';

interface ProjectBudgetProps {
  projectId: string;
}

const ProjectBudget: React.FC<ProjectBudgetProps> = ({ projectId }) => {
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  
  // Fetch project budget data
  const { 
    data: project, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['project-budget', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('projectid, projectname, total_budget, current_expenses, budget_status')
        .eq('projectid', projectId)
        .single();
        
      if (error) throw error;
      return data;
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching project budget:', error);
        toast({
          title: 'Error loading project budget',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  });

  // Callback for when budget is updated
  const handleBudgetUpdated = () => {
    refetch();
    setShowBudgetDialog(false);
    toast({
      title: 'Budget updated',
      description: 'Project budget has been updated successfully.',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">Failed to load budget information</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Project Budget</h2>
        <Button 
          onClick={() => setShowBudgetDialog(true)}
          className="bg-[#0485ea] hover:bg-[#0375d1]"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          {project?.total_budget > 0 ? 'Update Budget' : 'Set Budget'}
        </Button>
      </div>
      
      <BudgetOverview 
        totalBudget={project?.total_budget || 0} 
        currentExpenses={project?.current_expenses || 0}
        budgetStatus={project?.budget_status || 'not_set'}
      />
      
      <Tabs defaultValue="budget-items">
        <TabsList>
          <TabsTrigger value="budget-items">Budget Items</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="budget-items">
          <BudgetItems projectId={projectId} onRefresh={refetch} />
        </TabsContent>
        
        <TabsContent value="expenses">
          <ProjectExpenses projectId={projectId} onRefresh={refetch} />
        </TabsContent>
      </Tabs>
      
      {showBudgetDialog && (
        <BudgetFormDialog
          projectId={projectId}
          initialBudget={project?.total_budget || 0}
          onSave={handleBudgetUpdated}
          onCancel={() => setShowBudgetDialog(false)}
        />
      )}
    </div>
  );
};

export default ProjectBudget;
