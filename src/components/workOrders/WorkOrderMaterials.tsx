
import { AddMaterialForm, MaterialsTable } from './materials';
import { useMaterials, useVendors } from './materials/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { MaterialReceiptUpload, ReceiptConfirmationDialog } from './materials/components';
import { WorkOrderMaterial } from '@/types/workOrder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface WorkOrderMaterialsProps {
  workOrderId: string;
  onMaterialAdded?: () => void;
}

const WorkOrderMaterials = ({ workOrderId, onMaterialAdded }: WorkOrderMaterialsProps) => {
  const { 
    materials, 
    loading, 
    submitting, 
    error,
    totalMaterialsCost,
    handleAddMaterial, 
    handleDelete,
    handleReceiptUploaded,
    fetchMaterials
  } = useMaterials(workOrderId);
  
  const { vendors, loading: vendorsLoading, error: vendorsError, fetchVendors } = useVendors();
  
  // State for receipt confirmation dialog
  const [showReceiptConfirmation, setShowReceiptConfirmation] = useState(false);
  const [pendingMaterial, setPendingMaterial] = useState<{
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  } | null>(null);

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
  
  // Handle material added
  const handleMaterialAdded = () => {
    // Refresh materials list
    fetchMaterials();

    // Notify parent component if provided
    if (onMaterialAdded) {
      onMaterialAdded();
    }
  };
  
  // Handle vendor added
  const handleVendorAdded = () => {
    // Refresh vendors list
    fetchVendors();
  };
  
  // Handle prompt for receipt upload
  const handlePromptForReceipt = (material: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  }) => {
    setPendingMaterial(material);
    setShowReceiptConfirmation(true);
  };
  
  // Handle confirmation to add material with receipt
  const handleConfirmWithReceipt = async () => {
    if (!pendingMaterial) return;
    
    try {
      console.log("Adding material and then showing receipt upload dialog");
      // Create the material
      const newMaterial = await handleAddMaterial(pendingMaterial);
      
      // Show the receipt upload dialog for the new material
      if (newMaterial) {
        setSelectedMaterial(newMaterial);
        setShowReceiptUpload(true);
        console.log("Setting showReceiptUpload to true, selectedMaterial:", newMaterial);
      } else {
        console.log("No material returned from handleAddMaterial");
      }
      
      // Close the confirmation dialog
      setShowReceiptConfirmation(false);
      setPendingMaterial(null);
      
      // Refresh the materials list
      handleMaterialAdded();
    } catch (error) {
      console.error("Error in handleConfirmWithReceipt:", error);
    }
  };
  
  // Handle confirmation to add material without receipt
  const handleConfirmWithoutReceipt = async () => {
    if (!pendingMaterial) return;
    
    try {
      await handleAddMaterial(pendingMaterial);
      
      // Close the confirmation dialog
      setShowReceiptConfirmation(false);
      setPendingMaterial(null);
      
      // Refresh the materials list
      handleMaterialAdded();
    } catch (error) {
      console.error("Error in handleConfirmWithoutReceipt:", error);
    }
  };
  
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
      }
    } else {
      // Show upload dialog for new receipt
      setShowReceiptUpload(true);
    }
  };
  
  // Handle receipt uploaded
  const handleReceiptAttached = async (materialId: string, documentId: string) => {
    console.log("Receipt attached. Material ID:", materialId, "Document ID:", documentId);
    await handleReceiptUploaded(materialId, documentId);
    setShowReceiptUpload(false);
    
    // Refresh the materials list
    handleMaterialAdded();
  };
  
  // Find vendor name by ID
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return "";
    const vendor = vendors.find(v => v.vendorid === vendorId);
    return vendor ? vendor.vendorname : "Unknown Vendor";
  };
  
  // Close receipt viewer
  const handleCloseReceiptViewer = () => {
    setViewingReceipt(false);
    setReceiptDocument(null);
  };
  
  return (
    <div className="space-y-6">
      {(error || vendorsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || vendorsError}. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      )}
      
      <AddMaterialForm 
        vendors={vendors}
        onSubmit={handlePromptForReceipt}
        submitting={submitting}
        onVendorAdded={handleVendorAdded}
      />
      
      <MaterialsTable 
        materials={materials}
        loading={loading}
        vendors={vendors}
        onDelete={handleDelete}
        totalCost={totalMaterialsCost}
        workOrderId={workOrderId}
        onReceiptUploaded={handleReceiptAttached}
        onReceiptClick={handleReceiptClick}
      />
      
      {/* Receipt Confirmation Dialog */}
      <ReceiptConfirmationDialog
        open={showReceiptConfirmation}
        onOpenChange={setShowReceiptConfirmation}
        materialData={pendingMaterial}
        vendorName={pendingMaterial?.vendorId ? getVendorName(pendingMaterial.vendorId) : ""}
        onConfirmWithReceipt={handleConfirmWithReceipt}
        onConfirmWithoutReceipt={handleConfirmWithoutReceipt}
      />
      
      {/* Material Receipt Upload Dialog */}
      {selectedMaterial && showReceiptUpload && (
        <div className="fixed inset-0 bg-black/50 z-40">
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Upload Receipt</h3>
            <MaterialReceiptUpload
              workOrderId={workOrderId}
              material={selectedMaterial}
              vendorName={getVendorName(selectedMaterial.vendor_id)}
              onSuccess={(documentId) => handleReceiptAttached(selectedMaterial.id, documentId)}
              onCancel={() => setShowReceiptUpload(false)}
            />
          </div>
        </div>
      )}
      
      {/* Receipt Viewer Dialog */}
      <Dialog open={viewingReceipt} onOpenChange={(open) => !open && handleCloseReceiptViewer()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Receipt: {receiptDocument?.fileName}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-md overflow-hidden h-[400px]">
              {receiptDocument?.fileType?.startsWith('image/') ? (
                <img
                  src={receiptDocument.url}
                  alt={receiptDocument.fileName}
                  className="w-full h-full object-contain"
                />
              ) : receiptDocument?.fileType?.includes('pdf') ? (
                <iframe
                  src={receiptDocument.url}
                  title={receiptDocument.fileName}
                  className="w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <p>Preview not available</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleCloseReceiptViewer}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrderMaterials;
