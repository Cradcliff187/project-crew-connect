
-- Add foreign key constraint between work_order_project_links and projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'work_order_project_links_project_id_fkey'
  ) THEN
    ALTER TABLE public.work_order_project_links 
    ADD CONSTRAINT work_order_project_links_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(projectid);
  END IF;
END $$;

-- Add foreign key constraint between work_order_project_links and maintenance_work_orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'work_order_project_links_work_order_id_fkey'
  ) THEN
    ALTER TABLE public.work_order_project_links 
    ADD CONSTRAINT work_order_project_links_work_order_id_fkey 
    FOREIGN KEY (work_order_id) REFERENCES public.maintenance_work_orders(work_order_id);
  END IF;
END $$;

-- Add indexes to improve query performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_change_orders_entity_type_entity_id'
  ) THEN
    CREATE INDEX idx_change_orders_entity_type_entity_id ON public.change_orders(entity_type, entity_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_work_order_project_links_work_order_id'
  ) THEN
    CREATE INDEX idx_work_order_project_links_work_order_id ON public.work_order_project_links(work_order_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_work_order_project_links_project_id'
  ) THEN
    CREATE INDEX idx_work_order_project_links_project_id ON public.work_order_project_links(project_id);
  END IF;
END $$;

-- Create a function to update parent project when a change order impacts a work order
CREATE OR REPLACE FUNCTION public.propagate_change_order_impact()
RETURNS trigger AS $$
DECLARE
  linked_project_id TEXT;
BEGIN
  -- Only proceed for work order change orders that are approved or implemented
  IF NEW.entity_type = 'WORK_ORDER' AND (NEW.status = 'APPROVED' OR NEW.status = 'IMPLEMENTED') THEN
    -- Find if this work order is linked to a project
    SELECT project_id INTO linked_project_id
    FROM work_order_project_links
    WHERE work_order_id = NEW.entity_id::uuid;
    
    -- If there's a linked project, create a project change order record
    IF linked_project_id IS NOT NULL THEN
      -- Record in activity log
      INSERT INTO activitylog (
        logid,
        timestamp,
        action,
        moduletype,
        referenceid,
        status,
        detailsjson,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid()::text,
        now(),
        'Change Order Impact Propagation',
        'PROJECT',
        linked_project_id,
        'UPDATED',
        json_build_object(
          'change_order_id', NEW.id,
          'work_order_id', NEW.entity_id,
          'amount', NEW.total_amount,
          'impact_days', NEW.impact_days,
          'notes', 'Automatic update from work order change order'
        )::text,
        now(),
        now()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for change order impact propagation
DROP TRIGGER IF EXISTS change_order_impact_propagation_trigger ON public.change_orders;
CREATE TRIGGER change_order_impact_propagation_trigger
AFTER UPDATE OF status ON public.change_orders
FOR EACH ROW
EXECUTE FUNCTION public.propagate_change_order_impact();
