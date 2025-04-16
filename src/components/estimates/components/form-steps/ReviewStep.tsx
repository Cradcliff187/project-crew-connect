import React, { useState } from 'react';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import EstimatePreview from '../EstimatePreview';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileIcon,
  PrinterIcon,
  DownloadIcon,
  ZoomInIcon,
  ZoomOutIcon,
  Save,
  Send,
  FileCheck,
  CheckCircle,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface ReviewStepProps {
  formData: EstimateFormValues;
  selectedCustomerName: string | null;
  selectedCustomerAddress: string | null;
  selectedCustomerId?: string | null;
  onSubmit?: (status: string) => void;
}

const ReviewStep = ({
  formData,
  selectedCustomerName,
  selectedCustomerAddress,
  selectedCustomerId,
  onSubmit,
}: ReviewStepProps) => {
  const [activeView, setActiveView] = useState<string>('basic');
  // Ensure formData has required items property
  const safeFormData = {
    ...formData,
    items: formData.items || [],
  };

  const documentCount =
    (formData.estimate_documents?.length || 0) +
    (formData.items?.filter(i => i.document_id).length || 0);

  // Use the real submit handler if available, otherwise show an alert
  const handleSubmit = (status: string) => {
    if (onSubmit) {
      onSubmit(status);
    } else {
      // Fallback for development/testing
      window.alert(`Option selected: ${status}`);
      console.log(
        'No submit handler provided. In production, this would submit the form with status:',
        status
      );
    }
  };

  return (
    <div className="mb-24 overflow-y-auto max-h-[70vh]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Review Your Estimate</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => window.print()}
          >
            <PrinterIcon className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardContent className="p-0">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <TabsList className="grid grid-cols-2 w-auto">
                <TabsTrigger value="basic">Basic View</TabsTrigger>
                <TabsTrigger value="printable">Printable View</TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ZoomOutIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ZoomInIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <TabsContent value="basic" className="m-0 p-0 min-h-[400px]">
              <EstimatePreview
                formData={safeFormData}
                selectedCustomerName={selectedCustomerName}
                selectedCustomerAddress={selectedCustomerAddress}
                selectedCustomerId={selectedCustomerId}
              />
            </TabsContent>

            <TabsContent value="printable" className="m-0 p-0 min-h-[400px]">
              <EstimatePreview
                formData={safeFormData}
                selectedCustomerName={selectedCustomerName}
                selectedCustomerAddress={selectedCustomerAddress}
                selectedCustomerId={selectedCustomerId}
                printable={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {documentCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <FileIcon className="h-4 w-4" />
          <span>
            {documentCount} document{documentCount !== 1 ? 's' : ''} attached
          </span>
        </div>
      )}

      {/* Finalization Options */}
      <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Choose how to save this estimate:</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-blue-100 hover:bg-blue-50"
            onClick={() => handleSubmit('draft')}
          >
            <Save className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-base">Save as Draft</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-green-100 hover:bg-green-50"
            onClick={() => handleSubmit('sent')}
          >
            <Send className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-base">Send to Customer</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-orange-100 hover:bg-orange-50"
            onClick={() => handleSubmit('awaiting_approval')}
          >
            <FileCheck className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-base">Save as Pending Approval</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-green-100 hover:bg-green-50"
            onClick={() => handleSubmit('approved')}
          >
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-base">Save as Approved</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
