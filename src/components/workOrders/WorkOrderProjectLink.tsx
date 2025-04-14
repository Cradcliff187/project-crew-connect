import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Link } from 'lucide-react';

// Define the type for the RPC response
interface WorkOrderProjectLinkResponse {
  project_id: string;
  budget_item_id: string;
}

interface WorkOrderProjectLinkProps {
  workOrderId: string;
  onLinkComplete: () => void;
}

const WorkOrderProjectLink: React.FC<WorkOrderProjectLinkProps> = ({
  workOrderId,
  onLinkComplete,
}) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [budgetItemId, setBudgetItemId] = useState<string | null>(null);
  const [hasLink, setHasLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string }[]>([]);
  const [budgetItems, setBudgetItems] = useState<
    { id: string; description: string; category: string }[]
  >([]);
  const [loadingBudgetItems, setLoadingBudgetItems] = useState(false);

  useEffect(() => {
    fetchProjectLink();
    fetchAvailableProjects();
  }, [workOrderId]);

  // When project ID changes, fetch budget items
  useEffect(() => {
    if (currentProjectId) {
      fetchBudgetItems(currentProjectId);
    } else {
      setBudgetItems([]);
    }
  }, [currentProjectId]);

  const fetchProjectLink = async () => {
    setLoading(true);
    try {
      const { data, error } = (await supabase.rpc('get_work_order_project_link', {
        work_order_id: workOrderId,
      })) as {
        data: WorkOrderProjectLinkResponse[] | null;
        error: any;
      };

      if (error) throw error;

      if (data && data.length > 0) {
        const linkData = data[0]; // Access the first item in the array
        setCurrentProjectId(linkData.project_id);
        setBudgetItemId(linkData.budget_item_id);
        setHasLink(true);
      }
    } catch (error: any) {
      console.error('Error fetching project link:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project link information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('projectid, projectname')
        .order('projectname', { ascending: true });

      if (error) throw error;

      if (data) {
        setAvailableProjects(
          data.map(p => ({
            id: p.projectid,
            name: p.projectname || p.projectid,
          }))
        );
      }
    } catch (error: any) {
      console.error('Error fetching available projects:', error);
    }
  };

  const fetchBudgetItems = async (projectId: string) => {
    setLoadingBudgetItems(true);
    try {
      const { data, error } = await supabase
        .from('project_budget_items')
        .select('id, description, category')
        .eq('project_id', projectId);

      if (error) throw error;

      if (data) {
        setBudgetItems(data);
      }
    } catch (error: any) {
      console.error('Error fetching budget items:', error);
    } finally {
      setLoadingBudgetItems(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setCurrentProjectId(projectId);
    setBudgetItemId(null); // Reset budget item when project changes
  };

  const handleBudgetItemChange = (itemId: string) => {
    setBudgetItemId(itemId);
  };

  const handleSave = async () => {
    if (!currentProjectId) {
      toast({
        title: 'Error',
        description: 'Please select a project',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('work_order_project_links').insert([
        {
          work_order_id: workOrderId,
          project_id: currentProjectId,
          budget_item_id: budgetItemId,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Work order linked to project successfully!',
        duration: 3000,
      });

      setHasLink(true);
      onLinkComplete();
    } catch (error: any) {
      console.error('Error linking work order to project:', error);
      toast({
        title: 'Error',
        description: 'Failed to link work order to project',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentProjectId) {
      toast({
        title: 'Error',
        description: 'Please select a project',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('link_work_order_to_project', {
        p_work_order_id: workOrderId,
        p_project_id: currentProjectId,
        p_budget_item_id: budgetItemId,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Work order link updated successfully!',
        duration: 3000,
      });

      onLinkComplete();
    } catch (error: any) {
      console.error('Error updating work order link:', error);
      toast({
        title: 'Error',
        description: 'Failed to update work order link',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to get the project name
  const getProjectName = (projectId: string) => {
    const project = availableProjects.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  // Helper to get the budget item description
  const getBudgetItemDescription = (itemId: string) => {
    const item = budgetItems.find(i => i.id === itemId);
    return item ? `${item.category}: ${item.description}` : itemId;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Project Link</CardTitle>
        {hasLink && currentProjectId && <Link className="h-5 w-5 text-[#0485ea]" />}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <p>Loading project link...</p>
          </div>
        ) : (
          <>
            {hasLink ? (
              <div className="text-sm text-muted-foreground mb-4">
                <p>
                  This work order is linked to project{' '}
                  <span className="font-semibold text-foreground">
                    {getProjectName(currentProjectId || '')}
                  </span>
                </p>
                {budgetItemId && (
                  <p className="mt-1">
                    Budget Item:{' '}
                    <span className="font-semibold text-foreground">
                      {getBudgetItemDescription(budgetItemId)}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                This work order is not currently linked to a project. Linking to a project will
                allow change orders to propagate their impacts.
              </p>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Project:</label>
                <Select
                  value={currentProjectId || ''}
                  onValueChange={handleProjectChange}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentProjectId && (
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Budget Item:</label>
                  {loadingBudgetItems ? (
                    <div className="flex items-center text-sm">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading budget items...
                    </div>
                  ) : (
                    <Select
                      value={budgetItemId || ''}
                      onValueChange={handleBudgetItemChange}
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a budget item (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetItems.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.category}: {item.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            <Button
              className="mt-6 w-full bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={hasLink ? handleUpdate : handleSave}
              disabled={isSaving || !currentProjectId}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {hasLink ? 'Updating...' : 'Creating...'}
                </>
              ) : hasLink ? (
                'Update Link'
              ) : (
                'Create Link'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderProjectLink;
