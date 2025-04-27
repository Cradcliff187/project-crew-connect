import React, { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Paperclip,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEstimateItemData } from './estimate-items/useEstimateItemData';
import { PaperclipIcon } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Function to generate UUID (use browser crypto if available)
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // Fallback for environments without crypto.randomUUID (less robust)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
};

// Add this type to support the additional tracking properties we're adding
interface ExtendedEstimateItem {
  original_id?: string;
  _isDeleted?: boolean;
  _isModified?: boolean;
  _isNewlyAdded?: boolean;
  description?: string;
  item_type?: string;
  quantity?: string;
  cost?: string;
  markup_percentage?: string;
  unit_price?: string;
  temp_item_id?: string;
  vendor_id?: string;
  subcontractor_id?: string;
  document_id?: string;
  trade_type?: string;
  expense_type?: string;
  custom_type?: string;
  notes?: string;
  total_price?: number;
}

const ITEMS_PER_PAGE = 10;

type SortDirection = 'asc' | 'desc';
type SortField =
  | 'description'
  | 'item_type'
  | 'quantity'
  | 'cost'
  | 'markup_percentage'
  | 'unit_price'
  | 'total';

const EstimateItemFields = memo(() => {
  const form = useFormContext<EstimateFormValues>();
  const { vendors, subcontractors, loading } = useEstimateItemData();

  // State for table features - removed search and filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCompactView, setIsCompactView] = useState(false);

  // State for document upload
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
    shouldUnregister: false,
  });

  // Cast fields to our extended type for proper type checking
  const typedFields = fields as unknown as Array<ExtendedEstimateItem & { id: string }>;

  // Function to add a new item with default values and a temporary ID
  const addNewItem = useCallback(() => {
    append({
      temp_item_id: generateUUID(), // Add temporary UUID for linking
      description: '',
      item_type: 'none',
      cost: '0',
      markup_percentage: '20',
      quantity: '1',
      unit_price: '0',
      vendor_id: '',
      subcontractor_id: '',
      document_id: '',
      trade_type: '',
      expense_type: undefined,
      custom_type: '',
      // Add tracking fields
      _isNewlyAdded: true,
      _isModified: false,
      _isDeleted: false,
    } as ExtendedEstimateItem);
    // Navigate to the last page when adding a new item
    const newTotalPages = Math.ceil((fields.length + 1) / ITEMS_PER_PAGE);
    setCurrentPage(newTotalPages);
  }, [append, fields.length]);

  // Calculate total price for an item
  const calculateTotalPrice = useCallback(
    (index: number) => {
      const quantity = Number(form.getValues(`items.${index}.quantity`)) || 0;
      const unitPrice = Number(form.getValues(`items.${index}.unit_price`)) || 0;
      const total = quantity * unitPrice;

      // Store the total with 2 decimal places of precision
      return parseFloat(total.toFixed(2));
    },
    [form]
  );

  // Add comprehensive recalculation function to keep all values in sync
  const recalculateItemValues = useCallback(
    (index: number) => {
      try {
        // Get all current values
        const quantity = Number(form.getValues(`items.${index}.quantity`)) || 0;
        const cost = Number(form.getValues(`items.${index}.cost`)) || 0;
        const unitPrice = Number(form.getValues(`items.${index}.unit_price`)) || 0;
        const markupPercentage = Number(form.getValues(`items.${index}.markup_percentage`)) || 0;

        // Calculate derived values
        const totalPrice = quantity * unitPrice;
        const totalCost = quantity * cost;
        const margin = totalPrice - totalCost;

        // Update the item values - use 'as any' for TypeScript compatibility with dynamic paths
        form.setValue(`items.${index}.total_price` as any, parseFloat(totalPrice.toFixed(2)));

        // Mark item as modified if it has an original_id
        const item = form.getValues(`items.${index}`) as ExtendedEstimateItem;
        if (item.original_id) {
          form.setValue(`items.${index}._isModified` as any, true);
        }

        // Log calculation for debugging
        console.log(
          `Recalculated item ${index}: total $${totalPrice.toFixed(2)}, margin $${margin.toFixed(2)}`
        );
      } catch (error) {
        console.error('Error in recalculation:', error);
      }
    },
    [form]
  );

  // Update unit price when cost or markup changes
  const updateUnitPriceFromMarkup = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`items.${index}.cost`)) || 0;
      const markupPercentage = Number(form.getValues(`items.${index}.markup_percentage`)) || 0;

      const markupAmount = cost * (markupPercentage / 100);
      const unitPrice = cost + markupAmount;

      // Format to 2 decimal places for consistency
      form.setValue(`items.${index}.unit_price`, unitPrice.toFixed(2));

      // Now recalculate all values for consistency
      recalculateItemValues(index);
    },
    [form, recalculateItemValues]
  );

  // Calculate gross margin for an item
  const calculateGrossMargin = useCallback(
    (index: number) => {
      const quantity = Number(form.getValues(`items.${index}.quantity`)) || 0;
      const unitPrice = Number(form.getValues(`items.${index}.unit_price`)) || 0;
      const cost = Number(form.getValues(`items.${index}.cost`)) || 0;

      const totalPrice = quantity * unitPrice;
      const totalCost = quantity * cost;
      return totalPrice - totalCost;
    },
    [form]
  );

  // Handle document upload for a line item
  const handleOpenDocumentDialog = useCallback((index: number) => {
    setActiveItemIndex(index);
    setShowDocumentDialog(true);
    setUploadError(null);
  }, []);

  // Handle document upload success
  const handleDocumentUploadSuccess = useCallback(
    (documentId: string) => {
      if (activeItemIndex !== null && documentId) {
        // Get the temp_item_id from the current item in the form
        const tempItemId = form.getValues(`items.${activeItemIndex}.temp_item_id`);

        // Log with the correct temp_item_id
        console.log(
          `[Line Item Doc] Attaching document ${documentId} to line item ${activeItemIndex} with temp_item_id ${tempItemId}`
        );

        // Ensure temp_item_id exists - generate one if needed
        if (!tempItemId) {
          const newTempId = generateUUID();
          form.setValue(`items.${activeItemIndex}.temp_item_id`, newTempId, {
            shouldDirty: true,
            shouldTouch: true,
          });
          console.log(`Generated new temp_item_id ${newTempId} for line item ${activeItemIndex}`);
        }

        // Update the line item with the document ID
        form.setValue(`items.${activeItemIndex}.document_id`, documentId, {
          shouldDirty: true,
          shouldTouch: true,
        });

        toast({
          title: 'Document attached',
          description: 'Document has been successfully attached to the line item',
        });

        // Close the dialog with a slight delay to ensure UI updates are complete
        setTimeout(() => {
          setShowDocumentDialog(false);
          setActiveItemIndex(null); // Reset active item
        }, 100);
      } else {
        console.error(
          '[Line Item Doc] Failed to attach document - activeItemIndex:',
          activeItemIndex,
          'documentId:',
          documentId
        );
        setUploadError('Failed to attach document to the line item');
      }
    },
    [activeItemIndex, form]
  );

  // Handle item deletion
  const handleDeleteItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < typedFields.length) {
        const item = form.getValues(`items.${index}`) as ExtendedEstimateItem;

        // If it's an existing item (has original_id), mark as deleted rather than removing
        if (item.original_id) {
          // Mark the item as deleted but keep it in the form for tracking
          try {
            form.setValue(`items.${index}._isDeleted` as any, true, { shouldDirty: true });

            // Create a clone of the fields array to trigger UI update
            const currentItems = [...typedFields];
            if (currentItems[index]) {
              currentItems[index]._isDeleted = true;
            }

            toast({
              title: 'Item marked for deletion',
              description: 'This item will be removed when you save the revision',
            });
          } catch (error) {
            console.error('Error marking item as deleted:', error);
            // Fallback to removal if marking fails
            remove(index);
          }
        } else {
          // For newly added items, remove them completely
          remove(index);
          toast({
            title: 'Item deleted',
            description: 'The line item has been removed from the estimate',
          });
        }
      }
    },
    [typedFields, form, remove]
  );

  // All items (no filtering now)
  const currentPageItems = useMemo(() => {
    // Filter out items marked for deletion for display purposes
    const visibleItems = typedFields.filter(item => !item._isDeleted);

    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return visibleItems.slice(startIndex, endIndex);
  }, [typedFields, currentPage]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(fields.length / ITEMS_PER_PAGE));

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === currentPageItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentPageItems.map(item => item.id));
    }
  }, [currentPageItems, selectedItems]);

  // Handle select item
  const handleSelectItem = useCallback((id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  }, []);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    // Remove items in reverse order to avoid index shifting issues
    const indexesToRemove = selectedItems
      .map(id => fields.findIndex(field => field.id === id))
      .sort((a, b) => b - a);

    indexesToRemove.forEach(index => {
      if (index !== -1) {
        remove(index);
      }
    });

    setSelectedItems([]);

    toast({
      title: 'Items deleted',
      description: `${indexesToRemove.length} items have been removed from the estimate`,
    });
  }, [selectedItems, fields, remove]);

  // Add this function to calculate markup from price and cost
  const updateMarkupFromPrice = useCallback(
    (index: number) => {
      const cost = Number(form.getValues(`items.${index}.cost`)) || 0;
      const unitPrice = Number(form.getValues(`items.${index}.unit_price`)) || 0;

      // Avoid division by zero
      if (cost > 0) {
        // Calculate markup percentage: (Price - Cost) / Cost * 100
        const markupPercentage = ((unitPrice - cost) / cost) * 100;

        // Format to one decimal place and update the form
        form.setValue(`items.${index}.markup_percentage`, Math.max(0, markupPercentage).toFixed(1));
      }
    },
    [form]
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
            onClick={addNewItem}
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
                        checked={
                          currentPageItems.length > 0 &&
                          selectedItems.length === currentPageItems.length
                        }
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
                  {currentPageItems.map((field, rowIndex) => {
                    const index = fields.findIndex(f => f.id === field.id);
                    const itemType = form.watch(`items.${index}.item_type`);
                    const isVendor = itemType === 'material';
                    const isSubcontractor = itemType === 'subcontractor';
                    const isSelected = selectedItems.includes(field.id);

                    return (
                      <TableRow key={field.id} className={isSelected ? 'bg-blue-50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectItem(field.id)}
                            aria-label={`Select item ${rowIndex + 1}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              {...form.register(`items.${index}.description`)}
                              placeholder="Description"
                            />
                            {form.watch(`items.${index}.document_id`) && (
                              <div className="relative">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                                      >
                                        <PaperclipIcon className="h-3 w-3 mr-1" />
                                        Doc
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Document attached to this line item</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={itemType || 'none'}
                            onValueChange={value =>
                              form.setValue(`items.${index}.item_type`, value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Choose item type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Choose item type</SelectItem>
                              <SelectItem value="labor">Labor</SelectItem>
                              <SelectItem value="material">Material</SelectItem>
                              <SelectItem value="subcontractor">Subcontractor</SelectItem>
                              <SelectItem value="fee">Fee</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>

                          {isVendor && !loading && vendors.length > 0 && (
                            <Select
                              value={form.watch(`items.${index}.vendor_id`) || 'none'}
                              onValueChange={value =>
                                form.setValue(
                                  `items.${index}.vendor_id`,
                                  value === 'none' ? null : value
                                )
                              }
                            >
                              <SelectTrigger className="w-full mt-2">
                                <SelectValue placeholder="Choose vendor" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Choose vendor</SelectItem>
                                {vendors.map(vendor => (
                                  <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                                    {vendor.vendorname}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}

                          {isSubcontractor && !loading && subcontractors.length > 0 && (
                            <Select
                              value={form.watch(`items.${index}.subcontractor_id`) || ''}
                              onValueChange={value =>
                                form.setValue(`items.${index}.subcontractor_id`, value)
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
                          <TableCell>
                            <Input
                              {...form.register(`items.${index}.quantity`)}
                              type="number"
                              min="1"
                              step="1"
                              className="text-right"
                              onBlur={() => {
                                // Use our comprehensive recalculation function
                                recalculateItemValues(index);
                              }}
                            />
                          </TableCell>
                        )}
                        {!isCompactView && (
                          <TableCell>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                                $
                              </span>
                              <Input
                                {...form.register(`items.${index}.cost`)}
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
                                    form.setValue(`items.${index}.cost`, formatted);
                                  }
                                  updateUnitPriceFromMarkup(index);
                                }}
                              />
                            </div>
                          </TableCell>
                        )}
                        {!isCompactView && (
                          <TableCell>
                            <Input
                              {...form.register(`items.${index}.markup_percentage`)}
                              type="number"
                              min="0"
                              step="0.1"
                              className="text-right"
                              placeholder="Markup %"
                              onBlur={() => {
                                updateUnitPriceFromMarkup(index);
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              {...form.register(`items.${index}.unit_price`)}
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
                                  form.setValue(`items.${index}.unit_price`, formatted);

                                  // When price changes directly, update the markup percentage
                                  updateMarkupFromPrice(index);
                                }
                                // Finally, recalculate everything
                                recalculateItemValues(index);
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-base pr-4">
                          <div className="inline-flex items-center justify-end">
                            <span className="text-gray-500 mr-0.5">$</span>
                            {calculateTotalPrice(index).toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right p-1">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50"
                              title="Attach Document"
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
                              onClick={() => handleDeleteItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        handlePageChange(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Document Upload Dialog - Single instance outside of table loop */}
      <Dialog
        open={showDocumentDialog}
        onOpenChange={open => {
          if (!open) {
            setUploadError(null);
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

          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            {activeItemIndex !== null && (
              <>
                <div className="text-xs text-gray-500 mb-2">
                  Using item temp ID:{' '}
                  {form.getValues(`items.${activeItemIndex}.temp_item_id`) || 'pending'}
                </div>
                <EnhancedDocumentUpload
                  entityType="ESTIMATE_ITEM"
                  entityId={form.getValues(`items.${activeItemIndex}.temp_item_id`) || 'pending'}
                  onSuccess={handleDocumentUploadSuccess}
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
});

EstimateItemFields.displayName = 'EstimateItemFields';

export default EstimateItemFields;
