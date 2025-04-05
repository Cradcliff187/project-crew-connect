
import React from 'react';
import { useFormContext } from 'react-hook-form';
import BasicInfoStep from './BasicInfoStep';
import LineItemsStep from './LineItemsStep';
import DocumentsStep from './DocumentsStep';
import ReviewStep from './ReviewStep';
import SummaryStep from './SummaryStep';

interface EstimateStepContentProps {
  currentStep: string;
  customerTab: 'existing' | 'new';
  onNewCustomer: () => void;
  onExistingCustomer: () => void;
  selectedCustomerAddress: string | null;
  selectedCustomerName: string | null;
  selectedCustomerId?: string | null; // Add this prop
  customers: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  }[];
  loading: boolean;
}

const EstimateStepContent: React.FC<EstimateStepContentProps> = ({
  currentStep,
  customerTab,
  onNewCustomer,
  onExistingCustomer,
  selectedCustomerAddress,
  selectedCustomerName,
  selectedCustomerId, // Add this prop
  customers,
  loading,
}) => {
  const { watch } = useFormContext();
  const formData = watch();

  switch (currentStep) {
    case 'basic-info':
      return (
        <BasicInfoStep
          customerTab={customerTab}
          onNewCustomer={onNewCustomer}
          onExistingCustomer={onExistingCustomer}
          customers={customers}
          loading={loading}
          selectedCustomerAddress={selectedCustomerAddress}
        />
      );
    case 'line-items':
      return <LineItemsStep />;
    case 'documents':
      return <DocumentsStep />;
    case 'summary':
      return <SummaryStep />;
    case 'review':
      return (
        <ReviewStep
          formData={formData}
          selectedCustomerName={selectedCustomerName}
          selectedCustomerAddress={selectedCustomerAddress}
          selectedCustomerId={selectedCustomerId} // Pass the customer ID
        />
      );
    default:
      return <div>Unknown step</div>;
  }
};

export default EstimateStepContent;
