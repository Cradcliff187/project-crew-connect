import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useFieldArray, UseFormReturn, Controller } from 'react-hook-form';
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
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Paperclip,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { EstimateItem } from '@/components/estimates/types/estimateTypes';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';

// Debug flag - set to false to disable console logs
const DEBUG = false;

// Define types for sort functionality
type SortDirection = 'asc' | 'desc';
type SortField =
  | 'description'
  | 'item_type'
  | 'quantity'
  | 'cost'
  | 'markup_percentage'
  | 'unit_price'
  | 'total';

// Fields that trigger financial calculations when changed
const FINANCIAL_FIELDS = ['quantity', 'unit_price', 'cost', 'markup_percentage'];

interface EstimateLineItemsEditorProps {
  form: UseFormReturn<any>;
  name: string;
  estimateId: string;
  onSubtotalChange?: (subtotal: number) => void;
  hideFinancialSummary?: boolean;
}

const EstimateLineItemsEditor: React.FC<EstimateLineItemsEditorProps> = ({
  form,
  name,
  estimateId,
  onSubtotalChange,
  hideFinancialSummary = false,
}) => {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: name,
  });

  // UI State
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [financialUpdateCounter, setFinancialUpdateCounter] = useState(0);

  // Vendor and subcontractor data
  const [vendors, setVendors] = useState<any[]>([]);
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Document attachment state
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState<string | null>(null);

  // Fetch vendors and subcontractors
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Fetch vendors
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .order('vendorname');

        if (!vendorError && vendorData) {
          setVendors(vendorData);
        }

        // Fetch subcontractors
        const { data: subData, error: subError } = await supabase
          .from('subcontractors')
          .select('subid, subname')
          .order('subname');

        if (!subError && subData) {
          setSubcontractors(subData);
        }
      } catch (error) {
        if (DEBUG) {
          console.error('Error fetching vendor/subcontractor data:', error);
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Calculate item values when input changes - only for fields that affect calculations
  const calculateItemValues = useCallback(
    (index: number) => {
      const quantity = Number(form.getValues(`${name}.${index}.quantity`)) || 0;
      const unitPrice = Number(form.getValues(`${name}.${index}.unit_price`)) || 0;
      const cost = Number(form.getValues(`${name}.${index}.cost`)) || 0;

      // Calculate totals
      const totalPrice = quantity * unitPrice;
      const totalCost = quantity * cost;
      const grossMargin = totalPrice - totalCost;
      const grossMarginPercentage = totalPrice > 0 ? (grossMargin / totalPrice) * 100 : 0;

      // Instead of updating the entire item, just set the calculated fields
      form.setValue(`${name}.${index}.total_price`, totalPrice);
      form.setValue(`${name}.${index}.gross_margin`, grossMargin);
      form.setValue(`${name}.${index}.gross_margin_percentage`, grossMarginPercentage);

      // Notify parent of updated subtotal
      if (onSubtotalChange) {
        const subtotal = fields.reduce((sum, item: any, idx) => {
          // Use the form values to calculate subtotal to ensure latest values
          const itemTotal = Number(form.getValues(`${name}.${idx}.total_price`)) || 0;
          return sum + itemTotal;
        }, 0);
        onSubtotalChange(subtotal);
      }

      // Trigger a financial update to refresh the summary
      setFinancialUpdateCounter(prev => prev + 1);
    },
    [fields, form, name, onSubtotalChange]
  );

  // Update unit price when cost or markup changes
  const updateUnitPriceFromMarkup = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`${name}.${index}.cost`)) || 0;
      const markupPercentage = Number(form.getValues(`${name}.${index}.markup_percentage`)) || 0;

      const markupAmount = cost * (markupPercentage / 100);
      const unitPrice = cost + markupAmount;

      // Format to 2 decimal places for consistency
      form.setValue(`${name}.${index}.unit_price`, unitPrice.toFixed(2));

      // Don't call calculateItemValues here to avoid circular updates
      // Instead, we'll calculate total_price directly
      const quantity = Number(form.getValues(`${name}.${index}.quantity`)) || 0;
      const totalPrice = quantity * unitPrice;
      form.setValue(`${name}.${index}.total_price`, totalPrice);

      // Notify parent of updated subtotal after price update
      if (onSubtotalChange) {
        const subtotal = fields.reduce((sum, item: any, idx) => {
          const itemTotal =
            idx === index ? totalPrice : Number(form.getValues(`${name}.${idx}.total_price`)) || 0;
          return sum + itemTotal;
        }, 0);
        onSubtotalChange(subtotal);
      }

      // Trigger a financial update to refresh the summary
      setFinancialUpdateCounter(prev => prev + 1);
    },
    [form, name, fields, onSubtotalChange]
  );

  // Calculate markup from price (reverse calculation)
  const updateMarkupFromPrice = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`${name}.${index}.cost`)) || 0;
      const unitPrice = Number(form.getValues(`${name}.${index}.unit_price`)) || 0;

      // Avoid division by zero
      if (cost > 0) {
        // Calculate markup percentage: (Price - Cost) / Cost * 100
        const markupPercentage = ((unitPrice - cost) / cost) * 100;

        // Format to one decimal place and update the form
        form.setValue(
          `${name}.${index}.markup_percentage`,
          Math.max(0, markupPercentage).toFixed(1)
        );
      }

      // Trigger a financial update to refresh the summary
      setFinancialUpdateCounter(prev => prev + 1);
    },
    [form, name]
  );

  const handleAddItem = useCallback(() => {
    const newItem = {
      id: `new-${Date.now()}`,
      description: '',
      item_type: 'none',
      quantity: 1,
      unit_price: 0,
      cost: 0,
      markup_percentage: 20,
      total_price: 0,
      gross_margin: 0,
      gross_margin_percentage: 0,
      estimate_id: estimateId,
    };

    append(newItem);

    // Trigger a financial update to refresh the summary
    setFinancialUpdateCounter(prev => prev + 1);
  }, [append, estimateId]);

  // Handle item selection
  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === fields.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(fields.map((item: any) => item.id));
    }
  }, [fields, selectedItems]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    // Remove items in reverse order to avoid index shifting issues
    const indexesToRemove = selectedItems
      .map(id => fields.findIndex((field: any) => field.id === id))
      .sort((a, b) => b - a);

    indexesToRemove.forEach(index => {
      if (index !== -1) {
        remove(index);
      }
    });

    setSelectedItems([]);

    toast({
      title: 'Items deleted',
      description: `${indexesToRemove.length} items have been removed from the revision`,
    });

    // Trigger a financial update to refresh the summary
    setFinancialUpdateCounter(prev => prev + 1);
  }, [selectedItems, fields, remove]);

  const handleRowClick = useCallback((index: number) => {
    setActiveRow(index);
  }, []);

  const handleRemoveItem = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      remove(index);
      toast({
        title: 'Item removed',
        description: 'The line item has been removed from the revision',
      });

      // Trigger a financial update to refresh the summary
      setFinancialUpdateCounter(prev => prev + 1);
    },
    [remove]
  );

  // Custom handler for description changes that doesn't trigger financial calculations
  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      form.setValue(`${name}.${index}.description`, value, {
        shouldDirty: true,
      });
    },
    [form, name]
  );

  // Calculate financial summary - memoize to prevent recalculation on every render
  // Only update when fields change or financialUpdateCounter changes
  const financialSummary = useMemo(() => {
    const totalCost = fields.reduce((sum, item: any, idx) => {
      const cost = Number(form.getValues(`${name}.${idx}.cost`)) || 0;
      const quantity = Number(form.getValues(`${name}.${idx}.quantity`)) || 0;
      return sum + cost * quantity;
    }, 0);

    const totalRevenue = fields.reduce((sum, item: any, idx) => {
      return sum + (Number(form.getValues(`${name}.${idx}.total_price`)) || 0);
    }, 0);

    const grossMargin = totalRevenue - totalCost;
    const grossMarginPercentage = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

    return {
      totalCost,
      totalRevenue,
      grossMargin,
      grossMarginPercentage,
    };
  }, [fields, form, name, financialUpdateCounter]);

  // Document attachment functions
  const handleOpenDocumentDialog = useCallback((index: number) => {
    setActiveItemIndex(index);
    setShowDocumentDialog(true);
    setDocumentUploadError(null);
  }, []);

  // Handle document attachment success
  const handleDocumentAttached = useCallback(
    (documentId: string) => {
      if (activeItemIndex !== null && documentId) {
        // Update the line item with the document ID
        form.setValue(`${name}.${activeItemIndex}.document_id`, documentId);

        toast({
          title: 'Document attached',
          description: 'Document has been successfully attached to the line item',
        });

        // Close the dialog
        setShowDocumentDialog(false);
        setActiveItemIndex(null);
      } else {
        setDocumentUploadError('Failed to attach document to line item');
      }
    },
    [activeItemIndex, form, name]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center">
          <h3 className="text-base font-medium mr-2">Line Items ({fields.length})</h3>
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

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCompactView(!isCompactView)}
          >
            {isCompactView ? 'Show Financial Details' : 'Hide Financial Details'}
          </Button>

          {selectedItems.length > 0 && (
            <Button type="button" variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No items added yet. Click "Add Item" to begin.</p>
        </div>
      ) : (
        <>
          <div className="w-full border rounded-md overflow-x-auto">
            <TooltipProvider>
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[40px] pl-2">
                      <Checkbox
                        checked={fields.length > 0 && selectedItems.length === fields.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all items"
                      />
                    </TableHead>
                    <TableHead className="w-[30%]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center">
                            Description
                            <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter a detailed description of the item or service</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-[12%]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center">
                            Type
                            <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Select the type of item. Choose Material to add vendor-supplied items.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    {!isCompactView && (
                      <TableHead className="text-right w-[8%]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-end">
                              Qty
                              <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Number of units</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                    )}
                    {!isCompactView && (
                      <TableHead className="text-right w-[12%]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-end">
                              Cost (USD)
                              <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Your cost per unit in USD</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                    )}
                    {!isCompactView && (
                      <TableHead className="text-right w-[10%]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex items-center justify-end">
                              Markup %
                              <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Percentage added to cost</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                    )}
                    <TableHead className="text-right w-[12%]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center justify-end">
                            Price (USD)
                            <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Price charged per unit in USD</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-right w-[12%]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center justify-end">
                            Total (USD)
                            <HelpCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Quantity × Price in USD</p>
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.length > 0 ? (
                    fields.map((field, index) => {
                      const isSelected = selectedItems.includes(field.id);
                      const itemType = form.watch(`${name}.${index}.item_type`) || 'none';
                      const isVendor = itemType === 'material';
                      const isSubcontractor = itemType === 'subcontractor';
                      const hasDocument = Boolean(form.watch(`${name}.${index}.document_id`));

                      // Get description directly to avoid form field watching
                      const description = form.getValues(`${name}.${index}.description`) || '';

                      return (
                        <TableRow
                          key={field.id}
                          className={
                            isSelected ? 'bg-blue-50' : activeRow === index ? 'bg-muted/20' : ''
                          }
                          onClick={() => handleRowClick(index)}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleSelectItem(field.id)}
                              aria-label={`Select item ${index + 1}`}
                              onClick={e => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* Use controlled component for description to avoid triggering calculations */}
                              <Textarea
                                value={description}
                                onChange={e => handleDescriptionChange(index, e.target.value)}
                                rows={2}
                                className="resize-none"
                                placeholder="Item description"
                              />
                              {hasDocument && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                                >
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  Doc
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={itemType || 'none'}
                              onValueChange={value =>
                                form.setValue(`${name}.${index}.item_type`, value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Select type</SelectItem>
                                <SelectItem value="labor">Labor</SelectItem>
                                <SelectItem value="material">Material</SelectItem>
                                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                                <SelectItem value="fee">Fee</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>

                            {isVendor && vendors.length > 0 && (
                              <Select
                                value={form.watch(`${name}.${index}.vendor_id`) || ''}
                                onValueChange={value =>
                                  form.setValue(`${name}.${index}.vendor_id`, value)
                                }
                              >
                                <SelectTrigger className="w-full mt-2">
                                  <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vendors.map(vendor => (
                                    <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                                      {vendor.vendorname}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {isSubcontractor && subcontractors.length > 0 && (
                              <Select
                                value={form.watch(`${name}.${index}.subcontractor_id`) || ''}
                                onValueChange={value =>
                                  form.setValue(`${name}.${index}.subcontractor_id`, value)
                                }
                              >
                                <SelectTrigger className="w-full mt-2">
                                  <SelectValue placeholder="Select subcontractor" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subcontractors.map(sub => (
                                    <SelectItem key={sub.subid} value={sub.subid}>
                                      {sub.subname}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          {!isCompactView && (
                            <TableCell className="text-right">
                              <Input
                                {...form.register(`${name}.${index}.quantity`)}
                                type="number"
                                min="1"
                                step="1"
                                className="text-right"
                                onBlur={() => calculateItemValues(index)}
                              />
                            </TableCell>
                          )}
                          {!isCompactView && (
                            <TableCell className="text-right">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                                  $
                                </span>
                                <Input
                                  {...form.register(`${name}.${index}.cost`)}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="text-right font-medium text-base pl-6"
                                  placeholder="0.00"
                                  onBlur={e => {
                                    // Format to 2 decimal places on blur
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) {
                                      const formatted = value.toFixed(2);
                                      form.setValue(`${name}.${index}.cost`, formatted);
                                    }
                                    updateUnitPriceFromMarkup(index);
                                  }}
                                />
                              </div>
                            </TableCell>
                          )}
                          {!isCompactView && (
                            <TableCell className="text-right">
                              <Input
                                {...form.register(`${name}.${index}.markup_percentage`)}
                                type="number"
                                min="0"
                                step="0.1"
                                className="text-right"
                                placeholder="Markup %"
                                onBlur={e => {
                                  // Format to 1 decimal place on blur
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    const formatted = value.toFixed(1);
                                    form.setValue(`${name}.${index}.markup_percentage`, formatted);
                                  }
                                  updateUnitPriceFromMarkup(index);
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                                $
                              </span>
                              <Input
                                {...form.register(`${name}.${index}.unit_price`)}
                                type="number"
                                min="0"
                                step="0.01"
                                className="text-right font-medium text-base pl-6"
                                placeholder="0.00"
                                onBlur={e => {
                                  // Format to 2 decimal places on blur
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    const formatted = value.toFixed(2);
                                    form.setValue(`${name}.${index}.unit_price`, formatted);

                                    // When price changes directly, update the markup percentage
                                    updateMarkupFromPrice(index);
                                  }
                                  calculateItemValues(index);
                                }}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-base pr-4">
                            <div className="inline-flex items-center justify-end">
                              <span className="text-gray-500 mr-0.5">$</span>
                              {(
                                Number(form.getValues(`${name}.${index}.total_price`)) || 0
                              ).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
                                title={hasDocument ? 'Replace Document' : 'Attach Document'}
                                onClick={() => handleOpenDocumentDialog(index)}
                              >
                                <Paperclip className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                title="Delete Item"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRemoveItem(e, index);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={isCompactView ? 5 : 8} className="h-24 text-center">
                        No items
                        <div className="mt-2">
                          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                            Add your first item
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>

          {fields.length > 0 && !hideFinancialSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-50 p-3 border rounded-md">
                <h4 className="text-sm font-medium text-[#0485ea] mb-2">Financial Summary</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Total Cost</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(financialSummary.totalCost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total Revenue</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(financialSummary.totalRevenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Gross Margin</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(financialSummary.grossMargin)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Margin %</div>
                    <div className="text-sm font-medium">
                      {financialSummary.grossMarginPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Document Upload Dialog */}
      <Dialog
        open={showDocumentDialog}
        onOpenChange={open => {
          if (!open) {
            setDocumentUploadError(null);
            // Only reset active item index when dialog is closed by user
            // not when it's closed programmatically after success
            if (showDocumentDialog) {
              setActiveItemIndex(null);
            }
          }
          setShowDocumentDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Attach Document to Line Item</DialogTitle>
            <DialogDescription>Upload a document to attach to this line item.</DialogDescription>
          </DialogHeader>

          {documentUploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{documentUploadError}</AlertDescription>
            </Alert>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            {activeItemIndex !== null && (
              <>
                <div className="text-xs text-gray-500 mb-2">
                  Using estimate ID: {estimateId || 'pending'}
                </div>
                <EnhancedDocumentUpload
                  entityType="ESTIMATE_ITEM"
                  entityId={estimateId}
                  onSuccess={handleDocumentAttached}
                  onCancel={() => setShowDocumentDialog(false)}
                  preventFormPropagation={true}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default React.memo(EstimateLineItemsEditor);
