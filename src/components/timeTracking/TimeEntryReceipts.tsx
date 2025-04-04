
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, Upload, Loader2, Receipt, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Document {
  document_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  url: string;
  tags: string[];
  category: string;
  expense_type: string;
  vendor_id: string | null;
  vendor_name?: string;
  amount: number | null;
}

interface TimeEntryReceiptsProps {
  timeEntryId: string;
  onReceiptChange?: () => void;
}

const TimeEntryReceipts: React.FC<TimeEntryReceiptsProps> = ({ 
  timeEntryId,
  onReceiptChange
}) => {
  const [receipts, setReceipts] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Document | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (timeEntryId) {
      fetchReceipts();
    }
  }, [timeEntryId]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      // First get the document IDs linked to this time entry
      const { data: linkData, error: linkError } = await supabase
        .from('time_entry_document_links')
        .select('document_id')
        .eq('time_entry_id', timeEntryId);

      if (linkError) throw linkError;
      
      if (linkData && linkData.length > 0) {
        const documentIds = linkData.map(link => link.document_id);
        
        // Then get the documents with URLs
        const { data: documentsData, error: docError } = await supabase
          .from('documents_with_urls')
          .select('*')
          .in('document_id', documentIds);
          
        if (docError) throw docError;

        // For each document with a vendor_id, fetch the vendor name
        const docsWithVendorInfo = await Promise.all((documentsData || []).map(async (doc) => {
          if (doc.vendor_id) {
            // Check if it's in vendors table
            const { data: vendorData } = await supabase
              .from('vendors')
              .select('vendorname')
              .eq('vendorid', doc.vendor_id)
              .maybeSingle();
              
            if (vendorData) {
              return { ...doc, vendor_name: vendorData.vendorname };
            }
            
            // Check if it's in subcontractors table
            const { data: subData } = await supabase
              .from('subcontractors')
              .select('subname')
              .eq('subid', doc.vendor_id)
              .maybeSingle();
              
            if (subData) {
              return { ...doc, vendor_name: subData.subname };
            }
          }
          
          return doc;
        }));
        
        setReceipts(docsWithVendorInfo);
      } else {
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast({
        title: 'Error',
        description: 'Could not load receipts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (receipt: Document) => {
    // Direct download using URL
    if (receipt.url) {
      window.open(receipt.url, '_blank');
    } else {
      // Fallback to manual download if URL is not available
      try {
        const { data, error } = await supabase.storage
          .from('construction_documents')
          .download(receipt.storage_path);
          
        if (error) throw error;
        
        // Create download link
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = receipt.file_name;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading file:', error);
        toast({
          title: 'Download failed',
          description: 'Could not download the file',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedReceipt) return;
    
    setDeleting(true);
    try {
      // Delete the document link
      const { error: linkError } = await supabase
        .from('time_entry_document_links')
        .delete()
        .eq('time_entry_id', timeEntryId)
        .eq('document_id', selectedReceipt.document_id);
        
      if (linkError) throw linkError;
      
      // Delete the document itself
      const { error: docError } = await supabase
        .from('documents')
        .delete()
        .eq('document_id', selectedReceipt.document_id);
        
      if (docError) throw docError;
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('construction_documents')
        .remove([selectedReceipt.storage_path]);
        
      if (storageError) {
        console.error('Error removing file from storage:', storageError);
      }
      
      toast({
        title: 'Receipt deleted',
        description: 'The receipt has been removed',
      });
      
      // Update the has_receipts flag if this was the last receipt
      if (receipts.length === 1) {
        const { error: updateError } = await supabase
          .from('time_entries')
          .update({ has_receipts: false })
          .eq('id', timeEntryId);
          
        if (updateError) {
          console.error('Error updating time entry has_receipts flag:', updateError);
        }
      }
      
      // Refresh the receipts list
      fetchReceipts();
      
      // Call the onReceiptChange callback
      if (onReceiptChange) {
        onReceiptChange();
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast({
        title: 'Error',
        description: 'Could not delete the receipt',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedReceipt(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) {
      return <img 
        src={receipts.find(r => r.document_id === selectedReceipt?.document_id)?.url} 
        alt="Receipt" 
        className="w-full h-auto max-h-80 object-contain rounded-md" 
      />;
    }
    return <FileText className="h-12 w-12 text-[#0485ea]" />;
  };

  const formatExpenseType = (type: string) => {
    if (!type) return 'Unknown';
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-[#0485ea]" />
        <span className="ml-2">Loading receipts...</span>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-md">
        <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No receipts attached to this time entry.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {receipts.map((receipt) => (
          <Card key={receipt.document_id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-md truncate pr-4">{receipt.file_name}</CardTitle>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDownload(receipt)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedReceipt(receipt);
                      setShowDeleteConfirm(true);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex flex-col space-y-2">
                {receipt.amount && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Amount:</span>
                    <span className="ml-2">${receipt.amount.toFixed(2)}</span>
                  </div>
                )}
                
                {receipt.expense_type && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Type:</span>
                    <Badge variant="outline" className="ml-2">{formatExpenseType(receipt.expense_type)}</Badge>
                  </div>
                )}
                
                {receipt.vendor_name && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Vendor:</span>
                    <span className="ml-2 truncate">{receipt.vendor_name}</span>
                  </div>
                )}
                
                {receipt.tags && receipt.tags.length > 0 && (
                  <div className="flex items-center text-sm flex-wrap">
                    <span className="font-medium mr-2">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {receipt.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-xs"
                  onClick={() => {
                    setSelectedReceipt(receipt);
                  }}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  View Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Receipt Viewer Dialog */}
      {selectedReceipt && (
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedReceipt.file_name}</DialogTitle>
            </DialogHeader>
            <div className="py-4 flex flex-col items-center justify-center">
              {selectedReceipt.file_type?.includes('image') ? (
                <img 
                  src={selectedReceipt.url} 
                  alt="Receipt" 
                  className="w-full h-auto max-h-80 object-contain rounded-md" 
                />
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-[#0485ea]" />
                  <p className="mt-2 text-sm">This file type cannot be previewed.</p>
                </div>
              )}
              
              <div className="w-full mt-4 space-y-2">
                {selectedReceipt.amount && (
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span>${selectedReceipt.amount.toFixed(2)}</span>
                  </div>
                )}
                
                {selectedReceipt.expense_type && (
                  <div className="flex justify-between">
                    <span className="font-medium">Expense Type:</span>
                    <Badge variant="outline">{formatExpenseType(selectedReceipt.expense_type)}</Badge>
                  </div>
                )}
                
                {selectedReceipt.vendor_name && (
                  <div className="flex justify-between">
                    <span className="font-medium">Vendor:</span>
                    <span>{selectedReceipt.vendor_name}</span>
                  </div>
                )}
                
                {selectedReceipt.tags && selectedReceipt.tags.length > 0 && (
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedReceipt.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedReceipt)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDeleteConfirm(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this receipt? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryReceipts;
