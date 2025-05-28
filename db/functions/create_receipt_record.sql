-- Create receipt record function for OCR and expense tracking
CREATE OR REPLACE FUNCTION create_receipt_record(
  p_employee_id uuid,
  p_amount numeric,
  p_merchant text,
  p_tax numeric,
  p_receipt_date date,
  p_expense_category_id text,
  p_cost_category_id text,
  p_description text,
  p_is_billable boolean,
  p_storage_path text,
  p_file_name text,
  p_file_size bigint,
  p_mime_type text,
  p_ocr_raw jsonb DEFAULT NULL,
  p_ocr_confidence numeric DEFAULT NULL,
  p_created_by uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_receipt_id uuid;
  v_expense_id uuid;
BEGIN
  -- Generate receipt ID
  v_receipt_id := gen_random_uuid();

  -- Insert receipt record
  INSERT INTO receipts (
    id,
    employee_id,
    amount,
    merchant,
    tax,
    currency,
    receipt_date,
    ocr_raw,
    ocr_confidence,
    ocr_processed_at,
    storage_path,
    file_name,
    file_size,
    mime_type,
    created_at,
    updated_at,
    created_by
  ) VALUES (
    v_receipt_id,
    p_employee_id,
    p_amount,
    p_merchant,
    p_tax,
    'USD',
    p_receipt_date,
    p_ocr_raw,
    p_ocr_confidence,
    CASE WHEN p_ocr_raw IS NOT NULL THEN now() ELSE NULL END,
    p_storage_path,
    p_file_name,
    p_file_size,
    p_mime_type,
    now(),
    now(),
    COALESCE(p_created_by, p_employee_id)
  );

  -- Create corresponding expense record
  INSERT INTO expenses (
    entity_id,
    entity_type,
    expense_type,
    description,
    amount,
    quantity,
    unit_price,
    expense_date,
    is_billable,
    expense_category_id,
    cost_category_id,
    receipt_id,
    created_at,
    updated_at
  ) VALUES (
    NULL, -- No specific entity for now
    'RECEIPT',
    'MATERIAL',
    COALESCE(p_description, 'Receipt from ' || COALESCE(p_merchant, 'Unknown')),
    p_amount,
    1,
    p_amount,
    p_receipt_date,
    p_is_billable,
    p_expense_category_id::uuid,
    p_cost_category_id::uuid,
    v_receipt_id,
    now(),
    now()
  ) RETURNING expense_id INTO v_expense_id;

  -- Return the receipt ID
  RETURN v_receipt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_receipt_record TO authenticated;
GRANT EXECUTE ON FUNCTION create_receipt_record TO anon;
