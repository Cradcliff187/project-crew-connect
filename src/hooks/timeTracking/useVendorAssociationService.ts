
import { supabase } from '@/integrations/supabase/client';

type VendorAssociationMetadata = {
  expenseType?: string | null;
  amount?: number;
};

export function useVendorAssociationService() {
  const createVendorAssociation = async (
    vendorId: string,
    entityType: string,
    entityId: string,
    documentId: string,
    metadata: VendorAssociationMetadata
  ) => {
    try {
      const { error: vendorAssocError } = await supabase
        .from('vendor_associations')
        .upsert({
          vendor_id: vendorId,
          entity_type: entityType,
          entity_id: entityId,
          description: `Associated via time entry receipt`,
          amount: metadata.amount || null,
          expense_type: metadata.expenseType || null,
          document_id: documentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (vendorAssocError) {
        console.error('Error creating vendor association:', vendorAssocError);
      }
    } catch (error) {
      console.error('Error in vendor association:', error);
    }
  };

  return {
    createVendorAssociation
  };
}
