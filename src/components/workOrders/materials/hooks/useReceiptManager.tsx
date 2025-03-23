
import { useState } from 'react';
import { WorkOrderMaterial } from '@/types/workOrder';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useReceiptManager() {
  // State for receipt upload dialog
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<WorkOrderMaterial | null>(null);
  
  // State for viewing receipt
  const [viewingReceipt, setViewingReceipt] = useState(false);
  const [receiptDocument, setReceiptDocument] = useState<{
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);
  
  // Handle receipt button click
  const handleReceiptClick = async (material: WorkOrderMaterial) => {
    console.log("Receipt button clicked for material:", material);
    setSelectedMaterial(material);
    
    // Check if material has a receipt
    if (material.receipt_document_id) {
      // Fetch receipt document data
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('file_name, file_type, storage_path')
          .eq('document_id', material.receipt_document_id)
          .single();
        
        if (error) {
          console.error('Error retrieving document data:', error);
          throw error;
        }
        
        console.log('Retrieved document data:', data);
        
        if (data) {
          // Generate signed URL for better security and access control
          // Use the correct bucket name - construction_documents
          const { data: urlData, error: urlError } = await supabase.storage
            .from('construction_documents')
            .createSignedUrl(data.storage_path, 300); // 5 minutes expiration
          
          if (urlError) {
            console.error('Error generating signed URL:', urlError);
            throw urlError;
          }
          
          console.log('Generated signed URL:', urlData);
          
          setReceiptDocument({
            url: urlData.signedUrl,
            fileName: data.file_name,
            fileType: data.file_type
          });
          
          setViewingReceipt(true);
        }
      } catch (error) {
        console.error("Error fetching receipt document:", error);
        toast({
          title: "Error",
          description: "Failed to load receipt document. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // Show upload dialog for new receipt
      setShowReceiptUpload(true);
    }
  };
  
  // Close receipt viewer
  const handleCloseReceiptViewer = () => {
    setViewingReceipt(false);
    setReceiptDocument(null);
  };
  
  return {
    showReceiptUpload,
    setShowReceiptUpload,
    selectedMaterial,
    setSelectedMaterial,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  };
}
