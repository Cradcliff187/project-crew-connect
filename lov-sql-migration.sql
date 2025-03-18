
-- Add payment terms and notes fields to the subcontractors table
ALTER TABLE public.subcontractors 
ADD COLUMN payment_terms VARCHAR DEFAULT 'NET30',
ADD COLUMN notes TEXT;

-- Enhance the generate_subcontractor_id function to include better validation
CREATE OR REPLACE FUNCTION public.get_work_order_project_link(work_order_id UUID)
RETURNS TABLE (
  project_id TEXT,
  budget_item_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT wpl.project_id, wpl.budget_item_id
  FROM public.work_order_project_links wpl
  WHERE wpl.work_order_id = get_work_order_project_link.work_order_id;
END;
$$;

-- Function to link or update a work order to project
CREATE OR REPLACE FUNCTION public.link_work_order_to_project(
  p_work_order_id UUID,
  p_project_id TEXT,
  p_budget_item_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  existing_id UUID;
BEGIN
  -- Check if there's an existing link
  SELECT id INTO existing_id
  FROM public.work_order_project_links
  WHERE work_order_id = p_work_order_id;
  
  -- Update or insert as needed
  IF existing_id IS NOT NULL THEN
    -- Update existing link
    UPDATE public.work_order_project_links
    SET 
      project_id = p_project_id,
      budget_item_id = p_budget_item_id,
      updated_at = now()
    WHERE id = existing_id;
  ELSE
    -- Create new link
    INSERT INTO public.work_order_project_links (
      work_order_id,
      project_id,
      budget_item_id
    ) VALUES (
      p_work_order_id,
      p_project_id,
      p_budget_item_id
    );
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;
