
import { useState, useEffect } from 'react';
import { useBudgetIntegration } from '@/hooks/useBudgetIntegration';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Check, DollarSign, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstimateBudgetIntegrationProps {
  estimateId: string;
  projectId: string;
  onComplete?: () => void;
}

const EstimateBudgetIntegration: React.FC<EstimateBudgetIntegrationProps> = ({ 
  estimateId, 
  projectId,
  onComplete
}) => {
  const [hasBudgetItems, setHasBudgetItems] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { createBudgetFromEstimate, isLoading } = useBudgetIntegration();

  // Check if the project already has budget items
  useEffect(() => {
    const checkBudgetItems = async () => {
      setLoading(true);
      try {
        const { count, error } = await supabase
          .from('project_budget_items')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', projectId);
        
        if (error) throw error;
        setHasBudgetItems(count ? count > 0 : false);
      } catch (error) {
        console.error('Error checking budget items:', error);
        toast({
          title: 'Error',
          description: 'Failed to check existing budget items.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      checkBudgetItems();
    }
  }, [projectId]);

  const handleCreateBudget = async () => {
    const success = await createBudgetFromEstimate(projectId, estimateId);
    if (success) {
      setHasBudgetItems(true);
      if (onComplete) onComplete();
    }
  };

  if (loading) {
    return (
      <Card className="border border-dashed">
        <CardContent className="pt-6">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-8 bg-slate-200 rounded w-40 mt-2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasBudgetItems) {
    return (
      <Card className="border-green-100">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-2 rounded-full">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-700">Budget Already Created</h3>
              <p className="text-sm text-green-600">This project already has budget items created.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
          Create Project Budget
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-start mb-3">
            <ArrowUpDown className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700">Create Project Budget from Estimate</p>
              <p className="text-sm text-blue-600">
                This will convert your estimate line items into budget categories for this project, making it easier to track project costs against your initial estimate.
              </p>
            </div>
          </div>
          
          <div className="flex items-start mt-4">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-600">
              If you've already created a custom budget for this project, this action will add additional budget items based on the estimate.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={handleCreateBudget}
          disabled={isLoading}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          {isLoading ? 'Creating Budget...' : 'Create Budget from Estimate'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EstimateBudgetIntegration;
