import React, { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Filter,
  Download,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { PaperclipIcon } from 'lucide-react';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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

  // State for table features
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('description');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isCompactView, setIsCompactView] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
    shouldUnregister: false,
  });

  // Function to add a new item with default values
  const addNewItem = useCallback(() => {
    append({
      description: '',
      item_type: 'labor',
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
    });
    // Navigate to the last page when adding a new item
    const newTotalPages = Math.ceil((fields.length + 1) / ITEMS_PER_PAGE);
    setCurrentPage(newTotalPages);
  }, [append, fields.length]);

  // Calculate total price for an item
  const calculateTotalPrice = useCallback(
    (index: number) => {
      const quantity = Number(form.getValues(`items.${index}.quantity`)) || 0;
      const unitPrice = Number(form.getValues(`items.${index}.unit_price`)) || 0;
      return quantity * unitPrice;
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

      form.setValue(`items.${index}.unit_price`, String(unitPrice));
    },
    [form]
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

  // Calculate gross margin percentage
  const calculateGrossMarginPercentage = useCallback(
    (index: number) => {
      const grossMargin = calculateGrossMargin(index);
      const totalPrice = calculateTotalPrice(index);

      if (totalPrice === 0) return 0;
      return (grossMargin / totalPrice) * 100;
    },
    [calculateGrossMargin, calculateTotalPrice]
  );

  // Handle document upload success
  const handleDocumentUploadSuccess = useCallback(
    (index: number, docId?: string) => {
      if (docId) {
        form.setValue(`items.${index}.document_id`, docId, {
          shouldDirty: true,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    },
    [form]
  );

  // Handle sorting
  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField, sortDirection]
  );

  // Filter and sort fields
  const filteredAndSortedFields = useMemo(() => {
    let result = [...fields];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter((field, index) => {
        const description = form.getValues(`items.${index}.description`).toLowerCase();
        const itemType = form.getValues(`items.${index}.item_type`).toLowerCase();
        return description.includes(lowerCaseSearch) || itemType.includes(lowerCaseSearch);
      });
    }

    // Apply type filter
    if (filterType) {
      result = result.filter((field, index) => {
        return form.getValues(`items.${index}.item_type`) === filterType;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const aIndex = fields.findIndex(field => field.id === a.id);
      const bIndex = fields.findIndex(field => field.id === b.id);

      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'description':
          aValue = form.getValues(`items.${aIndex}.description`);
          bValue = form.getValues(`items.${bIndex}.description`);
          break;
        case 'item_type':
          aValue = form.getValues(`items.${aIndex}.item_type`);
          bValue = form.getValues(`items.${bIndex}.item_type`);
          break;
        case 'quantity':
          aValue = Number(form.getValues(`items.${aIndex}.quantity`)) || 0;
          bValue = Number(form.getValues(`items.${bIndex}.quantity`)) || 0;
          break;
        case 'cost':
          aValue = Number(form.getValues(`items.${aIndex}.cost`)) || 0;
          bValue = Number(form.getValues(`items.${bIndex}.cost`)) || 0;
          break;
        case 'markup_percentage':
          aValue = Number(form.getValues(`items.${aIndex}.markup_percentage`)) || 0;
          bValue = Number(form.getValues(`items.${bIndex}.markup_percentage`)) || 0;
          break;
        case 'unit_price':
          aValue = Number(form.getValues(`items.${aIndex}.unit_price`)) || 0;
          bValue = Number(form.getValues(`items.${bIndex}.unit_price`)) || 0;
          break;
        case 'total':
          aValue = calculateTotalPrice(aIndex);
          bValue = calculateTotalPrice(bIndex);
          break;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return result;
  }, [fields, form, searchTerm, filterType, sortField, sortDirection, calculateTotalPrice]);

  // Calculate total pages and current items to display
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedFields.length / ITEMS_PER_PAGE));
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredAndSortedFields.slice(startIndex, endIndex);
  }, [filteredAndSortedFields, currentPage]);

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
  }, [selectedItems, fields, remove]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Description', 'Type', 'Quantity', 'Cost', 'Markup %', 'Unit Price', 'Total'];
    const rows = fields.map((field, index) => [
      form.getValues(`items.${index}.description`),
      form.getValues(`items.${index}.item_type`),
      form.getValues(`items.${index}.quantity`),
      form.getValues(`items.${index}.cost`),
      form.getValues(`items.${index}.markup_percentage`),
      form.getValues(`items.${index}.unit_price`),
      calculateTotalPrice(index).toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'estimate_items.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fields, form, calculateTotalPrice]);

  // Unique item types for filtering
  const uniqueItemTypes = useMemo(() => {
    const types = new Set<string>();
    fields.forEach((_, index) => {
      const type = form.getValues(`items.${index}.item_type`);
      if (type) types.add(type);
    });
    return Array.from(types);
  }, [fields, form]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h3 className="text-lg font-medium">Items ({fields.length})</h3>
        <div className="flex flex-wrap gap-2 items-center">
          {selectedItems.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-9"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedItems.length})
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCompactView(!isCompactView)}
            className="h-9"
          >
            {isCompactView ? 'Detailed View' : 'Compact View'}
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={exportToCSV} className="h-9">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewItem}
            className="bg-[#0485ea] text-white hover:bg-[#0375d1] h-9"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
        <div className="relative w-full sm:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-1" />
              {filterType ? `Filter: ${filterType}` : 'Filter'}
              {filterType && (
                <Badge
                  variant="secondary"
                  className="ml-2 cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    setFilterType(null);
                  }}
                >
                  ×
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={filterType === null}
              onCheckedChange={() => setFilterType(null)}
            >
              All Types
            </DropdownMenuCheckboxItem>
            {uniqueItemTypes.map(type => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filterType === type}
                onCheckedChange={() => setFilterType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No items added yet. Click "Add Item" to begin.</p>
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        currentPageItems.length > 0 &&
                        selectedItems.length === currentPageItems.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('description')}
                  >
                    Description
                    {sortField === 'description' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4 inline" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4 inline" />
                      ))}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('item_type')}
                  >
                    Type
                    {sortField === 'item_type' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4 inline" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4 inline" />
                      ))}
                  </TableHead>
                  {!isCompactView && (
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 text-right"
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity
                      {sortField === 'quantity' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4 inline" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4 inline" />
                        ))}
                    </TableHead>
                  )}
                  {!isCompactView && (
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 text-right"
                      onClick={() => handleSort('cost')}
                    >
                      Cost
                      {sortField === 'cost' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4 inline" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4 inline" />
                        ))}
                    </TableHead>
                  )}
                  {!isCompactView && (
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 text-right"
                      onClick={() => handleSort('markup_percentage')}
                    >
                      Markup %
                      {sortField === 'markup_percentage' &&
                        (sortDirection === 'asc' ? (
                          <ChevronUp className="ml-1 h-4 w-4 inline" />
                        ) : (
                          <ChevronDown className="ml-1 h-4 w-4 inline" />
                        ))}
                    </TableHead>
                  )}
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 text-right"
                    onClick={() => handleSort('unit_price')}
                  >
                    Unit Price
                    {sortField === 'unit_price' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4 inline" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4 inline" />
                      ))}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 text-right"
                    onClick={() => handleSort('total')}
                  >
                    Total
                    {sortField === 'total' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="ml-1 h-4 w-4 inline" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4 inline" />
                      ))}
                  </TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPageItems.map(field => {
                  const index = fields.findIndex(f => f.id === field.id);
                  const itemType = form.watch(`items.${index}.item_type`);
                  const isVendor = itemType === 'vendor';
                  const isSubcontractor = itemType === 'subcontractor';
                  const isSelected = selectedItems.includes(field.id);

                  return (
                    <TableRow key={field.id} className={isSelected ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectItem(field.id)}
                          aria-label={`Select item ${index + 1}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...form.register(`items.${index}.description`)}
                          placeholder="Description"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={itemType || 'labor'}
                          onValueChange={value => form.setValue(`items.${index}.item_type`, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="labor">Labor</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="subcontractor">Subcontractor</SelectItem>
                            <SelectItem value="fee">Fee</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>

                        {isVendor && !loading && vendors.length > 0 && (
                          <Select
                            value={form.watch(`items.${index}.vendor_id`) || ''}
                            onValueChange={value =>
                              form.setValue(`items.${index}.vendor_id`, value)
                            }
                            className="mt-2"
                          >
                            <SelectTrigger className="w-full">
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

                        {isSubcontractor && !loading && subcontractors.length > 0 && (
                          <Select
                            value={form.watch(`items.${index}.subcontractor_id`) || ''}
                            onValueChange={value =>
                              form.setValue(`items.${index}.subcontractor_id`, value)
                            }
                            className="mt-2"
                          >
                            <SelectTrigger className="w-full">
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
                              const total = calculateTotalPrice(index);
                              form.setValue(`items.${index}.total_price`, total);
                            }}
                          />
                        </TableCell>
                      )}
                      {!isCompactView && (
                        <TableCell>
                          <Input
                            {...form.register(`items.${index}.cost`)}
                            type="number"
                            min="0"
                            step="0.01"
                            className="text-right"
                            onBlur={() => {
                              updateUnitPriceFromMarkup(index);
                            }}
                          />
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
                            onBlur={() => {
                              updateUnitPriceFromMarkup(index);
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Input
                          {...form.register(`items.${index}.unit_price`)}
                          type="number"
                          min="0"
                          step="0.01"
                          className="text-right"
                          onBlur={() => {
                            const total = calculateTotalPrice(index);
                            form.setValue(`items.${index}.total_price`, total);
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(calculateTotalPrice(index))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end space-x-2">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-500 border-blue-200 hover:bg-blue-50 h-8 w-8 p-0"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <PaperclipIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">Attach document</span>
                              </Button>
                            </SheetTrigger>
                            <SheetContent
                              className="w-[90vw] sm:max-w-[600px] p-0"
                              accessibleTitle="Attach Document to Line Item"
                            >
                              <SheetHeader className="p-6 pb-2">
                                <SheetTitle>Attach Document to Line Item</SheetTitle>
                                <SheetDescription>
                                  Upload a document to attach to this line item.
                                </SheetDescription>
                              </SheetHeader>
                              <EnhancedDocumentUpload
                                entityType="ESTIMATE_ITEM"
                                entityId={form.getValues('temp_id') || 'pending'}
                                onSuccess={docId => handleDocumentUploadSuccess(index, docId)}
                                preventFormPropagation={true}
                              />
                            </SheetContent>
                          </Sheet>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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

      {fields.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 bg-slate-50 p-3 border rounded-md">
            <h4 className="text-sm font-medium text-[#0485ea] mb-2">Financial Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
                <div className="text-sm font-medium">
                  {formatCurrency(
                    fields.reduce((sum, _, index) => {
                      const cost = Number(form.getValues(`items.${index}.cost`)) || 0;
                      const quantity = Number(form.getValues(`items.${index}.quantity`)) || 0;
                      return sum + cost * quantity;
                    }, 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
                <div className="text-sm font-medium">
                  {formatCurrency(
                    fields.reduce((sum, _, index) => sum + calculateTotalPrice(index), 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Gross Margin</div>
                <div className="text-sm font-medium">
                  {formatCurrency(
                    fields.reduce((sum, _, index) => sum + calculateGrossMargin(index), 0)
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Margin %</div>
                <div className="text-sm font-medium">
                  {(() => {
                    const totalRevenue = fields.reduce(
                      (sum, _, index) => sum + calculateTotalPrice(index),
                      0
                    );
                    const totalMargin = fields.reduce(
                      (sum, _, index) => sum + calculateGrossMargin(index),
                      0
                    );
                    const marginPercentage =
                      totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
                    return marginPercentage.toFixed(1) + '%';
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 border rounded-md">
            <h4 className="text-sm font-medium text-[#0485ea] mb-2">Items by Type</h4>
            <div className="space-y-2">
              {uniqueItemTypes.map(type => {
                const count = fields.filter(
                  (_, index) => form.getValues(`items.${index}.item_type`) === type
                ).length;
                const total = fields.reduce((sum, _, index) => {
                  if (form.getValues(`items.${index}.item_type`) === type) {
                    return sum + calculateTotalPrice(index);
                  }
                  return sum;
                }, 0);

                return (
                  <div key={type} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Badge variant="outline" className="capitalize mr-2">
                        {type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">({count})</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(total)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

EstimateItemFields.displayName = 'EstimateItemFields';

export default EstimateItemFields;
