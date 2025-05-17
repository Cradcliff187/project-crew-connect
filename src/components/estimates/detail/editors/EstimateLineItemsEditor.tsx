import React, { useCallback, useState, useEffect, useMemo, useRef, memo } from 'react';
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
import { calcMarkup } from '@/utils/finance';

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
  hideFinancialSummary?: boolean;
}

const EstimateLineItemsEditor: React.FC<EstimateLineItemsEditorProps> = ({
  form,
  name,
  estimateId,
  hideFinancialSummary = false,
}) => {
  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const defaultMarkupPercentage = 30; // Default markup percentage for new items

  const { fields, append, remove, update } = useFieldArray<
    any, // Keep the form values type as any for now, unless a specific form type is available
    string, // Keep the field array name type as string
    'id' // Key name defaults to 'id'
  >({
    control: form.control,
    name: name,
    // No need to specify keyName if it's 'id'
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

  // Calculate totals for the line items
  const calculateTotals = useCallback(() => {
    const currentItems = getValues(name) || [];
    const { subtotal, totalCost } = currentItems.reduce(
      (acc, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitCost = Number(item.unit_cost) || 0;
        const markupPercentage = Number(item.markup_percentage) || 0;

        const itemCost = quantity * unitCost;
        const { finalPrice } = calcMarkup(itemCost, markupPercentage);

        return {
          subtotal: acc.subtotal + finalPrice,
          totalCost: acc.totalCost + itemCost,
        };
      },
      { subtotal: 0, totalCost: 0 }
    );

    // Trigger financial update counter
    setFinancialUpdateCounter(prev => prev + 1);
  }, [getValues, name]);

  // Calculate item values when input changes - only for fields that affect calculations
  const calculateItemValues = useCallback(
    (index: number) => {
      const quantity = Number(form.getValues(`${name}.${index}.quantity`)) || 0;
      const unitPrice = Number(form.getValues(`${name}.${index}.unit_price`)) || 0;
      const cost = Number(form.getValues(`${name}.${index}.cost`)) || 0;

      // Calculate totals
      const totalPrice = quantity * unitPrice;

      // Only set total price directly from here, others are handled elsewhere
      form.setValue(`${name}.${index}.total_price`, totalPrice.toFixed(2), {
        shouldValidate: false,
        shouldDirty: true,
      });

      // Trigger a financial update to refresh the summary if needed by parent
      setFinancialUpdateCounter(prev => prev + 1);
    },
    [form, name, setFinancialUpdateCounter]
  );

  // Update unit price when cost or markup changes
  const updateUnitPriceFromMarkup = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`${name}.${index}.cost`)) || 0;
      const markupPercentage = Number(form.getValues(`${name}.${index}.markup_percentage`)) || 0;

      const { finalPrice } = calcMarkup(cost, markupPercentage);

      // Format to 2 decimal places for consistency
      form.setValue(`${name}.${index}.unit_price`, finalPrice.toFixed(2), {
        shouldValidate: false,
        shouldDirty: true,
      });

      // Also update total price immediately after unit price changes
      const quantity = Number(form.getValues(`${name}.${index}.quantity`)) || 0;
      const totalPrice = quantity * finalPrice;
      form.setValue(`${name}.${index}.total_price`, totalPrice.toFixed(2), {
        shouldValidate: false,
        shouldDirty: true,
      });

      // Trigger a financial update to refresh the summary if needed by parent
      setFinancialUpdateCounter(prev => prev + 1);
    },
    [form, name, setFinancialUpdateCounter]
  );

  // Calculate markup from price (reverse calculation)
  const updateMarkupFromPrice = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`${name}.${index}.cost`)) || 0;
      const unitPrice = Number(form.getValues(`${name}.${index}.unit_price`)) || 0;

      // Avoid division by zero
      if (cost > 0) {
        const markupPercentage = ((unitPrice - cost) / cost) * 100;
        form.setValue(
          `${name}.${index}.markup_percentage`,
          Math.max(0, markupPercentage).toFixed(1), // Format to 1 decimal
          { shouldValidate: false, shouldDirty: true }
        );
      } else {
        form.setValue(`${name}.${index}.markup_percentage`, '0', {
          // Set to string '0' for consistency if needed
          shouldValidate: false,
          shouldDirty: true,
        });
      }
    },
    [form, name]
  );

  // Add new item handler
  const handleAddItem = () => {
    // Generate IDs for the new item
    const newId = `new-${Date.now()}-${Math.random()}`;

    // Create a new empty item with string values (important for form handling)
    const newItem = {
      id: newId,
      description: '', // Empty description that user will fill in
      category: '',
      quantity: '1', // String values for form compatibility
      unit_price: '0',
      total_price: 0,
      cost: '0',
      markup_percentage: String(defaultMarkupPercentage || 0),
      item_type: 'none',
      estimate_id: estimateId,
      _isNewlyAdded: true,
    };

    // Add the item to the field array without triggering validation
    append(newItem);

    // Force update calculation - but wait a moment to avoid rerender collision
    setTimeout(() => {
      calculateTotals();
    }, 10);

    // Log for debugging
    if (DEBUG) {
      console.log('Added new item:', newItem);
      console.log('Current fields length:', fields.length);
    }

    // Focus on the new item after rendering - with slightly longer delay
    setTimeout(() => {
      try {
        // We need to use DOM query since the fields array isn't updated immediately
        const rows = document.querySelectorAll('[data-row-index]');
        if (rows && rows.length > 0) {
          // Target the last row (most recently added)
          const lastRowIndex = rows.length - 1;
          const lastRow = rows[lastRowIndex];

          if (lastRow) {
            // Find and focus the textarea in this row
            const textarea = lastRow.querySelector('textarea');
            if (textarea) {
              // Set focus and position cursor
              textarea.focus();
              // Place cursor at the end
              const len = textarea.value?.length || 0;
              textarea.setSelectionRange(len, len);
              // Clear activeRow to avoid selection interference
              setActiveRow(null);
            }
          }
        }
      } catch (error) {
        console.error('Error focusing new row:', error);
      }
    }, 150);
  };

  // Handle item selection
  const handleSelectItem = useCallback((id: string, e?: React.MouseEvent) => {
    // Stop event propagation to prevent focus issues
    if (e) {
      e.stopPropagation();
    }

    // Update selected items - do this in a way that guarantees state update
    setSelectedItems(prev => {
      const isCurrentlySelected = prev.includes(id);
      const newSelection = isCurrentlySelected
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id];

      if (DEBUG) {
        console.log(
          'Selection changed:',
          id,
          isCurrentlySelected ? 'removed' : 'added',
          'New selection:',
          newSelection
        );
      }

      return newSelection;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    setSelectedItems(prev => {
      // If all items are currently selected, clear selection
      if (fields.length > 0 && prev.length === fields.length) {
        if (DEBUG) console.log('Deselecting all items');
        return [];
      }
      // Otherwise select all items
      else {
        const allIds = fields.map((item: any) => item.id);
        if (DEBUG) console.log('Selecting all items:', allIds);
        return allIds;
      }
    });
  }, [fields]);

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

  const handleRowClick = useCallback(
    (index: number, e: React.MouseEvent) => {
      // Don't trigger row selection when clicking on form elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).closest('input') ||
        (e.target as HTMLElement).closest('select') ||
        (e.target as HTMLElement).closest('textarea') ||
        (e.target as HTMLElement).closest('button')
      ) {
        return;
      }

      setActiveRow(index);
    },
    [setActiveRow]
  );

  // New function to directly set active row without click checks
  const handleSetActiveRow = useCallback(
    (index: number) => {
      setActiveRow(index === activeRow ? null : index);
    },
    [activeRow, setActiveRow]
  );

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
                    fields.map((field: EstimateItem, index) => {
                      const isSelected = selectedItems.includes(field.id);
                      const itemType = form.watch(`${name}.${index}.item_type`) || 'none';
                      const isVendor = itemType === 'material';
                      const isSubcontractor = itemType === 'subcontractor';
                      const hasDocument = Boolean(form.watch(`${name}.${index}.document_id`));

                      return (
                        <TableRow
                          key={field.id}
                          data-row-index={index}
                          className={
                            isSelected ? 'bg-blue-50' : activeRow === index ? 'bg-muted/20' : ''
                          }
                        >
                          <TableCell className="relative">
                            <div className="z-10 flex items-center gap-1">
                              <Checkbox
                                checked={selectedItems.includes(field.id)}
                                onCheckedChange={() => handleSelectItem(field.id)}
                                aria-label={`Select item ${index + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-full"
                                onClick={() => handleSetActiveRow(index)}
                              >
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-left">
                            <Textarea
                              rows={2}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                              placeholder="Item description (required)"
                              {...form.register(`${name}.${index}.description`)}
                              onClick={e => e.stopPropagation()}
                              onMouseDown={e => e.stopPropagation()}
                              onKeyDown={e => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="text-left">
                            <div
                              onClick={e => e.stopPropagation()}
                              onMouseDown={e => e.stopPropagation()}
                            >
                              <Select
                                value={itemType}
                                onValueChange={value => {
                                  form.setValue(`${name}.${index}.item_type`, value);
                                }}
                              >
                                <SelectTrigger className="w-[100px]">
                                  <SelectValue placeholder="Select item type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="material">Material</SelectItem>
                                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                                  <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          {!isCompactView && (
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                {...form.register(`${name}.${index}.quantity`, {
                                  valueAsNumber: true,
                                })}
                                step="1"
                                min="0"
                                onClick={e => e.stopPropagation()}
                                onMouseDown={e => e.stopPropagation()}
                                onBlur={() => {
                                  calculateItemValues(index);
                                }}
                                className="w-[80px] text-right"
                              />
                            </TableCell>
                          )}
                          {!isCompactView && (
                            <TableCell className="text-right">
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  {...form.register(`${name}.${index}.cost`, {
                                    valueAsNumber: true,
                                  })}
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  onClick={e => e.stopPropagation()}
                                  onMouseDown={e => e.stopPropagation()}
                                  onBlur={e => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) {
                                      form.setValue(`${name}.${index}.cost`, value.toFixed(2), {
                                        shouldValidate: false,
                                        shouldDirty: true,
                                      });
                                    }
                                    updateUnitPriceFromMarkup(index);
                                  }}
                                  className="w-[100px] text-right pl-6"
                                />
                              </div>
                            </TableCell>
                          )}
                          {!isCompactView && (
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                {...form.register(`${name}.${index}.markup_percentage`, {
                                  valueAsNumber: true,
                                })}
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                                onClick={e => e.stopPropagation()}
                                onMouseDown={e => e.stopPropagation()}
                                onBlur={e => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    form.setValue(
                                      `${name}.${index}.markup_percentage`,
                                      value.toFixed(1),
                                      { shouldValidate: false, shouldDirty: true }
                                    );
                                  }
                                  updateUnitPriceFromMarkup(index);
                                }}
                                className="w-[80px] text-right"
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                $
                              </span>
                              <Input
                                type="number"
                                {...form.register(`${name}.${index}.unit_price`, {
                                  valueAsNumber: true,
                                })}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                onClick={e => e.stopPropagation()}
                                onMouseDown={e => e.stopPropagation()}
                                onBlur={e => {
                                  const value = parseFloat(e.target.value);
                                  if (!isNaN(value)) {
                                    form.setValue(`${name}.${index}.unit_price`, value.toFixed(2), {
                                      shouldValidate: false,
                                      shouldDirty: true,
                                    });
                                  }
                                  updateMarkupFromPrice(index);
                                  calculateItemValues(index);
                                }}
                                className="w-[100px] text-right pl-6"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="px-3 py-2 text-sm text-right">
                              {formatCurrency(form.watch(`${name}.${index}.total_price`) || 0)}
                            </div>
                          </TableCell>
                          <TableCell className="w-[50px]">
                            {hasDocument && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenDocumentDialog(index);
                                }}
                              >
                                <Paperclip className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center">
                        No items added yet. Click "Add Item" to begin.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </>
      )}
    </div>
  );
};

export default EstimateLineItemsEditor;
