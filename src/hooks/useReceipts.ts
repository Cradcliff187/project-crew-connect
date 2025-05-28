import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Receipt, ReceiptFormData, UseReceiptsReturn } from '@/types/role-based-types';

export const useReceipts = (): UseReceiptsReturn => {
  const { user, employeeId } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch receipts for current user
  const fetchReceipts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!employeeId) {
        setReceipts([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('receipts')
        .select(
          `
          *,
          projects!receipts_project_id_fkey (
            projectid,
            projectname
          ),
          maintenance_work_orders!receipts_work_order_id_fkey (
            work_order_id,
            title
          )
        `
        )
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReceipts(data || []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch receipts'));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  // Upload file to Supabase Storage
  const uploadReceiptFile = async (file: File, receiptId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${receiptId}.${fileExt}`;
    const filePath = `receipts/${employeeId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) throw uploadError;

    return filePath;
  };

  // Process OCR using Google Vision API
  const processOCR = async (filePath: string): Promise<any> => {
    try {
      // Get signed URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);

      if (!urlData?.signedUrl) {
        throw new Error('Failed to get signed URL for OCR processing');
      }

      // Call the backend OCR endpoint with the image URL
      const response = await fetch('/api/ocr/process-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          imageUrl: urlData.signedUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'OCR processing failed');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'OCR processing failed');
      }

      console.log('OCR processing successful:', result.data);
      return result.data;
    } catch (err) {
      console.error('OCR processing error:', err);

      // Fallback to mock data if OCR fails
      console.log('Falling back to mock OCR data');
      return {
        text:
          'RECEIPT\nOCR processing failed - using fallback data\nDate: ' +
          new Date().toISOString().split('T')[0] +
          '\nTotal: $0.00',
        confidence: 0.1,
        extracted_data: {
          merchant: 'Unknown Merchant',
          total: 0.0,
          tax: 0.0,
          date: new Date().toISOString().split('T')[0],
          items: [],
        },
        error: err.message,
      };
    }
  };

  // Upload receipt with OCR processing
  const uploadReceipt = async (data: ReceiptFormData): Promise<Receipt> => {
    try {
      if (!employeeId) throw new Error('Employee ID not found');

      // Generate receipt ID
      const receiptId = crypto.randomUUID();

      // Upload file to storage
      const storagePath = await uploadReceiptFile(data.file, receiptId);

      // Process OCR
      const ocrResult = await processOCR(storagePath);

      // Extract data from OCR or use manual input
      const extractedAmount = ocrResult.extracted_data?.total || data.amount;
      const extractedMerchant = ocrResult.extracted_data?.merchant || data.merchant;
      const extractedTax = ocrResult.extracted_data?.tax || data.tax;
      const extractedDate =
        ocrResult.extracted_data?.date || data.receipt_date.toISOString().split('T')[0];

      // Create receipt record
      const receiptData = {
        id: receiptId,
        employee_id: employeeId,
        project_id: data.project_id || null,
        work_order_id: data.work_order_id || null,
        amount: extractedAmount,
        merchant: extractedMerchant,
        tax: extractedTax,
        currency: 'USD',
        receipt_date: extractedDate,
        ocr_raw: ocrResult,
        ocr_confidence: ocrResult.confidence,
        ocr_processed_at: new Date().toISOString(),
        storage_path: storagePath,
        file_name: data.file.name,
        file_size: data.file.size,
        mime_type: data.file.type,
        created_by: employeeId,
      };

      const { data: newReceipt, error: insertError } = await supabase
        .from('receipts')
        .insert(receiptData)
        .select()
        .single();

      if (insertError) throw insertError;

      await fetchReceipts();
      return newReceipt;
    } catch (err) {
      console.error('Error uploading receipt:', err);
      throw err instanceof Error ? err : new Error('Failed to upload receipt');
    }
  };

  // Delete receipt
  const deleteReceipt = async (id: string): Promise<void> => {
    try {
      // Get receipt details for file cleanup
      const { data: receipt, error: fetchError } = await supabase
        .from('receipts')
        .select('storage_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      if (receipt?.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([receipt.storage_path]);

        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase.from('receipts').delete().eq('id', id);

      if (deleteError) throw deleteError;

      await fetchReceipts();
    } catch (err) {
      console.error('Error deleting receipt:', err);
      throw err instanceof Error ? err : new Error('Failed to delete receipt');
    }
  };

  // Update receipt
  const updateReceipt = async (id: string, updates: Partial<Receipt>): Promise<void> => {
    try {
      const { error: updateError } = await supabase.from('receipts').update(updates).eq('id', id);

      if (updateError) throw updateError;

      await fetchReceipts();
    } catch (err) {
      console.error('Error updating receipt:', err);
      throw err instanceof Error ? err : new Error('Failed to update receipt');
    }
  };

  // Get receipt URL for viewing
  const getReceiptUrl = async (storagePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage.from('documents').createSignedUrl(storagePath, 3600);

      return data?.signedUrl || null;
    } catch (err) {
      console.error('Error getting receipt URL:', err);
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    if (user && employeeId) {
      fetchReceipts();
    }
  }, [user, employeeId, fetchReceipts]);

  return {
    receipts,
    isLoading,
    error,
    uploadReceipt,
    deleteReceipt,
    updateReceipt: updateReceipt,
    getReceiptUrl,
    refetch: fetchReceipts,
  };
};
