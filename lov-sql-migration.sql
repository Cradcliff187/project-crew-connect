
-- Create a table to link work orders to projects and budget items
CREATE TABLE IF NOT EXISTS public.work_order_project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.maintenance_work_orders(work_order_id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects(projectid) ON DELETE CASCADE,
  budget_item_id UUID REFERENCES public.project_budget_items(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS work_order_project_links_work_order_id_idx ON public.work_order_project_links(work_order_id);
CREATE INDEX IF NOT EXISTS work_order_project_links_project_id_idx ON public.work_order_project_links(project_id);

-- Add project_id column to maintenance_work_orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'maintenance_work_orders' 
    AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.maintenance_work_orders 
    ADD COLUMN project_id TEXT REFERENCES public.projects(projectid) ON DELETE SET NULL;
  END IF;
END
$$;

-- Update updated_at trigger
CREATE TRIGGER update_work_order_project_links_updated_at
  BEFORE UPDATE ON public.work_order_project_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
