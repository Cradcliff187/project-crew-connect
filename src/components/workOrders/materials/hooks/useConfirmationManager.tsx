import { useState } from 'react';

type MaterialData = {
  materialName: string;
  quantity: number;
  unitPrice: number;
  vendorId: string | null;
};

export function useConfirmationManager(
  handleAddMaterial: (material: MaterialData) => Promise<any>,
  handleReceiptUploaded: () => void,
  handleMaterialAdded: () => void
) {
  // State for receipt confirmation dialog
  const [showReceiptConfirmation, setShowReceiptConfirmation] = useState(false);
  const [pendingMaterial, setPendingMaterial] = useState<{
    materialName: string;
    quantity: number;
    unitPrice: number;
    vendorId: string | null;
  } | null>(null);

  // For setting up selected material
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

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
      console.log('Adding material and then showing receipt upload dialog');
      // Create the material
      const newMaterial = await handleAddMaterial(pendingMaterial);

      // Show the receipt upload dialog for the new material
      if (newMaterial) {
        setSelectedMaterial(newMaterial);
        return { showReceiptUpload: true, selectedMaterial: newMaterial };
      } else {
        console.log('No material returned from handleAddMaterial');
      }

      // Close the confirmation dialog
      setShowReceiptConfirmation(false);
      setPendingMaterial(null);

      // Refresh the materials list
      handleMaterialAdded();

      return { showReceiptUpload: false, selectedMaterial: null };
    } catch (error) {
      console.error('Error in handleConfirmWithReceipt:', error);
      return { showReceiptUpload: false, selectedMaterial: null };
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
      console.error('Error in handleConfirmWithoutReceipt:', error);
    }
  };

  return {
    showReceiptConfirmation,
    setShowReceiptConfirmation,
    pendingMaterial,
    handlePromptForReceipt,
    handleConfirmWithReceipt,
    handleConfirmWithoutReceipt,
  };
}
