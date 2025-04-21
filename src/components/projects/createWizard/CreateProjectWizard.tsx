import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Remove useNavigate
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'; // Re-import Dialog components
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import Step1_ProjectCustomerInfo from './Step1_ProjectCustomerInfo';
import Step2_BudgetLineItems from './Step2_BudgetLineItems';
import Step3_SummaryView from './Step3_SummaryView';
import Step4_PreviewActions from './Step4_PreviewActions';
import { useProjectSubmit, ProjectFormValues } from '../hooks/useProjectSubmit';
// import PageTransition from '@/components/layout/PageTransition'; // Remove PageTransition
// import Header from '@/components/layout/Header'; // Remove Header

// Re-add CreateProjectWizardProps interface
interface CreateProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const TOTAL_STEPS = 4;

// Update component signature to accept props again
const CreateProjectWizard: React.FC<CreateProjectWizardProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  // const navigate = useNavigate(); // Remove navigate hook
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  // Callback for successful project creation - adjust to use props
  const handleInternalProjectCreated = () => {
    toast({ title: 'Project Created', description: 'Successfully created new project.' });
    onProjectCreated(); // Call prop
    // onClose(); // Closing is handled by onOpenChange or the caller
  };

  const { isSubmitting, handleSubmit: handleFinalSubmit } = useProjectSubmit(
    handleInternalProjectCreated
  );

  const wizardFormActions = {
    triggerSubmit: () => {
      console.warn('Submit triggered before step handler was attached.');
    },
  };

  const handleNext = (stepData: any) => {
    console.log(`Data from step ${currentStep}:`, stepData);
    const updatedFormData = { ...formData, ...stepData };
    setFormData(updatedFormData);

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleActualSubmit(updatedFormData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleActualSubmit = async (finalData: any) => {
    console.log('Attempting final project submission:', finalData);
    try {
      const submissionData: ProjectFormValues = {
        projectName: finalData.projectName,
        customerId: finalData.customerId,
        jobDescription: '',
        status: 'active',
        estimateId: undefined,
        siteLocationSameAsCustomer: finalData.siteLocationSameAsCustomer,
        dueDate: undefined,
        siteLocation: finalData.siteLocation,
        newCustomer: finalData.newCustomer,
        budgetItems: finalData.budgetItems || [],
      };
      await handleFinalSubmit(submissionData);
      // Success is handled by handleInternalProjectCreated callback
      // which calls props.onProjectCreated
      // No navigation needed here
    } catch (error) {
      console.error('Project creation failed in wizard:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1_ProjectCustomerInfo
            formData={formData}
            onNext={handleNext}
            wizardFormActions={wizardFormActions}
          />
        );
      case 2:
        return (
          <Step2_BudgetLineItems
            formData={formData}
            onNext={handleNext}
            wizardFormActions={wizardFormActions}
          />
        );
      case 3:
        return <Step3_SummaryView formData={formData} onNext={() => setCurrentStep(4)} />;
      case 4:
        return (
          <Step4_PreviewActions
            formData={formData}
            onSubmit={() => handleActualSubmit(formData)}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    // Add Dialog wrapper back
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        {/* Re-add DialogHeader */}
        <DialogHeader>
          <DialogTitle>
            Create New Project (Step {currentStep} of {TOTAL_STEPS})
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1 && 'Enter project details and select or create a customer.'}
            {currentStep === 2 && 'Define the project budget by adding line items.'}
            {currentStep === 3 && 'Review the project details and budget summary.'}
            {currentStep === 4 && 'Review the final details and create the project.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Content Area */}
        <div className="flex-grow overflow-y-auto p-1 pr-2">{renderStep()}</div>

        {/* Re-add DialogFooter */}
        <DialogFooter className="pt-4 mt-auto">
          <Button variant="outline" onClick={onClose}>
            {' '}
            {/* Use onClose prop */}
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (currentStep === 1 || currentStep === 2) {
                wizardFormActions.triggerSubmit();
              } else if (currentStep === 3) {
                setCurrentStep(4);
              } else if (currentStep === 4) {
                handleActualSubmit(formData);
              }
            }}
            disabled={isSubmitting && currentStep === TOTAL_STEPS}
            type="button"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
          >
            {isSubmitting && currentStep === TOTAL_STEPS
              ? 'Creating...'
              : currentStep === TOTAL_STEPS
                ? 'Create Project'
                : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectWizard;
