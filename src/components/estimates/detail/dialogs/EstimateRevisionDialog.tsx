import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Save,
  FileText,
  ClipboardCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  FileCheck,
  CheckCircle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize,
  Printer,
  Download,
} from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { createPortal } from 'react-dom';
import { v4 as uuidv4 } from 'uuid';
import EstimateItemFields from '../../components/EstimateItemFields';
import EstimateSummary from '../../components/EstimateSummary';
import { useSummaryCalculations } from '../../hooks/useSummaryCalculations';

// Define the revision steps - similar to create estimate flow
const REVISION_STEPS = [
  {
    id: 'details',
    label: 'Revision Details',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'items',
    label: 'Line Items',
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: <Eye className="h-4 w-4" />,
  },
];

interface EstimateRevisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  currentVersion: number;
  onSuccess?: () => void;
  sourceRevisionId?: string;
  sourceRevisionVersion?: number;
}

interface RevisionFormValues {
  notes: string;
  items: any[];
  contingencyPercentage: number;
  updateLocation: boolean;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  status?: string;
  customerPO?: string;
  siteAddress?: string;
  siteCity?: string;
  siteState?: string;
  siteZip?: string;
}

// Define the internal content component
const RevisionDialogContent: React.FC<{
  form: any; // Pass the form object
  saving: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  goToPreviousStep: () => void;
  goToNextStep: () => void;
  handleNext: () => void;
  handleSubmitWithStatus: (status: string) => void;
  onOpenChange: (open: boolean) => void;
  newRevisionVersion: number;
  customerName: string;
  customerAddress: string | null;
  estimateData: any;
  watchedUpdateLocation: boolean;
  watchedLocation: any;
  jobSiteLocation: string;
  formatLocation: (location: any) => string;
  zoomLevel: number;
  zoomOut: () => void;
  zoomIn: () => void;
  toggleFullScreen: () => void;
  handlePrint: () => void;
  handleExport: () => void;
  printableContentRef: React.RefObject<HTMLDivElement>;
  getSubmitButtonIcon: () => JSX.Element;
  getSubmitButtonLabel: () => string;
  isFullScreen: boolean;
  handleZoomChange: (value: number[]) => void;
}> = ({
  form,
  saving,
  activeTab,
  setActiveTab,
  goToPreviousStep,
  goToNextStep,
  handleNext,
  handleSubmitWithStatus,
  onOpenChange,
  newRevisionVersion,
  customerName,
  customerAddress,
  estimateData,
  watchedUpdateLocation,
  watchedLocation,
  jobSiteLocation,
  formatLocation,
  zoomLevel,
  zoomOut,
  zoomIn,
  toggleFullScreen,
  handlePrint,
  handleExport,
  printableContentRef,
  getSubmitButtonIcon,
  getSubmitButtonLabel,
  isFullScreen,
  handleZoomChange,
}) => {
  // Call the hook *inside* the component rendered within FormProvider
  const { subtotal, contingencyAmount, contingencyPercentage, grandTotal } =
    useSummaryCalculations();

  // Move content definitions here
  const detailsContent = (
    <div className="space-y-6">
      {/* Revision Notes */}
      <div>
        <Label htmlFor="notes" className="text-base font-medium">
          Revision Notes
        </Label>
        <div className="text-sm text-gray-500 mb-2">
          Please explain the reason for this revision and any important details about the changes.
        </div>
        <Textarea
          id="notes"
          placeholder="Enter notes about the changes in this revision..."
          {...form.register('notes')}
          rows={4}
        />
      </div>

      {/* Job Location Section */}
      <div className="space-y-4 border p-4 rounded-md bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-base font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-[#0485ea]" />
              Current Job Site Location
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-2">
              {jobSiteLocation || 'No location specified'}
            </p>
          </div>

          <FormField
            control={form.control}
            name="updateLocation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Update Location</FormLabel>
                  <FormDescription className="text-xs">
                    Toggle to change job site location
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        {watchedUpdateLocation && (
          <div className="border-t pt-4 mt-2">
            <Alert className="bg-blue-50 border-blue-200 mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>Enter the new job site location for this revision</AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="location.address">Site Address</Label>
                <Input
                  id="location.address"
                  placeholder="Enter job site address"
                  {...form.register('location.address')}
                />
              </div>

              <div>
                <Label htmlFor="location.city">City</Label>
                <Input
                  id="location.city"
                  placeholder="Enter city"
                  {...form.register('location.city')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <Label htmlFor="location.state">State</Label>
                <Input
                  id="location.state"
                  placeholder="Enter state"
                  {...form.register('location.state')}
                />
              </div>

              <div>
                <Label htmlFor="location.zip">ZIP</Label>
                <Input
                  id="location.zip"
                  placeholder="Enter ZIP code"
                  {...form.register('location.zip')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const itemsContent = (
    <div className="space-y-6">
      <div className="w-full">
        <EstimateItemFields />
      </div>

      <Card className="bg-gray-50">
        <CardHeader className="py-3">
          <CardTitle className="text-base font-medium">Revision Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <EstimateSummary showContingencyControls={true} />
        </CardContent>
      </Card>
    </div>
  );

  const previewContent = (
    <div className="space-y-8">
      {/* Preview Controls */}
      <div className="flex justify-end mb-2 items-center gap-2">
        <Button variant="ghost" size="sm" onClick={zoomOut} className="p-1 h-7 w-7">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-xs">{zoomLevel}%</span>
        <Button variant="ghost" size="sm" onClick={zoomIn} className="p-1 h-7 w-7">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleFullScreen} className="p-1 h-7">
          <Maximize2 className="h-4 w-4" />
          <span className="ml-1 text-xs">Fullscreen</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePrint} className="p-1 h-7">
          <Printer className="h-4 w-4" />
          <span className="ml-1 text-xs">Print</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExport} className="p-1 h-7">
          <Download className="h-4 w-4" />
          <span className="ml-1 text-xs">Export</span>
        </Button>
      </div>

      {/* Enhanced Preview with Zoom */}
      <div
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        className="transition-transform duration-100"
        ref={printableContentRef}
        id="printable-estimate"
      >
        <Card className="shadow-sm">
          <CardContent className="p-4">
            {/* Simple Preview Content */}
            <div className="bg-white">
              <div className="flex justify-between mb-4 border-b pb-3">
                <div>
                  <h2 className="text-xl font-bold text-[#0485ea]">ESTIMATE REVISION</h2>
                  <p className="text-sm text-gray-600">Version: {newRevisionVersion}</p>
                  <p className="text-sm text-gray-600">
                    Date: {formatDate(new Date().toISOString())}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-base">AKC LLC</h3>
                  <p className="text-sm text-gray-600">123 Business Avenue</p>
                  <p className="text-sm text-gray-600">info@akc-llc.com</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-1">Customer:</h3>
                  <p className="font-medium text-sm">{customerName}</p>
                  {customerAddress && <p className="text-xs text-gray-600">{customerAddress}</p>}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-1">Project:</h3>
                  <p className="font-medium text-sm">{estimateData?.projectname || 'N/A'}</p>
                  {watchedUpdateLocation && (
                    <>
                      <h3 className="font-semibold text-sm text-gray-700 mt-2 mb-1">
                        Job Site Location:
                      </h3>
                      <p className="text-xs text-gray-600">
                        {watchedUpdateLocation ? formatLocation(watchedLocation) : jobSiteLocation}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {form.watch('notes') && (
                <div className="mb-3">
                  <h3 className="font-semibold text-sm text-gray-700 mb-1">Revision Notes:</h3>
                  <p className="text-xs text-gray-600 border p-2 rounded bg-gray-50">
                    {form.watch('notes')}
                  </p>
                </div>
              )}

              <div className="border rounded-md overflow-hidden mb-3">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {form.watch('items')?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-2 py-1 text-xs text-gray-900">
                          {item.description || `Item ${index + 1}`}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900 text-right">
                          {item.quantity || 1}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900 text-right">
                          ${(Number(item.unit_price) || 0).toFixed(2)}
                        </td>
                        <td className="px-2 py-1 text-xs text-gray-900 text-right">
                          ${(Number(item.total_price) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3}
                        className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                      >
                        Subtotal:
                      </td>
                      <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                        ${subtotal.toFixed(2)}
                      </td>
                    </tr>
                    {Number(contingencyPercentage) > 0 && (
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                        >
                          Contingency ({contingencyPercentage}%):
                        </td>
                        <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                          ${contingencyAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3}
                        className="px-2 py-1 text-xs font-bold text-gray-900 text-right"
                      >
                        Total:
                      </td>
                      <td className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
                        ${grandTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-gray-600 text-xs">
                <p className="font-medium mb-1">Terms & Conditions:</p>
                <p>This estimate is valid for 30 days from the date issued.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status selection section - matched to create estimate flow */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Choose how to save this revision:</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-blue-100 hover:bg-blue-50"
            onClick={() => form.setValue('status', 'draft')}
            disabled={saving}
          >
            <Save className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-base">Save as Draft</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-green-100 hover:bg-green-50"
            onClick={() => form.setValue('status', 'sent')}
            disabled={saving}
          >
            <Send className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-base">Send to Customer</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-orange-100 hover:bg-orange-50"
            onClick={() => form.setValue('status', 'pending')}
            disabled={saving}
          >
            <FileCheck className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-base">Save as Pending Approval</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-green-100 hover:bg-green-50"
            onClick={() => form.setValue('status', 'approved')}
            disabled={saving}
          >
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-base">Save as Approved</span>
          </Button>
        </CardContent>
        <CardFooter className="pt-2 border-t flex justify-between">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={saving}
              size="sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>

            <Button
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={saving}
              onClick={() => handleSubmitWithStatus(form.watch('status'))}
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

  // Determine if last step for button logic
  const isLastStep = activeTab === REVISION_STEPS[REVISION_STEPS.length - 1].id;

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 flex-1 flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList
              className="mb-4 grid h-12 p-1 bg-gray-50 border border-gray-200 rounded-lg"
              style={{ gridTemplateColumns: `repeat(${REVISION_STEPS.length}, 1fr)` }}
            >
              {REVISION_STEPS.map(step => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className={`text-sm font-medium transition-all duration-200 ${
                    activeTab === step.id
                      ? 'bg-[#0485ea] text-white shadow-md'
                      : 'hover:bg-gray-100 hover:text-[#0485ea]'
                  }`}
                  onClick={() => setActiveTab(step.id)}
                >
                  <div className="flex items-center">
                    {step.icon}
                    <span className="ml-2">{step.label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="details" className="mt-0 flex-1 overflow-y-auto px-1">
              {detailsContent}
            </TabsContent>

            <TabsContent value="items" className="mt-0 flex-1 overflow-y-auto px-1">
              {itemsContent}
            </TabsContent>

            <TabsContent value="preview" className="mt-0 flex-1 overflow-y-auto px-1">
              {previewContent}
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 bg-white border-t py-4 px-6 z-10">
          {!isLastStep && (
            <div className="flex justify-between w-full">
              <div>
                {/* Show previous button only if not the first step */}
                {activeTab !== REVISION_STEPS[0].id && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={saving}
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
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                  size="lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                  size="lg"
                  disabled={saving}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const EstimateRevisionDialog: React.FC<EstimateRevisionDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  currentVersion,
  onSuccess,
  sourceRevisionId,
  sourceRevisionVersion,
}) => {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [estimateData, setEstimateData] = useState<any>({});
  const { toast } = useToast();
  // Remove the hook call from here
  /*
  const {
    subtotal,
    contingencyAmount,
    contingencyPercentage,
    grandTotal,
  } = useSummaryCalculations();
  */

  // State to trigger and manage item loading separately
  const [itemsToLoad, setItemsToLoad] = useState<{
    revisionId: string | null;
    trigger: number;
  } | null>(null);

  // Enhanced preview state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const printableContentRef = useRef<HTMLDivElement>(null);

  // Define toggleFullScreen function early using useCallback
  const toggleFullScreen = useCallback(() => {
    // Close the dialog when entering fullscreen mode
    onOpenChange(false);

    // Toggle fullscreen state
    setIsFullScreen(!isFullScreen);

    // Manage body overflow
    if (!isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isFullScreen, onOpenChange]);

  const form = useForm<RevisionFormValues>({
    defaultValues: {
      notes: '',
      items: [],
      contingencyPercentage: 0,
      updateLocation: false,
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      status: 'DRAFT',
    },
  });

  // Step navigation functions
  const isFirstStep = activeTab === REVISION_STEPS[0].id;
  const isLastStep = activeTab === REVISION_STEPS[REVISION_STEPS.length - 1].id;

  const goToNextStep = useCallback(() => {
    const currentIndex = REVISION_STEPS.findIndex(step => step.id === activeTab);
    if (currentIndex < REVISION_STEPS.length - 1) {
      setActiveTab(REVISION_STEPS[currentIndex + 1].id);
    }
  }, [activeTab]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = REVISION_STEPS.findIndex(step => step.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(REVISION_STEPS[currentIndex - 1].id);
    }
  }, [activeTab]);

  const validateCurrentStep = async () => {
    // Simple validation logic - could be expanded for more complex validation
    try {
      if (activeTab === 'details') {
        // Validate details tab
        return true;
      } else if (activeTab === 'items') {
        // Validate items tab - ensure there's at least one item
        const items = form.getValues('items');
        if (!items || items.length === 0) {
          toast({
            title: 'Validation Error',
            description: 'At least one line item is required',
            variant: 'destructive',
          });
          return false;
        }

        // Now validate each item has a description
        const invalidItems = items.filter(
          item => !item.description || item.description.trim() === ''
        );
        if (invalidItems.length > 0) {
          toast({
            title: 'Validation Error',
            description: `${invalidItems.length} line item(s) missing required description`,
            variant: 'destructive',
          });
          return false;
        }

        return true;
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleNext = useCallback(async () => {
    // Don't perform strict validation to prevent blocking the user workflow

    // If moving away from items tab, keep all items
    if (activeTab === 'items') {
      const allItems = form.getValues('items') || [];
      // We'll validate before final submission instead
    }

    // Always allow navigation to next step
    goToNextStep();
  }, [goToNextStep, activeTab, form]);

  // Determine the version number for the new revision
  const newRevisionVersion = currentVersion + 1;

  // Effect 1: Reset form and trigger item load only when dialog opens or source changes
  useEffect(() => {
    if (open && estimateId) {
      console.log('[Effect 1] Resetting form and determining items to load...');
      // Reset form basics (non-items)
      supabase
        .from('estimates')
        .select(
          'contingency_percentage, sitelocationaddress, sitelocationcity, sitelocationstate, sitelocationzip'
        ) // Select only needed fields for reset
        .eq('estimateid', estimateId)
        .single()
        .then(({ data: estData, error: estError }) => {
          if (estError) {
            console.error('Error fetching estimate data for reset:', estError);
            toast({
              title: 'Error',
              description: 'Could not load initial estimate data.',
              variant: 'destructive',
            });
            // Decide if dialog should close or proceed without defaults
            // onOpenChange(false);
            return;
          }

          // Reset form fields but leave 'items' untouched for now
          form.reset({
            notes: sourceRevisionId ? `Revision based on v${sourceRevisionVersion}` : '',
            items: form.getValues('items') || [], // Keep existing items temporarily during reset
            contingencyPercentage: Number(estData.contingency_percentage) || 0, // Ensure it's a number
            updateLocation: false,
            location: {
              address: estData.sitelocationaddress || '',
              city: estData.sitelocationcity || '',
              state: estData.sitelocationstate || '',
              zip: estData.sitelocationzip || '',
            },
            // Reset other relevant fields
          });

          // Log the contingency percentage for debugging
          console.log(`Setting contingency to: ${Number(estData.contingency_percentage) || 0}%`);

          // Determine which revision ID to use for fetching items
          const determineRevisionId = async () => {
            if (sourceRevisionId) {
              return sourceRevisionId;
            } else {
              const { data: selectedRevData, error: selectedRevError } = await supabase
                .from('estimate_revisions')
                .select('id')
                .eq('estimate_id', estimateId)
                .eq('is_selected_for_view', true)
                .single();
              if (!selectedRevError && selectedRevData) {
                return selectedRevData.id;
              } else {
                console.error(
                  'Error finding selected revision to load items:',
                  selectedRevError?.message
                );
                return null; // Indicate no specific revision found
              }
            }
          };

          determineRevisionId().then(revisionIdForItems => {
            console.log(`[Effect 1] Triggering item load for revisionId: ${revisionIdForItems}`);
            // Trigger Effect 2
            setItemsToLoad({ revisionId: revisionIdForItems, trigger: Date.now() });
          });
        });
    } else if (!open) {
      // Reset trigger when dialog closes
      setItemsToLoad(null);
    }
    // This effect should ONLY run when these specific props change
  }, [open, estimateId, sourceRevisionId, sourceRevisionVersion, form.reset, toast]); // form.reset dependency needed here

  // Effect 2: Load items when triggered by Effect 1
  useEffect(() => {
    if (!itemsToLoad || itemsToLoad.revisionId === null) {
      console.log('[Effect 2] No revisionId to load, setting items to empty array.');
      // If no source revision, ensure items are empty (or keep newlyAdded if that logic is restored)
      form.setValue('items', [], { shouldDirty: false });
      return;
    }

    const revisionId = itemsToLoad.revisionId;
    console.log(`[Effect 2] Loading items for revisionId: ${revisionId}...`);

    supabase
      .from('estimate_items')
      .select('*')
      .eq('estimate_id', estimateId)
      .eq('revision_id', revisionId)
      .then(({ data: itemsData, error: itemsError }) => {
        if (!itemsError && itemsData) {
          console.log(`[Effect 2] Loaded ${itemsData.length} items.`);
          const transformedItems = itemsData.map(item => ({
            // ... same transformation logic as before, ensuring unique id and temp_item_id ...
            ...item,
            original_id: item.id,
            id: uuidv4(),
            temp_item_id: uuidv4(),
            revision_id: undefined,
            _isNewlyAdded: false,
            description: item.description || '',
            cost: String(item.cost || '0'),
            markup_percentage: String(item.markup_percentage || '20'),
            quantity: String(item.quantity || '1'),
            unit_price: String(item.unit_price || '0'),
            total_price: String(item.total_price || '0'),
            item_type: item.item_type || 'none',
            vendor_id: item.vendor_id || '',
            subcontractor_id: item.subcontractor_id || '',
            document_id: item.document_id || '',
            trade_type: (item as any).trade_type || '',
            expense_type: (item as any).expense_type || undefined,
            custom_type: (item as any).custom_type || '',
          }));
          // Set the loaded items, overwriting anything currently in the form
          form.setValue('items', transformedItems, { shouldDirty: false });
        } else {
          console.error(`[Effect 2] Error loading items for revision ${revisionId}:`, itemsError);
          toast({
            title: 'Error Loading Items',
            description: itemsError?.message || 'Could not load items.',
            variant: 'destructive',
          });
          // Set items to empty on error
          form.setValue('items', [], { shouldDirty: false });
        }
      });

    // This effect runs ONLY when itemsToLoad changes
  }, [itemsToLoad, estimateId, form.setValue, toast]); // setValue and toast needed here

  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* Hide everything except the printable content */
        body * {
          visibility: hidden;
        }
        #printable-estimate, #printable-estimate * {
          visibility: visible;
          transform: scale(1) !important;
          width: 100% !important;
        }
        #printable-estimate {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          box-shadow: none;
        }
        /* Hide print and export buttons */
        .print\\:hidden {
          display: none !important;
        }
      }
    `;

    // Add to document head
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
      // Also cleanup fullscreen state if component unmounts
      if (isFullScreen) {
        document.body.style.overflow = '';
      }
    };
  }, [isFullScreen]);

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        toggleFullScreen();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreen, toggleFullScreen]);

  const handleSubmitWithStatus = async (status: string) => {
    form.setValue('status', status);
    await handleSubmit(form.getValues());
  };

  const handleSubmit = async (values: RevisionFormValues) => {
    try {
      setSaving(true);

      const allItems = values.items || [];
      console.log(`Processing ${allItems.length} items for revision...`);

      // Only filter out completely empty items (no data at all) and items marked for deletion
      const validItems = allItems.filter(item => {
        // Skip items explicitly marked for deletion
        if (item._isDeleted) {
          console.log(`Skipping deleted item: ${item.description}`);
          return false;
        }

        // Keep items that have any data filled in
        return (
          item.description?.trim() !== '' ||
          Number(item.quantity) > 0 ||
          Number(item.unit_price) > 0 ||
          Number(item.cost) > 0
        );
      });

      // Assign a generic description to any item without one
      validItems.forEach((item, index) => {
        if (!item.description || item.description.trim() === '') {
          item.description = `Item ${index + 1}`;
        }
      });

      // We need at least one item
      if (validItems.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one item with some data is required.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      // Show notification if we filtered items
      if (validItems.length < allItems.length) {
        const removedCount = allItems.length - validItems.length;
        console.log(`Filtered out ${removedCount} empty or deleted items`);
        toast({
          title: 'Items Filtered',
          description: `${allItems.length - validItems.length} empty or deleted items were removed.`,
          variant: 'default',
        });
      }

      // Add logging here
      console.log('Valid items before deduplication:', JSON.stringify(validItems, null, 2));

      // Deduplicate items based on original_id or a combination of properties if original_id is not available
      const seenOriginalIds = new Set();
      const deduplicatedItems = validItems.filter(item => {
        // Use original_id for deduplication if available
        if (item.original_id) {
          if (seenOriginalIds.has(item.original_id)) {
            console.log(`Removing duplicate item with original_id: ${item.original_id}`);
            return false; // Skip duplicate
          }
          seenOriginalIds.add(item.original_id);
          return true;
        }

        // Fallback to using description + price + cost as unique identifier
        const itemKey = `${item.description}-${item.unit_price}-${item.cost}`;
        if (seenOriginalIds.has(itemKey)) {
          console.log(`Removing duplicate item with signature: ${itemKey}`);
          return false; // Skip duplicate
        }
        seenOriginalIds.add(itemKey);
        return true;
      });

      // Log how many duplicates were removed
      const duplicatesRemoved = validItems.length - deduplicatedItems.length;
      if (duplicatesRemoved > 0) {
        console.log(`Removed ${duplicatesRemoved} duplicate items before saving revision.`);
        toast({
          title: 'Duplicates Removed',
          description: `${duplicatesRemoved} duplicate items were automatically removed.`,
          variant: 'default',
        });
      }

      const currentItems = deduplicatedItems;
      console.log(`Final revision will contain ${currentItems.length} items`);

      // Get the existing versions for this estimate
      const { data: existingVersions, error: versionsError } = await supabase
        .from('estimate_revisions')
        .select('version')
        .eq('estimate_id', estimateId)
        .order('version', { ascending: false });

      if (versionsError) {
        throw new Error(`Error checking existing versions: ${versionsError.message}`);
      }

      // Determine the next version number
      const highestVersion = existingVersions.length > 0 ? existingVersions[0].version : 0;
      const nextVersion = highestVersion + 1;

      // Re-calculate final summary just before submission based on potentially modified items
      // NOTE: These calculated values are NOT being saved to the revision row itself as the columns don't exist.
      // They might be used elsewhere or were intended for columns that were removed/renamed.
      const finalItemsForSave = currentItems || [];
      const finalSummary = finalItemsForSave.reduce(
        (acc, item) => {
          const cost = Number(item.cost) || 0;
          const quantity = Number(item.quantity) || 0;
          const unit_price = Number(item.unit_price) || 0;
          const item_total_price = quantity * unit_price;
          acc.totalCost += cost * quantity;
          acc.subtotal += item_total_price;
          return acc;
        },
        { totalCost: 0, subtotal: 0 }
      );

      console.log(
        `Revision summary: subtotal $${finalSummary.subtotal.toFixed(2)}, total cost $${finalSummary.totalCost.toFixed(2)}`
      );

      // Create the revision record using ONLY existing columns
      const { data: newRevision, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimateId,
          version: nextVersion,
          status: values.status || 'draft',
          is_selected_for_view: true,
          site_address: values.updateLocation
            ? values.location.address
            : estimateData.sitelocationaddress,
          site_city: values.updateLocation ? values.location.city : estimateData.sitelocationcity,
          site_state: values.updateLocation
            ? values.location.state
            : estimateData.sitelocationstate,
          site_zip: values.updateLocation ? values.location.zip : estimateData.sitelocationzip,
          notes: values.notes || null,
        })
        .select()
        .single();

      if (revisionError) {
        throw new Error(`Error creating revision: ${revisionError.message}`);
      }

      const newRevisionId = newRevision.id;
      console.log(`Created new revision with ID: ${newRevisionId}`);

      // Mark all other revisions as not selected for view
      const { error: updateError } = await supabase
        .from('estimate_revisions')
        .update({ is_selected_for_view: false })
        .eq('estimate_id', estimateId)
        .neq('id', newRevisionId);

      if (updateError) {
        console.error(`Warning: Failed to update other revisions: ${updateError.message}`);
        // Continue despite this error
      }

      // Map items for insertion, ensuring correct structure and tracking source
      const itemInserts = currentItems.map(item => ({
        estimate_id: estimateId,
        revision_id: newRevisionId,
        description: item.description,
        quantity: Number(item.quantity || 0),
        cost: Number(item.cost || 0),
        markup_percentage: Number(item.markup_percentage || 0),
        unit_price: Number(item.unit_price || 0),
        total_price: Number(item.total_price || 0),
        item_type: item.item_type || 'none',
        vendor_id: item.vendor_id || null,
        subcontractor_id: item.subcontractor_id || null,
        document_id: item.document_id || null,
        original_item_id: item.original_id || null,
        source_item_id: item.original_id || null, // Track source item using the original_id field
        // Note: Previous comment about source_item_id not being included has been resolved with the migration
      }));

      if (itemInserts.length > 0) {
        console.log(`Inserting ${itemInserts.length} items for the new revision...`);
        const { error: itemsError } = await supabase.from('estimate_items').insert(itemInserts);

        if (itemsError) {
          console.error('Error inserting revision items:', itemsError);
          // We no longer need to check for source_item_id errors since the migration is applied
          throw new Error(`Error inserting revision items: ${itemsError.message}`);
        }
      }

      // If documents were attached, link them to the new revision
      // ... existing document handling code ...

      if (onSuccess) onSuccess();
      onOpenChange(false);
      toast({
        title: 'Revision created',
        description: `Revision ${nextVersion} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error creating revision',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Create formatted location string for display
  const formatLocation = (location: any) => {
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.zip) parts.push(location.zip);
    return parts.join(', ');
  };

  // Determine customer name and address for display in preview
  const customerName =
    estimateData?.customers?.customername || estimateData?.customername || 'Customer';
  const customerAddress = estimateData?.customers?.address
    ? `${estimateData.customers.address}, ${estimateData.customers.city || ''} ${estimateData.customers.state || ''} ${estimateData.customers.zip || ''}`
    : null;
  const watchedLocation = form.watch('location');
  const watchedUpdateLocation = form.watch('updateLocation');
  const jobSiteLocation = formatLocation(watchedLocation);

  // Get icon and label for submission button based on status
  const getSubmitButtonIcon = () => {
    switch (form.watch('status')) {
      case 'sent':
        return <Send className="h-4 w-4 mr-2" />;
      case 'pending':
        return <FileCheck className="h-4 w-4 mr-2" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 mr-2" />;
      default:
        return <Save className="h-4 w-4 mr-2" />;
    }
  };

  const getSubmitButtonLabel = () => {
    if (saving) return 'Saving...';

    switch (form.watch('status')) {
      case 'draft':
        return 'Save as Draft';
      case 'sent':
        return 'Send to Customer';
      case 'pending':
        return 'Save as Pending';
      case 'approved':
        return 'Save as Approved';
      default:
        return 'Save Revision';
    }
  };

  // Enhanced preview functions
  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handlePrint = () => {
    // Store original document title
    const originalTitle = document.title;

    // Set a specific title for the printed document
    document.title = `Estimate-Revision-${newRevisionVersion}-${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`;

    // Print the document
    window.print();

    // Restore original title
    document.title = originalTitle;

    toast({
      title: 'Print initiated',
      description: 'Your estimate revision has been sent to the printer.',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export to PDF',
      description: 'To save as PDF, select "Save as PDF" in the printer options.',
    });

    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  // Update Dialog Title/Description based on source
  const dialogTitle = sourceRevisionId
    ? `Create Revision (Based on V${sourceRevisionVersion})`
    : 'Create New Revision';
  const dialogDescription = sourceRevisionId
    ? `Creating Version ${newRevisionVersion} based on items from Version ${sourceRevisionVersion}.`
    : `Create Version ${newRevisionVersion} of this estimate. The current highest version is ${currentVersion}.`;

  // Define fullscreenPreviewContent HERE in the main component scope
  const fullscreenPreviewContent = (
    <div className="bg-white">
      {/* ... content identical to previewContent's inner div ... */}
      <div className="flex justify-between mb-4 border-b pb-3">
        <div>
          <h2 className="text-xl font-bold text-[#0485ea]">ESTIMATE REVISION</h2>
          <p className="text-sm text-gray-600">Version: {newRevisionVersion}</p>
          <p className="text-sm text-gray-600">Date: {formatDate(new Date().toISOString())}</p>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-base">AKC LLC</h3>
          <p className="text-sm text-gray-600">123 Business Avenue</p>
          <p className="text-sm text-gray-600">info@akc-llc.com</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-1">Customer:</h3>
          <p className="font-medium text-sm">{customerName}</p>
          {customerAddress && <p className="text-xs text-gray-600">{customerAddress}</p>}
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-1">Project:</h3>
          <p className="font-medium text-sm">{estimateData?.projectname || 'N/A'}</p>
          {watchedUpdateLocation && (
            <>
              <h3 className="font-semibold text-sm text-gray-700 mt-2 mb-1">Job Site Location:</h3>
              <p className="text-xs text-gray-600">
                {watchedUpdateLocation ? formatLocation(watchedLocation) : jobSiteLocation}
              </p>
            </>
          )}
        </div>
      </div>

      {form.watch('notes') && (
        <div className="mb-3">
          <h3 className="font-semibold text-sm text-gray-700 mb-1">Revision Notes:</h3>
          <p className="text-xs text-gray-600 border p-2 rounded bg-gray-50">
            {form.watch('notes')}
          </p>
        </div>
      )}

      <div className="border rounded-md overflow-hidden mb-3">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qty
              </th>
              <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {form.watch('items')?.map((item, index) => (
              <tr key={index}>
                <td className="px-2 py-1 text-xs text-gray-900">
                  {item.description || `Item ${index + 1}`}
                </td>
                <td className="px-2 py-1 text-xs text-gray-900 text-right">{item.quantity || 1}</td>
                <td className="px-2 py-1 text-xs text-gray-900 text-right">
                  ${(Number(item.unit_price) || 0).toFixed(2)}
                </td>
                <td className="px-2 py-1 text-xs text-gray-900 text-right">
                  ${(Number(item.total_price) || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer needs calculated totals - these are NOT directly available here anymore */}
          {/* Solution: Get totals from the hook called inside RevisionDialogContent. How? */}
          {/* Option 1: Lift hook call (bad, context issue) */}
          {/* Option 2: Pass totals back up from RevisionDialogContent (complex state management) */}
          {/* Option 3: Call the hook AGAIN here? Seems redundant. */}
          {/* Option 4: Pass necessary form state/methods down to RevisionDialogContent, have IT pass calculated values needed for THIS fullscreenPreviewContent back up or via context? */}
          {/* Let's assume for now we pass the required calculated values somehow or recalculate simply */}
          {/* Recalculating simply for now, although not ideal */}
          {(() => {
            // Basic recalculation for footer within this scope
            const items = form.watch('items') || [];
            const contingencyPercent = Number(form.watch('contingencyPercentage')) || 0;
            const calcSubtotal = items.reduce(
              (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0),
              0
            );
            const calcContingencyAmount = calcSubtotal * (contingencyPercent / 100);
            const calcGrandTotal = calcSubtotal + calcContingencyAmount;
            return (
              <tfoot>
                <tr className="bg-gray-50">
                  <td
                    colSpan={3}
                    className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                  >
                    Subtotal:
                  </td>
                  <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                    ${calcSubtotal.toFixed(2)}
                  </td>
                </tr>
                {contingencyPercent > 0 && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                    >
                      Contingency ({contingencyPercent}%):
                    </td>
                    <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                      ${calcContingencyAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
                    Total:
                  </td>
                  <td className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
                    ${calcGrandTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            );
          })()}
        </table>
      </div>

      <div className="text-gray-600 text-xs">
        <p className="font-medium mb-1">Terms & Conditions:</p>
        <p>This estimate is valid for 30 days from the date issued.</p>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-semibold text-[#0485ea] flex items-center">
              {dialogTitle}
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousStep}
                  className="ml-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <RevisionDialogContent
              form={form}
              saving={saving}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              goToPreviousStep={goToPreviousStep}
              goToNextStep={goToNextStep}
              handleNext={handleNext}
              handleSubmitWithStatus={handleSubmitWithStatus}
              onOpenChange={onOpenChange}
              newRevisionVersion={newRevisionVersion}
              customerName={customerName}
              customerAddress={customerAddress}
              estimateData={estimateData}
              watchedUpdateLocation={watchedUpdateLocation}
              watchedLocation={watchedLocation}
              jobSiteLocation={jobSiteLocation}
              formatLocation={formatLocation}
              zoomLevel={zoomLevel}
              zoomOut={zoomOut}
              zoomIn={zoomIn}
              toggleFullScreen={toggleFullScreen}
              handlePrint={handlePrint}
              handleExport={handleExport}
              printableContentRef={printableContentRef}
              getSubmitButtonIcon={getSubmitButtonIcon}
              getSubmitButtonLabel={getSubmitButtonLabel}
              isFullScreen={isFullScreen}
              handleZoomChange={handleZoomChange}
            />
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Fullscreen preview logic remains here, but needs state/handlers */}
      {/* Note: The FullscreenPreview component itself is defined below */}
      {/* Render the single FullscreenPreview instance here using the content defined above */}
      <FullscreenPreview
        isOpen={isFullScreen}
        onClose={toggleFullScreen}
        content={fullscreenPreviewContent} // Use the content defined in this scope
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onPrint={handlePrint}
        onExport={handleExport}
      />
    </>
  );
};

export default EstimateRevisionDialog;

// Fullscreen Preview Component
const FullscreenPreview: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  content: React.ReactNode;
  zoomLevel: number;
  onZoomChange: (value: number[]) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrint: () => void;
  onExport: () => void;
}> = ({
  isOpen,
  onClose,
  content,
  zoomLevel,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onPrint,
  onExport,
}) => {
  if (!isOpen) return null;

  // Use portal to render outside the normal DOM hierarchy
  return createPortal(
    <div
      className="fixed inset-0 bg-gray-900/80 z-[99999] flex flex-col"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white p-2 flex justify-between items-center shadow-md">
        <h3 className="text-lg font-semibold">Estimate Revision Preview</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mx-4">
            <Button variant="ghost" size="sm" onClick={onZoomOut} className="p-1">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="w-32">
              <Slider
                value={[zoomLevel]}
                onValueChange={onZoomChange}
                min={50}
                max={200}
                step={10}
              />
            </div>
            <Button variant="ghost" size="sm" onClick={onZoomIn} className="p-1">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <span className="text-xs">{zoomLevel}%</span>
          </div>
          <Button variant="outline" size="sm" onClick={onPrint} className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="flex items-center gap-1">
            <Minimize className="h-4 w-4" />
            Exit Fullscreen
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          className="bg-white mx-auto shadow-lg p-6 relative transition-transform duration-100"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          id="printable-estimate"
        >
          {content}
        </div>
      </div>
    </div>,
    document.body
  );
};
