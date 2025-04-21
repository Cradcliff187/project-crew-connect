import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryFormValues, Entity, EntityDetails } from '@/types/timeTracking';
import { Employee } from '@/types/common';
import { toast } from '@/hooks/use-toast';
import { useEmployees } from '@/hooks/useEmployees';

export const useEntityData = (form: UseFormReturn<TimeEntryFormValues | any>) => {
  const [workOrders, setWorkOrders] = useState<Entity[]>([]);
  const [projects, setProjects] = useState<Entity[]>([]);
  const [isLoadingWOsProjects, setIsLoadingWOsProjects] = useState(true);

  const { employees, isLoadingEmployees } = useEmployees();

  const entityType = form.watch('entityType');
  const entityId = form.watch('entityId');

  useEffect(() => {
    const fetchWorkOrdersAndProjects = async () => {
      setIsLoadingWOsProjects(true);
      try {
        // Fetch work orders
        const { data: woData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title')
          .order('created_at', { ascending: false });

        if (workOrdersError) {
          throw workOrdersError;
        }

        if (woData) {
          setWorkOrders(
            woData.map(wo => ({
              id: wo.work_order_id,
              name: wo.title || `Work Order ${wo.work_order_id.substring(0, 8)}`,
            }))
          );
        } else {
          setWorkOrders([]);
        }

        // Fetch projects
        const { data: projData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, status')
          .order('created_at', { ascending: false });

        if (projectsError) {
          throw projectsError;
        }

        if (projData) {
          setProjects(
            projData.map(p => ({
              id: p.projectid,
              name: p.projectname || p.projectid,
              status: p.status,
            }))
          );
        } else {
          setProjects([]);
        }
      } catch (error: any) {
        toast({
          title: 'Failed to load work orders/projects',
          description: error.message || 'Please try again or contact support',
          variant: 'destructive',
        });
        setWorkOrders([]);
        setProjects([]);
      } finally {
        setIsLoadingWOsProjects(false);
      }
    };

    fetchWorkOrdersAndProjects();
  }, []);

  const getSelectedEntityDetails = (): EntityDetails | null => {
    if (!entityId) return null;

    if (entityType === 'work_order') {
      const selectedWorkOrder = workOrders.find(wo => wo.id === entityId);
      if (selectedWorkOrder) {
        return {
          name: selectedWorkOrder.name,
          type: 'work_order',
        };
      }
    } else if (entityType === 'project') {
      const selectedProject = projects.find(p => p.id === entityId);
      if (selectedProject) {
        return {
          name: selectedProject.name,
          type: 'project',
        };
      }
    }

    return null;
  };

  const combinedIsLoading = isLoadingWOsProjects || isLoadingEmployees;

  return {
    workOrders,
    projects,
    employees,
    isLoadingEntities: combinedIsLoading,
    getSelectedEntityDetails,
  };
};
