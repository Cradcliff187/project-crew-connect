import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Define the type for the RPC response
interface WorkOrderProjectLinkResponse {
  project_id: string;
  budget_item_id: string;
}

interface WorkOrderProjectLinkProps {
  workOrderId: string;
  onLinkComplete: () => void;
}

const WorkOrderProjectLink: React.FC<WorkOrderProjectLinkProps> = ({ workOrderId, onLinkComplete }) => {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [budgetItemId, setBudgetItemId] = useState<string | null>(null);
  const [hasLink, setHasLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    fetchProjectLink();
  }, [workOrderId]);
  
  const fetchProjectLink = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_work_order_project_link', { work_order_id: workOrderId }) as { 
          data: WorkOrderProjectLinkResponse[] | null, 
          error: any 
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
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('work_order_project_links').insert([
        {
          work_order_id: workOrderId,
          project_id: currentProjectId,
          budget_item_id: budgetItemId
        }
      ]);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Work order linked to project successfully!',
        duration: 3000
      });
      
      setHasLink(true);
      onLinkComplete();
    } catch (error: any) {
      console.error('Error linking work order to project:', error);
      toast({
        title: 'Error',
        description: 'Failed to link work order to project',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .rpc('link_work_order_to_project', {
          p_work_order_id: workOrderId,
          p_project_id: currentProjectId,
          p_budget_item_id: budgetItemId
        });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Work order link updated successfully!',
        duration: 3000
      });
      
      onLinkComplete();
    } catch (error: any) {
      console.error('Error updating work order link:', error);
      toast({
        title: 'Error',
        description: 'Failed to update work order link',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Link</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading project link...</p>
        ) : (
          <>
            {hasLink ? (
              <p className="text-sm text-muted-foreground">
                This work order is linked to project <span className="font-semibold">{currentProjectId}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                This work order is not currently linked to a project.
              </p>
            )}
            
            <div className="mt-4 space-y-2">
              <div>
                <label className="text-sm text-muted-foreground block">Project ID:</label>
                <Input
                  type="text"
                  value={currentProjectId || ''}
                  onChange={(e) => setCurrentProjectId(e.target.value)}
                  placeholder="Enter Project ID"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block">Budget Item ID:</label>
                <Input
                  type="text"
                  value={budgetItemId || ''}
                  onChange={(e) => setBudgetItemId(e.target.value)}
                  placeholder="Enter Budget Item ID"
                />
              </div>
            </div>
            
            <Button 
              className="mt-4 w-full bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={hasLink ? handleUpdate : handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : hasLink ? 'Update Link' : 'Create Link'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderProjectLink;
