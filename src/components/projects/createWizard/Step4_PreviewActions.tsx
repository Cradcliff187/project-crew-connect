import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// Import necessary types if showing summary data again
import { Step1FormValues } from './Step1_ProjectCustomerInfo';
// import { BudgetLineItemSummary } from './Step3_SummaryView'; // Can use type from Step 3 <-- Remove this
import { BudgetItemFormValues } from './Step2_BudgetLineItems'; // Import actual type

// Local placeholder type for Budget Item Summary <-- Remove local type
// type BudgetLineItemSummary = {
//   id: string;
//   category: string;
//   description: string;
//   estimated_amount: number;
// };

interface Step4Props {
  formData: Partial<Step1FormValues & { budgetItems: BudgetItemFormValues[] }>; // Use imported type
  onSubmit: () => void; // Trigger final submission
  onBack: () => void; // Go back to summary
  // Add wizardFormActions if needed for submit trigger
}

const Step4_PreviewActions: React.FC<Step4Props> = ({ formData, onSubmit, onBack }) => {
  // You might display a simplified summary or a full preview here
  // For now, just show action buttons and a confirmation message

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Final Preview & Create</h3>
      <p className="text-muted-foreground">
        Review the final details (optional preview area below) and create the project. Future
        functionality will allow sending project details via email.
      </p>

      {/* Optional: Display a more detailed preview component here */}
      <div className="p-6 border rounded-md min-h-[150px] flex items-center justify-center bg-gray-50">
        <p className="text-muted-foreground text-center">(Optional Final Preview Area)</p>
      </div>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Ready to Create?</AlertTitle>
        <AlertDescription>
          Clicking "Create Project" will save this project and its budget details. You will be able
          to manage expenses, time logs, and change orders afterwards.
        </AlertDescription>
      </Alert>

      {/* Actions are primarily handled by the main wizard footer, but you could
          have specific actions here if needed, like a dedicated "Send" button later */}
      {/*
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onSubmit} className="bg-[#0485ea] hover:bg-[#0375d1]">
          Create Project
        </Button>
         <Button variant="secondary" disabled>Send (Future)</Button>
      </div>
      */}
    </div>
  );
};

export default Step4_PreviewActions;
