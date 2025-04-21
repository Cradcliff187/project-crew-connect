import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils'; // Assuming utils function exists

// Reuse types or define specific summary types
import { Step1FormValues } from './Step1_ProjectCustomerInfo';
// import { LineItem } from './Step2_BudgetLineItems'; // Using placeholder type <-- Remove this import
import { BudgetItemFormValues } from './Step2_BudgetLineItems'; // Import actual type

// Local placeholder type for Budget Item Summary <-- Remove local type
// type BudgetLineItemSummary = {
//   id: string;
//   category: string;
//   description: string;
//   estimated_amount: number;
// };

interface Step3Props {
  formData: Partial<Step1FormValues & { budgetItems: BudgetItemFormValues[] }>; // Use imported type
  onNext: () => void; // Simple next trigger, no data passed from this step
  // Add wizardFormActions if needed for submit trigger
}

const Step3_SummaryView: React.FC<Step3Props> = ({ formData, onNext }) => {
  const {
    projectName,
    customerId,
    newCustomer,
    siteLocationSameAsCustomer,
    siteLocation,
    budgetItems = [],
  } = formData;

  // TODO: Fetch customer name if only customerId is available
  const customerName = newCustomer?.customerName || customerId || 'N/A';

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.estimated_amount, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Project Summary</h3>
      <p className="text-muted-foreground">
        Please review the project details and budget summary below before proceeding.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project & Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Project Name:</span>
              <span className="font-medium">{projectName || 'Not Specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-medium">{customerName}</span>
            </div>
            {/* Display more customer details if available (e.g., from newCustomer) */}
            {/* TODO: Add customer email/phone if available */}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Site Location:</span>
              <span className="font-medium">
                {siteLocationSameAsCustomer
                  ? 'Same as Customer Address'
                  : siteLocation?.address || 'Not Specified'}
              </span>
            </div>
            {/* Display full site address if different */}
            {!siteLocationSameAsCustomer && siteLocation?.address && (
              <div className="pl-4 text-xs text-muted-foreground">
                {siteLocation.address}, {siteLocation.city}, {siteLocation.state} {siteLocation.zip}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Number of Line Items:</span>
              <span className="font-medium">{budgetItems.length}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Estimated Budget:</span>
              <span className="font-medium text-lg text-[#0485ea]">
                {formatCurrency(totalBudget)}
              </span>
            </div>
            {/* Optionally list top-level categories and their totals */}
          </CardContent>
        </Card>
      </div>

      {/* Assume main wizard footer handles the next action */}
    </div>
  );
};

export default Step3_SummaryView;
