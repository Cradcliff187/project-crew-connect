
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBudgetIntegration } from '@/hooks/useBudgetIntegration';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2, FileDigit, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkOrderLinkDetail } from '@/types/workOrderLinks';

interface Project {
  projectid: string;
  projectname: string;
}

interface BudgetItem {
  id: string;
  category: string;
  description: string;
}

interface WorkOrderProjectLinkProps {
  workOrderId: string;
  onLinkComplete?: () => void;
}

const WorkOrderProjectLink: React.FC<WorkOrderProjectLinkProps> = ({ 
  workOrderId,
  onLinkComplete
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<string | null>(null);
  const [existingLink, setExistingLink] = useState<WorkOrderLinkDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const { linkWorkOrderToProject, importWorkOrderCosts, isLoading } = useBudgetIntegration();

  // Fetch existing link if any
  useEffect(() => {
    const fetchExistingLink = async () => {
      setLoading(true);
      try {
        // Instead of querying the table directly, we'll use a custom RPC function
        // that's added to the database to avoid type issues
        const { data, error } = await supabase
          .rpc('get_work_order_project_link', { work_order_id: workOrderId });
        
        if (error && error.message !== 'No rows returned') {
          console.error('Error fetching work order link:', error);
        }
        
        if (data) {
          setExistingLink({
            project_id: data.project_id,
            budget_item_id: data.budget_item_id
          });
          setSelectedProject(data.project_id);
          setSelectedBudgetItem(data.budget_item_id);
        }
        
        // Also check if the work order has a project_id directly
        const { data: workOrder, error: woError } = await supabase
          .from('maintenance_work_orders')
          .select('project_id')
          .eq('work_order_id', workOrderId)
          .single();
        
        if (woError && woError.message !== 'No rows returned') {
          console.error('Error fetching work order:', woError);
        }
        
        if (workOrder?.project_id && !selectedProject) {
          setSelectedProject(workOrder.project_id);
        }
      } catch (error) {
        console.error('Error in fetchExistingLink:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExistingLink();
  }, [workOrderId, selectedProject]);

  // Fetch list of active projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('projectid, projectname')
          .in('status', ['active', 'in_progress', 'on_track'])
          .order('createdon', { ascending: false });
        
        if (error) throw error;
        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive'
        });
      }
    };
    
    fetchProjects();
  }, []);

  // Fetch budget items when a project is selected
  useEffect(() => {
    const fetchBudgetItems = async () => {
      if (!selectedProject) {
        setBudgetItems([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('project_budget_items')
          .select('id, category, description')
          .eq('project_id', selectedProject)
          .order('category', { ascending: true });
        
        if (error) throw error;
        setBudgetItems(data || []);
      } catch (error) {
        console.error('Error fetching budget items:', error);
        toast({
          title: 'Error',
          description: 'Failed to load budget items. Please try again.',
          variant: 'destructive'
        });
      }
    };
    
    fetchBudgetItems();
  }, [selectedProject]);

  const handleLinkProject = async () => {
    if (!selectedProject) {
      toast({
        title: 'Selection Required',
        description: 'Please select a project to link this work order to.',
        variant: 'destructive'
      });
      return;
    }
    
    const success = await linkWorkOrderToProject(
      workOrderId, 
      selectedProject, 
      selectedBudgetItem || undefined
    );
    
    if (success && onLinkComplete) {
      onLinkComplete();
    }
  };

  const handleImportCosts = async () => {
    if (!selectedProject) {
      toast({
        title: 'Selection Required',
        description: 'Please select a project to import costs to.',
        variant: 'destructive'
      });
      return;
    }
    
    const success = await importWorkOrderCosts(workOrderId, selectedProject);
    
    if (success && onLinkComplete) {
      onLinkComplete();
    }
  };

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Link2 className="mr-2 h-5 w-5 text-muted-foreground" />
          Link to Project Budget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {existingLink && (
          <div className="bg-blue-50 p-3 rounded-md text-sm flex items-start mb-4">
            <FileDigit className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700">This work order is linked to a project</p>
              <p className="text-blue-600">Changes here will update the existing link</p>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <Select 
            value={selectedProject || undefined} 
            onValueChange={setSelectedProject}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.projectid} value={project.projectid}>
                  {project.projectname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedProject && budgetItems.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget Category (Optional)</label>
            <Select 
              value={selectedBudgetItem || undefined} 
              onValueChange={setSelectedBudgetItem}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a budget category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (General)</SelectItem>
                {budgetItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.category}: {item.description.substring(0, 30)}{item.description.length > 30 ? '...' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {selectedProject && budgetItems.length === 0 && (
          <div className="bg-amber-50 p-3 rounded-md text-sm flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700">No budget items found</p>
              <p className="text-amber-600">This project has no budget items defined. The work order will be linked to the project but not to a specific budget category.</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleLinkProject}
          disabled={isLoading || !selectedProject}
        >
          <Link2 className="mr-2 h-4 w-4" />
          {existingLink ? 'Update Link' : 'Link to Project'}
        </Button>
        
        <Button 
          variant="default"
          className="bg-[#0485ea] hover:bg-[#0375d1]"
          onClick={handleImportCosts}
          disabled={isLoading || !selectedProject}
        >
          <FileDigit className="mr-2 h-4 w-4" />
          Import Costs to Budget
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkOrderProjectLink;
