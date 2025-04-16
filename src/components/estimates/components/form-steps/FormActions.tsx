import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Send,
  Download,
  FileCheck,
  ChevronDown,
  FileText,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface FormActionsProps {
  onCancel: () => void;
  onPrevious?: () => void;
  onNext?: (e?: React.MouseEvent) => void;
  isLastStep?: boolean;
  currentStep?: string;
  onSubmit?: (e?: React.FormEvent, finalStatus?: string) => void;
  isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onPrevious,
  onNext,
  isLastStep = false,
  currentStep,
  onSubmit,
  isSubmitting = false,
}) => {
  const [submissionType, setSubmissionType] = useState<string>('draft');
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const handleSubmitWithStatus = (status: string) => {
    setSubmissionType(status);
    if (onSubmit) {
      onSubmit(undefined, status);
    }
  };

  // Default submit with selected status
  const handlePrimarySubmit = () => {
    handleSubmitWithStatus(submissionType);
  };

  // Get label based on current submission type
  const getSubmitButtonLabel = () => {
    if (isSubmitting) {
      switch (submissionType) {
        case 'sent':
          return 'Sending...';
        case 'approved':
          return 'Approving...';
        case 'awaiting_approval':
          return 'Setting as Pending...';
        default:
          return 'Saving...';
      }
    }

    switch (submissionType) {
      case 'sent':
        return 'Send to Customer';
      case 'approved':
        return 'Save as Approved';
      case 'awaiting_approval':
        return 'Save as Pending Approval';
      default:
        return 'Save as Draft';
    }
  };

  // Get icon for submit button based on status
  const getSubmitButtonIcon = () => {
    switch (submissionType) {
      case 'sent':
        return <Send className="h-4 w-4 mr-2" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 mr-2" />;
      case 'awaiting_approval':
        return <FileCheck className="h-4 w-4 mr-2" />;
      default:
        return <Save className="h-4 w-4 mr-2" />;
    }
  };

  // If we're on the last step (review), render a compact version
  if (isLastStep) {
    return (
      <div className="w-full">
        <Card className="border-muted mb-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Choose how to save this estimate:</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="default"
                className="justify-start"
                onClick={() => handleSubmitWithStatus('draft')}
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2 text-blue-600" />
                <span>Save as Draft</span>
              </Button>

              <Button
                variant="outline"
                size="default"
                className="justify-start"
                onClick={() => handleSubmitWithStatus('sent')}
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2 text-green-600" />
                <span>Send to Customer</span>
              </Button>

              <Button
                variant="outline"
                size="default"
                className="justify-start"
                onClick={() => handleSubmitWithStatus('awaiting_approval')}
                disabled={isSubmitting}
              >
                <FileCheck className="h-4 w-4 mr-2 text-orange-600" />
                <span>Save as Pending Approval</span>
              </Button>

              <Button
                variant="outline"
                size="default"
                className="justify-start"
                onClick={() => handleSubmitWithStatus('approved')}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                <span>Save as Approved</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t flex justify-between">
            <div>
              {onPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onPrevious}
                  disabled={isSubmitting}
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>

              <Button
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={isSubmitting}
                onClick={handlePrimarySubmit}
                size="default"
              >
                {getSubmitButtonIcon()}
                {getSubmitButtonLabel()}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // For non-last steps, render the original layout
  return (
    <div className="space-y-4 px-6 pb-4 pt-2 w-full">
      {/* Add a finalization options card if on the last step */}
      {isLastStep && (
        <Card className="border-muted border-dashed mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Finalize Estimate</CardTitle>
            <CardDescription>Choose how to finalize this estimate</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={submissionType}
              onValueChange={setSubmissionType}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="draft" id="draft" />
                <Label htmlFor="draft" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center">
                    <Save className="h-4 w-4 mr-2 text-blue-600" />
                    Save as Draft
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Save for later editing before sending to the customer
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="sent" id="sent" />
                <Label htmlFor="sent" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center">
                    <Send className="h-4 w-4 mr-2 text-green-600" />
                    Send to Customer
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Save and email the estimate to the customer immediately
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="awaiting_approval" id="awaiting_approval" />
                <Label htmlFor="awaiting_approval" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-orange-600" />
                    Save as Pending Approval
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mark that customer has received the estimate and is reviewing it
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="approved" id="approved" />
                <Label htmlFor="approved" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Save as Approved
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mark estimate as approved by the customer and ready for project creation
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between w-full">
        <div>
          {onPrevious && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
              size="lg"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            size="lg"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          {onNext && !isLastStep && (
            <Button
              type="button"
              onClick={onNext}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              size="lg"
              disabled={isSubmitting}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {isLastStep && onSubmit && (
            <Button
              className="bg-[#0485ea] hover:bg-[#0375d1] px-4 text-md h-11"
              disabled={isSubmitting}
              onClick={handlePrimarySubmit}
            >
              {getSubmitButtonIcon()}
              {getSubmitButtonLabel()}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormActions;
