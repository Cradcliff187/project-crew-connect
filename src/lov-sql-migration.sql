
-- Drop the existing function first
DROP FUNCTION IF EXISTS public.copy_estimate_items_to_revision();

-- Create an improved version that properly handles item copying
CREATE OR REPLACE FUNCTION public.copy_estimate_items_to_revision()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    prev_revision_id UUID;
    item_record RECORD;
BEGIN
    -- Set new revision as current
    IF NEW.is_current = true THEN
        -- Find other current revisions and mark them as not current
        UPDATE estimate_revisions
        SET is_current = false
        WHERE estimate_id = NEW.estimate_id
          AND id != NEW.id
          AND is_current = true;
          
        -- Find the previous revision with items to copy
        SELECT id INTO prev_revision_id
        FROM estimate_revisions
        WHERE estimate_id = NEW.estimate_id
          AND id != NEW.id
        ORDER BY version DESC
        LIMIT 1;
        
        -- If previous revision exists, copy its items to the new revision
        IF prev_revision_id IS NOT NULL THEN
            -- Log the copy operation
            RAISE NOTICE 'Copying items from revision % to new revision %', prev_revision_id, NEW.id;
            
            -- Copy each item with a new ID but preserve all other properties
            FOR item_record IN 
                SELECT * FROM estimate_items 
                WHERE revision_id = prev_revision_id
            LOOP
                INSERT INTO estimate_items (
                    estimate_id, description, quantity, unit_price, total_price,
                    cost, markup_percentage, markup_amount, gross_margin, 
                    gross_margin_percentage, vendor_id, subcontractor_id, 
                    item_type, document_id, notes, revision_id, created_at, updated_at,
                    original_item_id
                ) VALUES (
                    NEW.estimate_id, 
                    item_record.description, 
                    item_record.quantity, 
                    item_record.unit_price, 
                    item_record.total_price, 
                    item_record.cost, 
                    item_record.markup_percentage, 
                    item_record.markup_amount, 
                    item_record.gross_margin, 
                    item_record.gross_margin_percentage,
                    item_record.vendor_id, 
                    item_record.subcontractor_id, 
                    item_record.item_type, 
                    item_record.document_id, 
                    item_record.notes, 
                    NEW.id,
                    now(),
                    now(),
                    item_record.id
                );
            END LOOP;
            
            -- Also copy estimate_documents associations
            RAISE NOTICE 'Copied items from revision % to new revision %', prev_revision_id, NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Make sure the trigger is properly attached
DROP TRIGGER IF EXISTS copy_estimate_items_to_revision ON public.estimate_revisions;
CREATE TRIGGER copy_estimate_items_to_revision
AFTER INSERT ON public.estimate_revisions
FOR EACH ROW
EXECUTE FUNCTION public.copy_estimate_items_to_revision();
