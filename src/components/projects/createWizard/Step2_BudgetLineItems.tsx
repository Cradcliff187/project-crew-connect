import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  Controller,
  useFormContext,
  FormProvider,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Paperclip, HelpCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
import {
  mapExpenseTypeToBudgetCategory,
  expenseTypeRequiresVendor,
  expenseTypeAllowsSubcontractor,
} from '@/constants/expenseTypes';
import { getSubcontractorDisplayName } from '@/components/subcontractors/utils/displayName';

// --- Define Budget Item Schema ---
const budgetItemSchema = z.object({
  id: z.string().optional(), // For existing items, or generated for new
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.preprocess(
    val => (val === '' || val === null ? 1 : Number(val)),
    z.number().min(0.01, 'Quantity must be positive').default(1)
  ),
  cost: z.preprocess(
    val => (val === '' || val === null ? 0 : Number(val)),
    z.number().min(0, 'Cost must be non-negative').default(0)
  ),
  markup_percentage: z.preprocess(
    val => (val === '' || val === null ? 0 : Number(val)),
    z.number().min(0, 'Markup must be non-negative').default(20) // Default markup?
  ),
  // Calculated fields - not directly edited but need defaults for form
  unit_price: z.number().default(0),
  estimated_amount: z.number().default(0), // This is the key value (total_price in estimates)
  document_id: z.string().optional().nullable(),
  vendor_id: z.string().optional().nullable(),
  subcontractor_id: z.string().optional().nullable(),
});

export type BudgetItemFormValues = z.infer<typeof budgetItemSchema>;

// --- Define Step 2 Form Schema ---
const step2Schema = z.object({
  budgetItems: z.array(budgetItemSchema).min(1, 'At least one budget item is required.'),
});

export type Step2FormValues = z.infer<typeof step2Schema>;

// --- Budget Categories aligned with expense types ---
const BUDGET_CATEGORIES = [
  { value: 'Materials', label: 'Materials' },
  { value: 'Labor', label: 'Labor' },
  { value: 'Subcontractors', label: 'Subcontractors' },
  { value: 'Equipment', label: 'Equipment Rental' },
  { value: 'Tools', label: 'Tools' },
  { value: 'Supplies', label: 'Supplies' },
  { value: 'Permits', label: 'Permits & Fees' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Office', label: 'Office' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Other', label: 'Other' },
];

// Categories that require a vendor
const VENDOR_CATEGORIES = ['Materials', 'Equipment', 'Tools', 'Supplies', 'Utilities'];
// Categories that require a subcontractor
const SUBCONTRACTOR_CATEGORIES = ['Subcontractors'];

interface Step2Props {
  formData: any; // Contains data from Step 1
  onNext: (data: Step2FormValues) => void;
  wizardFormActions: {
    triggerSubmit: () => void;
  };
}

const Step2_BudgetLineItems: React.FC<Step2Props> = ({ formData, onNext, wizardFormActions }) => {
  const form = useForm<Step2FormValues>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      budgetItems: formData.budgetItems || [], // Initialize with data from previous steps/load
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'budgetItems',
  });

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);

  const [vendors, setVendors] = useState<{ vendorid: string; vendorname: string }[]>([]);
  const [subcontractors, setSubcontractors] = useState<{ subid: string; subname: string }[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingSubcontractors, setLoadingSubcontractors] = useState(false);

  // Fetch vendors and subcontractors on component mount
  useEffect(() => {
    const fetchVendorsAndSubcontractors = async () => {
      setLoadingVendors(true);
      setLoadingSubcontractors(true);

      try {
        // Fetch vendors
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .order('vendorname');

        if (vendorError) throw vendorError;
        setVendors(vendorData || []);

        // Fetch subcontractors
        const { data: subData, error: subError } = await supabase
          .from('subcontractors')
          .select('subid, subname')
          .order('subname');

        if (subError) throw subError;
        setSubcontractors(subData || []);
      } catch (error) {
        console.error('Error fetching vendors/subcontractors:', error);
        toast({
          title: 'Error loading data',
          description: 'Could not load vendors or subcontractors.',
          variant: 'destructive',
        });
      } finally {
        setLoadingVendors(false);
        setLoadingSubcontractors(false);
      }
    };

    fetchVendorsAndSubcontractors();
  }, []);

  // --- Calculation Logic (adapted from Estimate Editor) ---
  const calculateItemTotals = useCallback(
    (index: number) => {
      const quantity = Number(form.getValues(`budgetItems.${index}.quantity`)) || 0;
      const unitPrice = Number(form.getValues(`budgetItems.${index}.unit_price`)) || 0;
      const estimatedAmount = quantity * unitPrice;
      form.setValue(`budgetItems.${index}.estimated_amount`, estimatedAmount);
      // Trigger re-render or summary update if needed
    },
    [form]
  );

  const updateUnitPriceFromMarkup = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`budgetItems.${index}.cost`)) || 0;
      const markupPercentage =
        Number(form.getValues(`budgetItems.${index}.markup_percentage`)) || 0;
      const markupAmount = cost * (markupPercentage / 100);
      const unitPrice = cost + markupAmount;
      form.setValue(`budgetItems.${index}.unit_price`, parseFloat(unitPrice.toFixed(2)));
      calculateItemTotals(index); // Recalculate total after price update
    },
    [form, calculateItemTotals]
  );

  const updateMarkupFromPrice = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`budgetItems.${index}.cost`)) || 0;
      const unitPrice = Number(form.getValues(`budgetItems.${index}.unit_price`)) || 0;
      if (cost > 0) {
        const markupPercentage = ((unitPrice - cost) / cost) * 100;
        form.setValue(
          `budgetItems.${index}.markup_percentage`,
          parseFloat(Math.max(0, markupPercentage).toFixed(1))
        );
      } else {
        // If cost is 0, markup is irrelevant, maybe set to 0?
        form.setValue(`budgetItems.${index}.markup_percentage`, 0);
      }
      // No need to call calculateItemTotals here as price didn't change markup
    },
    [form]
  );

  // --- Item Management ---
  const handleAddItem = useCallback(() => {
    append({
      id: `new-${Date.now()}`,
      category: BUDGET_CATEGORIES[0].value, // Default category
      description: '',
      quantity: 1,
      cost: 0,
      markup_percentage: 20,
      unit_price: 0, // Will be calculated
      estimated_amount: 0, // Will be calculated
      document_id: null,
      vendor_id: null,
      subcontractor_id: null,
    });
  }, [append]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      remove(index);
      // Maybe remove from selectedItems if present
      setSelectedItems(prev => prev.filter(id => id !== fields[index]?.id));
    },
    [remove, fields]
  );

  const handleBulkDelete = useCallback(() => {
    const indexesToRemove = selectedItems
      .map(id => fields.findIndex(field => field.id === id))
      .filter(index => index !== -1) // Ensure index is found
      .sort((a, b) => b - a);

    indexesToRemove.forEach(index => remove(index));
    setSelectedItems([]);
    toast({ title: 'Items Deleted', description: `${indexesToRemove.length} items removed.` });
  }, [selectedItems, fields, remove]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === fields.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(fields.map(item => item.id));
    }
  }, [fields, selectedItems]);

  // --- Document Handling Callbacks ---
  const handleOpenDocumentDialog = useCallback((index: number) => {
    setActiveItemIndex(index);
    setShowDocumentDialog(true);
    setDocumentUploadError(null); // Reset error on open
  }, []);

  const handleDocumentAttached = useCallback(
    (documentId: string) => {
      if (activeItemIndex !== null && documentId) {
        form.setValue(`budgetItems.${activeItemIndex}.document_id`, documentId);
        toast({
          title: 'Document attached',
          description: 'Document successfully attached to line item.',
        });
        setShowDocumentDialog(false);
        setActiveItemIndex(null);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to get document ID after upload.',
          variant: 'destructive',
        });
        setDocumentUploadError('Failed to attach document.'); // Keep dialog open to show error?
      }
    },
    [activeItemIndex, form]
  );

  // --- Link to Wizard Footer Button ---
  useEffect(() => {
    wizardFormActions.triggerSubmit = form.handleSubmit(onNext);
  }, [form, onNext, wizardFormActions]);

  // --- Financial Summary ---
  const totalEstimatedAmount = useMemo(() => {
    return fields.reduce((sum, item, idx) => {
      // Use form values for accuracy
      return sum + (Number(form.getValues(`budgetItems.${idx}.estimated_amount`)) || 0);
    }, 0);
  }, [fields, form]);

  // Initial calculation for default/loaded items
  useEffect(() => {
    fields.forEach((_, index) => {
      updateUnitPriceFromMarkup(index);
    });
  }, [fields, updateUnitPriceFromMarkup]);

  // Helper to determine whether to show vendor/subcontractor fields
  const shouldShowVendorField = useCallback((category: string) => {
    return VENDOR_CATEGORIES.includes(category);
  }, []);

  const shouldShowSubcontractorField = useCallback((category: string) => {
    return SUBCONTRACTOR_CATEGORIES.includes(category);
  }, []);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center">
            <h3 className="text-base font-medium mr-2">Budget Line Items ({fields.length})</h3>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleAddItem}
              className="bg-[#0485ea] text-white hover:bg-[#0375d1]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          {selectedItems.length > 0 && (
            <Button type="button" variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedItems.length})
            </Button>
          )}
        </div>

        {/* Table Section */}
        {fields.length === 0 ? (
          <div className="text-center py-8 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">
              No budget items added yet. Click "Add Item" to begin.
            </p>
          </div>
        ) : (
          <div className="w-full border rounded-md overflow-x-auto">
            <TooltipProvider>
              <Table className="min-w-[1000px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[40px] pl-2 sticky left-0 bg-muted/30 z-10">
                      <Checkbox
                        checked={fields.length > 0 && selectedItems.length === fields.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all items"
                      />
                    </TableHead>
                    <TableHead className="w-[35%] min-w-[300px] sticky left-[40px] bg-muted/30 z-10">
                      Description
                    </TableHead>
                    <TableHead className="w-[15%]">Category</TableHead>
                    <TableHead className="w-[15%]">Provider</TableHead>
                    <TableHead className="text-right w-[7%]">Qty</TableHead>
                    <TableHead className="text-right w-[10%]">Cost</TableHead>
                    <TableHead className="text-right w-[10%]">Markup %</TableHead>
                    <TableHead className="text-right w-[10%]">Unit Price</TableHead>
                    <TableHead className="text-right w-[10%]">Estimated Amt</TableHead>
                    <TableHead className="w-[40px]">Docs</TableHead>
                    <TableHead className="w-[40px] pr-2">Actns</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => {
                    const category = form.watch(`budgetItems.${index}.category`);
                    const showVendor = shouldShowVendorField(category);
                    const showSubcontractor = shouldShowSubcontractorField(category);

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/10">
                        <TableCell className="pl-2 sticky left-0 bg-background z-10">
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={checked => {
                              if (checked) {
                                setSelectedItems(prev => [...prev, item.id]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                            aria-label={`Select item ${index + 1}`}
                          />
                        </TableCell>
                        <TableCell className="sticky left-[40px] bg-background z-10">
                          <Textarea
                            {...form.register(`budgetItems.${index}.description`)}
                            placeholder="Item description..."
                            className="min-h-[60px] resize-y border shadow-sm"
                            rows={2}
                          />
                          <Controller
                            name={`budgetItems.${index}.description`}
                            control={form.control}
                            render={({ fieldState: { error } }) =>
                              error ? (
                                <p className="text-xs text-destructive mt-1">{error.message}</p>
                              ) : null
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Controller
                            control={form.control}
                            name={`budgetItems.${index}.category`}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Category..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BUDGET_CATEGORIES.map(cat => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {error && (
                                  <p className="text-xs text-destructive mt-1">{error.message}</p>
                                )}
                              </>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {showVendor && (
                            <Controller
                              control={form.control}
                              name={`budgetItems.${index}.vendor_id`}
                              render={({ field }) => (
                                <Select
                                  value={field.value || 'none'}
                                  onValueChange={val => field.onChange(val === 'none' ? null : val)}
                                  disabled={loadingVendors}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Select vendor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No Vendor</SelectItem>
                                    {vendors.map(vendor => (
                                      <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                                        {vendor.vendorname}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          )}
                          {showSubcontractor && (
                            <Controller
                              control={form.control}
                              name={`budgetItems.${index}.subcontractor_id`}
                              render={({ field }) => (
                                <Select
                                  value={field.value || 'none'}
                                  onValueChange={val => field.onChange(val === 'none' ? null : val)}
                                  disabled={loadingSubcontractors}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Select sub" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No Subcontractor</SelectItem>
                                    {subcontractors.map(sub => (
                                      <SelectItem key={sub.subid} value={sub.subid}>
                                        {getSubcontractorDisplayName(sub)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            {...form.register(`budgetItems.${index}.quantity`)}
                            type="number"
                            min="0.01"
                            step="any"
                            className="text-right w-16"
                            onBlur={() => updateUnitPriceFromMarkup(index)}
                          />
                          <Controller
                            name={`budgetItems.${index}.quantity`}
                            control={form.control}
                            render={({ fieldState: { error } }) =>
                              error ? (
                                <p className="text-xs text-destructive mt-1">{error.message}</p>
                              ) : null
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            {...form.register(`budgetItems.${index}.cost`)}
                            type="number"
                            min="0"
                            step="any"
                            className="text-right w-24"
                            placeholder="0.00"
                            onBlur={() => updateUnitPriceFromMarkup(index)}
                          />
                          <Controller
                            name={`budgetItems.${index}.cost`}
                            control={form.control}
                            render={({ fieldState: { error } }) =>
                              error ? (
                                <p className="text-xs text-destructive mt-1">{error.message}</p>
                              ) : null
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            {...form.register(`budgetItems.${index}.markup_percentage`)}
                            type="number"
                            min="0"
                            step="any"
                            className="text-right w-20"
                            placeholder="%"
                            onBlur={() => updateUnitPriceFromMarkup(index)}
                          />
                          <Controller
                            name={`budgetItems.${index}.markup_percentage`}
                            control={form.control}
                            render={({ fieldState: { error } }) =>
                              error ? (
                                <p className="text-xs text-destructive mt-1">{error.message}</p>
                              ) : null
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="relative w-24 mx-auto">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              {...form.register(`budgetItems.${index}.unit_price`)}
                              type="number"
                              className="text-right pl-6 bg-muted/50 border-none w-full"
                              readOnly
                              tabIndex={-1}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium pr-4">
                          <span className="inline-block w-24 text-right">
                            {formatCurrency(
                              form.watch(`budgetItems.${index}.estimated_amount`) || 0
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDocumentDialog(index)}
                            className={
                              form.watch(`budgetItems.${index}.document_id`)
                                ? 'text-green-600 hover:text-green-700'
                                : 'text-muted-foreground'
                            }
                            title={
                              form.watch(`budgetItems.${index}.document_id`)
                                ? 'Document attached'
                                : 'Attach document'
                            }
                          >
                            {form.watch(`budgetItems.${index}.document_id`) ? (
                              <Paperclip className="h-4 w-4 stroke-current stroke-2" />
                            ) : (
                              <Paperclip className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-center pr-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        )}

        {/* Summary Row */}
        {fields.length > 0 && (
          <div className="flex justify-end mt-4 pr-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Estimated Budget</p>
              <p className="text-xl font-semibold text-[#0485ea]">
                {formatCurrency(totalEstimatedAmount)}
              </p>
            </div>
          </div>
        )}

        {/* Hidden submit for Enter key */}
        <button type="submit" style={{ display: 'none' }} aria-hidden="true"></button>

        {/* Display form errors */}
        {form.formState.errors.budgetItems?.message && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.budgetItems.message}
          </p>
        )}
        {form.formState.errors.budgetItems?.root?.message && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.budgetItems.root.message}
          </p>
        )}
      </form>

      {/* --- Document Upload Dialog --- */}
      {showDocumentDialog && activeItemIndex !== null && (
        <Dialog
          open={showDocumentDialog}
          onOpenChange={() => {
            setShowDocumentDialog(false);
            setActiveItemIndex(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attach Document to Line Item #{activeItemIndex + 1}</DialogTitle>
              <DialogDescription>
                Upload a document to attach to this budget line item.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <EnhancedDocumentUpload
                entityType="PROJECT"
                entityId={fields[activeItemIndex]?.id || 'new'}
                onSuccess={handleDocumentAttached}
                onCancel={() => {
                  setShowDocumentDialog(false);
                  setActiveItemIndex(null);
                }}
              />
              {documentUploadError && (
                <p className="text-sm text-destructive mt-2">{documentUploadError}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </FormProvider>
  );
};

export default Step2_BudgetLineItems;
