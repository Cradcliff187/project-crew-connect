
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Function to execute custom SQL scripts from the database
export const executeDbValidation = async (
  functionName: string,
  params: Record<string, any> = {}
) => {
  try {
    // List of valid function names that can be called
    const validFunctions = [
      'attach_document_to_time_entry',
      'calculate_vendor_score',
      'convert_estimate_to_project',
      'convertestimateitemstobudgetitems',
      'generate_change_order_number',
      'generate_customer_id',
      'generate_estimate_id',
      'generate_project_id',
      'generate_subcontractor_id',
      'generate_vendor_id',
      'get_document_count_by_entity',
      'get_document_url',
      'get_entity_documents',
      'get_estimate_total',
      'get_project_document_count',
      'get_project_progress',
      'normalize_entity_type',
      'update_change_order_status',
      'update_project_status',
      'update_subcontractor_status',
      'update_vendor_status',
      'validate_entity_status_transition',
      'validate_work_order_status_transition'
    ] as const;

    // Type guard to ensure functionName is valid
    if (!validFunctions.includes(functionName as any)) {
      throw new Error(`Invalid function name: ${functionName}`);
    }

    // Call the stored procedure
    const { data, error } = await supabase.rpc(
      functionName as any,
      params
    );

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error(`Error executing ${functionName}:`, error);
    toast({
      title: 'Database Error',
      description: error.message || 'An error occurred while executing database validation',
      variant: 'destructive',
    });
    return null;
  }
};

// Sample function to get document count by entity type
export const getDocumentCountByEntity = async (entityType: string, entityId: string) => {
  return executeDbValidation('get_document_count_by_entity', {
    p_entity_type: entityType,
    p_entity_id: entityId,
  });
};

// Sample function to get all entity documents
export const getEntityDocuments = async (entityType: string, entityId: string) => {
  return executeDbValidation('get_entity_documents', {
    p_entity_type: entityType,
    p_entity_id: entityId,
  });
};

// Generate utilities to test validators
export const testValidators = async () => {
  const testFunctions = [
    { name: 'validate_entity_status_transition', params: { p_entity_type: 'PROJECT', p_current_status: 'draft', p_new_status: 'active' } },
    { name: 'get_document_count_by_entity', params: { p_entity_type: 'PROJECT', p_entity_id: 'test-project-1' } },
  ];

  const results: Record<string, any> = {};

  for (const func of testFunctions) {
    results[func.name] = await executeDbValidation(func.name, func.params);
  }

  return results;
};
