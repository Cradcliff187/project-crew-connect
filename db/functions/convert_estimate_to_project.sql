-- First, drop the existing function to ensure clean install
DROP FUNCTION IF EXISTS convert_estimate_to_project;

-- Create convert_estimate_to_project function with proper structure
CREATE OR REPLACE FUNCTION convert_estimate_to_project(p_estimate_id TEXT)
RETURNS TEXT AS $$
DECLARE
  v_estimate RECORD;
  v_current_revision RECORD;
  v_project_id TEXT;
  v_document RECORD;
  v_item RECORD;
  v_creation_date TIMESTAMP WITH TIME ZONE;
  v_descriptions TEXT[];
  v_existing_desc TEXT;
  v_is_duplicate BOOLEAN;
BEGIN
  -- Get the estimate
  SELECT * INTO v_estimate FROM estimates WHERE estimateid = p_estimate_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate not found';
  END IF;

  -- Check if already converted
  IF v_estimate.projectid IS NOT NULL THEN
    RAISE EXCEPTION 'Estimate already converted to project %', v_estimate.projectid;
  END IF;

  -- Store creation date - use estimate creation date if available, otherwise current time
  v_creation_date := COALESCE(v_estimate.datecreated, NOW());

  -- Get the current revision
  SELECT er.* INTO v_current_revision
  FROM estimate_revisions er
  WHERE er.estimate_id = p_estimate_id AND er.is_selected_for_view = true;

  -- Create project
  INSERT INTO projects (
    customerid,
    projectname,
    description,
    status,
    site_address,
    site_city,
    site_state,
    site_zip,
    created_at,  -- Use the stored creation date
    total_budget
  ) VALUES (
    v_estimate.customerid,
    COALESCE(v_estimate.projectname, 'Project from estimate ' || p_estimate_id),
    COALESCE(v_estimate."job description", 'Converted from estimate ' || p_estimate_id),
    'active',
    v_estimate.sitelocationaddress,
    v_estimate.sitelocationcity,
    v_estimate.sitelocationstate,
    v_estimate.sitelocationzip,
    v_creation_date,  -- Use the stored creation date
    v_estimate.estimateamount
  ) RETURNING projectid INTO v_project_id;

  -- Initialize an array to track descriptions, for duplicate detection
  v_descriptions := ARRAY[]::TEXT[];

  -- Create budget items from current revision with correct column mapping
  -- and store their IDs for document transfer, while deduplicating by description
  FOR v_item IN
    -- Select items and order by ID to ensure consistent deduplication
    SELECT DISTINCT ON (description, item_type, total_price) *
    FROM estimate_items
    WHERE revision_id = v_current_revision.id
    ORDER BY description, item_type, total_price, id
  LOOP
    -- Check if this is a duplicate
    v_is_duplicate := FALSE;
    FOREACH v_existing_desc IN ARRAY v_descriptions
    LOOP
      IF v_existing_desc = v_item.description THEN
        v_is_duplicate := TRUE;
        EXIT;
      END IF;
    END LOOP;

    -- Only process if not a duplicate
    IF NOT v_is_duplicate THEN
      -- Add this description to the array of processed descriptions
      v_descriptions := array_append(v_descriptions, v_item.description);

      -- Insert the budget item
      INSERT INTO project_budget_items (
        project_id,
        category,
        description,
        estimated_amount,
        estimate_item_origin_id, -- Store the original estimate item ID for reference
        created_at,
        updated_at,
        vendor_id,
        subcontractor_id
      )
      VALUES (
        v_project_id,
        v_item.item_type,
        v_item.description,
        v_item.total_price,
        v_item.id,
        v_creation_date,
        v_creation_date,
        v_item.vendor_id,
        v_item.subcontractor_id
      );

      -- If the estimate item has a document attached, transfer it
      IF v_item.document_id IS NOT NULL THEN
        -- Check if document exists
        SELECT * INTO v_document
        FROM documents
        WHERE document_id = v_item.document_id;

        IF FOUND THEN
          -- Create a project document linked to this document
          INSERT INTO documents (
            document_id,
            entity_type,
            entity_id,
            storage_path,
            file_name,
            file_type,
            file_size,
            category,
            notes,
            created_at,
            updated_at,
            vendor_id,
            vendor_type,
            expense_type
          ) VALUES (
            gen_random_uuid(),  -- Generate a new ID
            'PROJECT',
            v_project_id,
            v_document.storage_path,
            v_document.file_name,
            v_document.file_type,
            v_document.file_size,
            v_document.category,
            COALESCE(v_document.notes, '') || ' (Copied from Estimate Item)',
            v_creation_date,
            v_creation_date,
            v_document.vendor_id,
            v_document.vendor_type,
            v_document.expense_type
          );
        END IF;
      END IF;
    END IF;
  END LOOP;

  -- Transfer documents - copying from documents table where entity_type is ESTIMATE
  -- This aligns with how the application actually handles documents
  FOR v_document IN
    SELECT * FROM documents WHERE entity_type = 'ESTIMATE' AND entity_id = p_estimate_id
  LOOP
    -- Create a project document based on estimate document
    INSERT INTO documents (
      document_id,
      entity_type,
      entity_id,
      storage_path,
      file_name,
      file_type,
      file_size,
      category,
      notes,
      created_at,
      updated_at,
      vendor_id,
      vendor_type,
      expense_type
    ) VALUES (
      gen_random_uuid(),  -- Generate a new ID rather than reusing
      'PROJECT',
      v_project_id,
      v_document.storage_path,
      v_document.file_name,
      v_document.file_type,
      v_document.file_size,
      v_document.category,
      COALESCE(v_document.notes, '') || ' (Copied from Estimate ' || p_estimate_id || ')',
      v_creation_date,
      v_creation_date,
      v_document.vendor_id,
      v_document.vendor_type,
      v_document.expense_type
    );
  END LOOP;

  -- Update estimate with project link and set to converted
  UPDATE estimates
  SET status = 'converted',
      projectid = v_project_id,
      converted_revision_id = v_current_revision.id
  WHERE estimateid = p_estimate_id;

  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;
