import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import EstimateLineItemsEditor from '../editors/EstimateLineItemsEditor';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { createPortal } from 'react-dom';

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
  revisionItems: any[];
  contingencyPercentage: number;
  updateLocation: boolean;
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  status?: string;
}

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
  const [currentRevisionId, setCurrentRevisionId] = useState<string | null>(null);
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [currentLocation, setCurrentLocation] = useState({
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [estimateData, setEstimateData] = useState<any>({});
  const [totalCost, setTotalCost] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState<string>('draft');
  const { toast } = useToast();

  // Enhanced preview state
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const printableContentRef = useRef<HTMLDivElement>(null);

  const [sourceRevisionIdUsed, setSourceRevisionIdUsed] = useState<string | null>(null);

  const form = useForm<RevisionFormValues>({
    defaultValues: {
      notes: '',
      revisionItems: [],
      contingencyPercentage: 0,
      updateLocation: false,
      location: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      status: 'draft',
    },
  });

  const contingencyPercentage = form.watch('contingencyPercentage');
  const contingencyAmount = subtotal * (parseFloat(contingencyPercentage.toString()) / 100) || 0;
  const grandTotal = subtotal + contingencyAmount;
  const updateLocation = form.watch('updateLocation');

  // Calculate gross margin
  const grossMargin = subtotal - totalCost;
  const grossMarginPercentage = subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;

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
        const items = form.getValues('revisionItems');
        if (!items || items.length === 0) {
          toast({
            title: 'Validation Error',
            description: 'At least one line item is required',
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
    const isValid = await validateCurrentStep();
    if (isValid) {
      goToNextStep();
    }
  }, [validateCurrentStep, goToNextStep]);

  // Determine the version number for the new revision
  const newRevisionVersion = currentVersion + 1;

  // Fetch estimate data and potentially source revision items when the dialog opens
  useEffect(() => {
    if (open && estimateId) {
      console.log('Loading estimate data for ID:', estimateId);
      // Store the source ID used when opening, to prevent re-fetching if props change while open
      setSourceRevisionIdUsed(sourceRevisionId || null);
      const revisionIdToFetchItemsFrom = sourceRevisionId || null;

      // Get estimate data (needed for location, etc.)
      supabase
        .from('estimates')
        .select('*, customers(customername, address, city, state, zip)')
        .eq('estimateid', estimateId)
        .single()
        .then(async ({ data: estimateData, error }) => {
          if (!error && estimateData) {
            console.log('Loaded estimate data:', estimateData);
            setEstimateData(estimateData);

            // Set form defaults (excluding items for now)
            form.reset({
              notes: sourceRevisionId ? `Revision based on v${sourceRevisionVersion}` : '',
              revisionItems: [], // Items will be loaded below
              contingencyPercentage: estimateData.contingency_percentage || 0,
              updateLocation: false,
              location: {
                address: estimateData.sitelocationaddress || '',
                city: estimateData.sitelocationcity || '',
                state: estimateData.sitelocationstate || '',
                zip: estimateData.sitelocationzip || '',
              },
            });

            // Set location details for current location state
            if (estimateData.sitelocationaddress) {
              setCurrentLocation({
                address: estimateData.sitelocationaddress || '',
                city: estimateData.sitelocationcity || '',
                state: estimateData.sitelocationstate || '',
                zip: estimateData.sitelocationzip || '',
              });
            }

            let revisionIdForItems: string | null = null;
            // Determine which revision ID to use for fetching items
            if (revisionIdToFetchItemsFrom) {
              // Use the explicitly provided source revision ID
              console.log(
                'Fetching items based on provided sourceRevisionId:',
                revisionIdToFetchItemsFrom
              );
              revisionIdForItems = revisionIdToFetchItemsFrom;
            } else {
              // If no source ID provided, find the ID of the currently selected revision
              console.log('No sourceRevisionId provided, finding currently selected revision...');
              const { data: selectedRevData, error: selectedRevError } = await supabase
                .from('estimate_revisions')
                .select('id')
                .eq('estimate_id', estimateId)
                .eq('is_selected_for_view', true)
                .single();

              if (!selectedRevError && selectedRevData) {
                console.log('Found selected revision ID:', selectedRevData.id);
                revisionIdForItems = selectedRevData.id;
              } else {
                console.error('Error finding selected revision:', selectedRevError);
                // Fallback: Maybe try latest if selected fails?
                // For now, proceed without items if no source/selected found
              }
            }

            // Store the ID of the revision whose items are being copied
            // (which might be different from the *previously* selected revision if using sourceRevisionId)
            setCurrentRevisionId(revisionIdForItems);

            // Fetch items if we have a valid ID
            if (revisionIdForItems) {
              console.log('Fetching items for revision ID:', revisionIdForItems);
              supabase
                .from('estimate_items')
                .select('*')
                .eq('estimate_id', estimateId)
                .eq('revision_id', revisionIdForItems)
                .then(({ data: itemsData, error: itemsError }) => {
                  if (!itemsError && itemsData) {
                    console.log('Loaded items for revision:', itemsData.length, 'items');
                    setCurrentItems(itemsData);

                    // Pre-populate the revision items
                    const transformedItems = itemsData.map(item => ({
                      ...item,
                      original_id: item.id, // Keep reference to the source item ID
                      id: `new-${Date.now()}-${Math.random()}`, // Temporary ID for the form
                      revision_id: undefined,
                    }));

                    form.setValue('revisionItems', transformedItems);
                    console.log('Set form revision items:', transformedItems.length, 'items');

                    // Explicitly calculate initial totals after setting items
                    const initialSubtotal = transformedItems.reduce(
                      (sum, item) => sum + (Number(item.total_price) || 0),
                      0
                    );
                    const initialTotalCost = transformedItems.reduce(
                      (sum, item) => sum + (Number(item.cost) || 0) * (Number(item.quantity) || 0),
                      0
                    );
                    setSubtotal(initialSubtotal);
                    setTotalCost(initialTotalCost);
                    console.log(
                      `Initial calculation: Subtotal=${initialSubtotal}, TotalCost=${initialTotalCost}`
                    );
                  } else {
                    console.error('Error loading items:', itemsError);
                    toast({
                      title: 'Error loading items',
                      description: 'Could not load items from the source revision.',
                      variant: 'destructive',
                    });
                    form.setValue('revisionItems', []); // Ensure items are empty if load fails
                  }
                });
            } else {
              console.warn(
                'Proceeding without pre-populating items as no valid source revision ID was determined.'
              );
              form.setValue('revisionItems', []); // Ensure items are empty
            }
          } else {
            console.error('Error loading estimate:', error);
            toast({
              title: 'Error Loading Estimate',
              description: 'Could not load base estimate data.',
              variant: 'destructive',
            });
            onOpenChange(false); // Close dialog if base estimate fails
          }
        });
    }
  }, [open, estimateId, sourceRevisionId, sourceRevisionVersion, form, toast, onOpenChange]);

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
  }, [isFullScreen]);

  // Calculate total cost whenever items change
  useEffect(() => {
    const items = form.watch('revisionItems');
    if (items && items.length > 0) {
      const itemsTotalCost = items.reduce((sum, item) => {
        const cost = Number(item.cost) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + cost * quantity;
      }, 0);
      setTotalCost(itemsTotalCost);
    }
  }, [form.watch('revisionItems')]);

  const handleSubmitWithStatus = async (status: string) => {
    setSubmissionStatus(status);
    form.setValue('status', status);
    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!estimateId) return;

    try {
      setSaving(true);
      const values = form.getValues();

      // Calculate total amount for the revision from items
      const totalAmount = values.revisionItems.reduce(
        (sum, item) => sum + (Number(item.total_price) || 0),
        0
      );

      // Check if there are items
      if (values.revisionItems.length === 0) {
        throw new Error('At least one line item is required for a revision');
      }

      // Calculate new version number
      const newVersion = newRevisionVersion;

      // Check if version already exists to prevent duplicates
      const { data: existingVersion, error: versionCheckError } = await supabase
        .from('estimate_revisions')
        .select('id, version')
        .eq('estimate_id', estimateId)
        .eq('version', newVersion)
        .limit(1);

      if (versionCheckError) {
        console.error('Error checking for existing version:', versionCheckError);
      }

      if (existingVersion && existingVersion.length > 0) {
        throw new Error(`Version ${newVersion} already exists. Please refresh and try again.`);
      }

      // 1. Create new revision record with the total amount included
      const { data: revisionData, error: revisionError } = await supabase
        .from('estimate_revisions')
        .insert({
          estimate_id: estimateId,
          version: newVersion,
          revision_date: new Date().toISOString(),
          is_selected_for_view: true,
          notes: values.notes,
          status: values.status || 'draft',
          amount: totalAmount, // Include the amount in the revision record
        })
        .select()
        .single();

      if (revisionError) throw revisionError;

      // 2. Update the previous revision to not be current
      if (currentRevisionId) {
        await supabase
          .from('estimate_revisions')
          .update({ is_selected_for_view: false })
          .eq('id', currentRevisionId);
      }

      // 3. Insert new items linked to this revision
      const items = values.revisionItems.map(item => {
        // Check if this is a temp ID (starts with "new-")
        const isNewItem =
          typeof item.id === 'string' && item.id.startsWith('new-') && !item.original_id;

        // Create a clean copy of the item with only the fields we need
        const cleanItem = {
          description: item.description || '',
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.total_price) || 0,
          cost: Number(item.cost) || 0,
          markup_percentage: Number(item.markup_percentage) || 0,
          markup_amount: Number(item.markup_amount) || 0,
          gross_margin: Number(item.gross_margin) || 0,
          gross_margin_percentage: Number(item.gross_margin_percentage) || 0,
          item_type: item.item_type || 'none',
          notes: item.notes || '',
          document_id: item.document_id || null,
          vendor_id: item.vendor_id || null,
          subcontractor_id: item.subcontractor_id || null,
          item_category: item.item_category || null,

          // These will be set below
          estimate_id: estimateId,
          revision_id: revisionData.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),

          // Set original_item_id correctly
          original_item_id: item.original_id || (isNewItem ? null : item.id),
        };

        return cleanItem;
      });

      // Log for debugging before inserting
      console.log(
        'Items to insert:',
        items.map(item => ({
          description: item.description,
          original_item_id: item.original_item_id,
        }))
      );

      const { error: itemsError } = await supabase.from('estimate_items').insert(items);

      if (itemsError) {
        console.error('Error inserting items:', itemsError);
        console.error('Failed items data:', items);
        throw new Error(`Failed to save line items: ${itemsError.message}`);
      }

      // 4. Update estimate with new total, contingency, and location if needed
      const contingencyAmount = totalAmount * (values.contingencyPercentage / 100);

      const updateData: any = {
        estimateamount: totalAmount,
        contingencyamount: contingencyAmount,
        contingency_percentage: values.contingencyPercentage,
        updated_at: new Date().toISOString(),
        // Set the estimate status to match the revision status
        status: values.status || 'draft',
      };

      // Only update location if the toggle is on
      if (values.updateLocation) {
        updateData.sitelocationaddress = values.location.address;
        updateData.sitelocationcity = values.location.city;
        updateData.sitelocationstate = values.location.state;
        updateData.sitelocationzip = values.location.zip;
      }

      const { error: updateError } = await supabase
        .from('estimates')
        .update(updateData)
        .eq('estimateid', estimateId);

      if (updateError) {
        console.error('Error updating estimate:', updateError);
        throw new Error(`Failed to update estimate: ${updateError.message}`);
      }

      // Verify the items were created correctly by counting them
      const { data: createdItems, error: countError } = await supabase
        .from('estimate_items')
        .select('id')
        .eq('revision_id', revisionData.id);

      if (countError) {
        console.error('Error verifying created items:', countError);
      } else {
        console.log(
          `Verified ${createdItems.length} items created for revision ${revisionData.id}`
        );

        if (createdItems.length !== items.length) {
          console.warn(`Expected ${items.length} items but created ${createdItems.length}`);
        }
      }

      toast({
        title: 'Success',
        description: `Created revision ${newVersion} with ${createdItems?.length || 0} items (${(values.status || 'draft').toUpperCase()})`,
      });

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating revision:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create revision',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Track subtotal from line items editor
  const updateSubtotal = (total: number) => {
    setSubtotal(total);
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
  const jobSiteLocation = formatLocation(currentLocation);

  // Get icon and label for submission button based on status
  const getSubmitButtonIcon = () => {
    switch (submissionStatus) {
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

    switch (submissionStatus) {
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
  const toggleFullScreen = () => {
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
  };

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
  const dialogTitle = sourceRevisionIdUsed
    ? `Create Revision (Based on V${sourceRevisionVersion})`
    : 'Create New Revision';
  const dialogDescription = sourceRevisionIdUsed
    ? `Creating Version ${newRevisionVersion} based on items from Version ${sourceRevisionVersion}.`
    : `Create Version ${newRevisionVersion} of this estimate. The current highest version is ${currentVersion}.`;

  // Content for each step
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

        {updateLocation && (
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
      <div>
        <EstimateLineItemsEditor
          form={form}
          name="revisionItems"
          estimateId={estimateId}
          onSubtotalChange={updateSubtotal}
          hideFinancialSummary={true}
        />
      </div>

      <Card className="bg-[#0485ea]/5">
        <CardContent className="p-4">
          <h3 className="font-medium text-base mb-3">Revision Summary</h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-medium">{formatCurrency(totalCost)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Gross Margin:</span>
              <span className="font-medium">{formatCurrency(grossMargin)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Margin %:</span>
              <span className="font-medium">{grossMarginPercentage.toFixed(1)}%</span>
            </div>

            <div className="border-t pt-2 mt-2">
              <Label htmlFor="contingencyPercentage" className="text-sm mb-1 block">
                Contingency %
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="contingencyPercentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="h-8 text-sm"
                  {...form.register('contingencyPercentage', {
                    valueAsNumber: true,
                    min: 0,
                    max: 100,
                  })}
                />
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(contingencyAmount)}
                </span>
              </div>
            </div>

            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg text-[#0485ea]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
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
                  {jobSiteLocation && jobSiteLocation !== customerAddress && (
                    <>
                      <h3 className="font-semibold text-sm text-gray-700 mt-2 mb-1">
                        Job Site Location:
                      </h3>
                      <p className="text-xs text-gray-600">
                        {form.watch('updateLocation')
                          ? formatLocation(form.watch('location'))
                          : jobSiteLocation}
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
                    {form.watch('revisionItems')?.map((item, index) => (
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
                    {contingencyPercentage > 0 && (
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
            onClick={() => setSubmissionStatus('draft')}
            disabled={saving}
          >
            <Save className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-base">Save as Draft</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-green-100 hover:bg-green-50"
            onClick={() => setSubmissionStatus('sent')}
            disabled={saving}
          >
            <Send className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-base">Send to Customer</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-orange-100 hover:bg-orange-50"
            onClick={() => setSubmissionStatus('pending')}
            disabled={saving}
          >
            <FileCheck className="h-5 w-5 mr-2 text-orange-600" />
            <span className="text-base">Save as Pending Approval</span>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3 border-green-100 hover:bg-green-50"
            onClick={() => setSubmissionStatus('approved')}
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
              onClick={() => handleSubmitWithStatus(submissionStatus)}
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

  // Create fullscreen preview content - a simplified version of the preview
  const fullscreenPreviewContent = (
    <div className="bg-white">
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
          {jobSiteLocation && jobSiteLocation !== customerAddress && (
            <>
              <h3 className="font-semibold text-sm text-gray-700 mt-2 mb-1">Job Site Location:</h3>
              <p className="text-xs text-gray-600">
                {form.watch('updateLocation')
                  ? formatLocation(form.watch('location'))
                  : jobSiteLocation}
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
            {form.watch('revisionItems')?.map((item, index) => (
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
          <tfoot>
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                Subtotal:
              </td>
              <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                ${subtotal.toFixed(2)}
              </td>
            </tr>
            {contingencyPercentage > 0 && (
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                  Contingency ({contingencyPercentage}%):
                </td>
                <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                  ${contingencyAmount.toFixed(2)}
                </td>
              </tr>
            )}
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
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
                      {!isFirstStep && (
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
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Fullscreen preview */}
      <FullscreenPreview
        isOpen={isFullScreen}
        onClose={toggleFullScreen}
        content={fullscreenPreviewContent}
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
