
import { useState } from 'react';
import { TimeEntry } from '@/types/timeTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useReceiptManager() {
  // State for receipt upload dialog
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
  
  // State for viewing receipt
  const [viewingReceipt, setViewingReceipt] = useState(false);
  const [receiptDocument, setReceiptDocument] = useState<{
    url: string;
    fileName: string;
    fileType: string;
  } | null>(null);
  
  // Handle receipt button click
  const handleReceiptClick = async (timeEntry: TimeEntry) => {
    console.log("Receipt button clicked for time entry:", timeEntry);
    setSelectedTimeEntry(timeEntry);
    
    // Check if time entry has a receipt
    if (timeEntry.has_receipts) {
      // Fetch receipt document data
      try {
        const { data, error } = await supabase
          .from('time_entry_receipts')
          .select('file_name, file_type, storage_path')
          .eq('time_entry_id', timeEntry.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Generate public URL
          const { data: urlData } = supabase.storage
            .from('construction_documents')
            .getPublicUrl(data.storage_path);
          
          setReceiptDocument({
            url: urlData.publicUrl,
            fileName: data.file_name,
            fileType: data.file_type
          });
          
          setViewingReceipt(true);
        }
      } catch (error) {
        console.error("Error fetching receipt document:", error);
        toast({
          title: "Error",
          description: "Failed to load receipt document",
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
    selectedTimeEntry,
    setSelectedTimeEntry,
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleReceiptClick,
    handleCloseReceiptViewer
  };
}
