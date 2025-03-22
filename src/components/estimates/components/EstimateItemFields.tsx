
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EstimateFormValues } from '../schemas/estimateFormSchema';
import { 
  calculateItemCost, 
  calculateItemMarkup, 
  calculateItemPrice, 
  calculateItemGrossMargin, 
  calculateItemGrossMarginPercentage 
} from '../utils/estimateCalculations';

// Types for vendors and subcontractors
type Vendor = { vendorid: string; vendorname: string };
type Subcontractor = { subid: string; subname: string };

const EstimateItemFields = () => {
  const form = useFormContext<EstimateFormValues>();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load vendors and subcontractors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch vendors
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .order('vendorname');
          
        if (vendorError) throw vendorError;
        setVendors(vendorData || []);
        
        // Fetch subcontractors - Updated to use the 'subcontractors' table instead of 'subcontractors_new'
        const { data: subData, error: subError } = await supabase
          .from('subcontractors')
          .select('subid, subname')
          .order('subname');
          
        if (subError) throw subError;
        setSubcontractors(subData || []);
      } catch (error) {
        console.error('Error fetching vendors and subcontractors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to add a new item with default values
  const addNewItem = () => {
    append({ 
      description: '', 
      item_type: 'labor', 
      cost: '0', 
      markup_percentage: '20',
      quantity: '1', 
      unitPrice: '', 
      vendor_id: '',
      subcontractor_id: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Items</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={addNewItem}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      {fields.map((field, index) => {
        // Get current values for calculations
        const itemType = useWatch({
          control: form.control,
          name: `items.${index}.item_type`,
          defaultValue: 'labor'
        });

        const cost = useWatch({
          control: form.control,
          name: `items.${index}.cost`,
          defaultValue: '0'
        });

        const markupPercentage = useWatch({
          control: form.control,
          name: `items.${index}.markup_percentage`,
          defaultValue: '0'
        });
        
        const quantity = useWatch({
          control: form.control,
          name: `items.${index}.quantity`,
          defaultValue: '1'
        });

        // Calculate derived values for display
        const item = { cost, markup_percentage: markupPercentage, quantity };
        const itemPrice = calculateItemPrice(item);
        const grossMargin = calculateItemGrossMargin(item);
        const grossMarginPercentage = calculateItemGrossMarginPercentage(item);

        return (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 border rounded-md">
            <div className="col-span-12 mb-2">
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <FormField
                control={form.control}
                name={`items.${index}.item_type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type*</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset vendor/subcontractor when type changes
                        if (value === 'vendor') {
                          form.setValue(`items.${index}.subcontractor_id`, '');
                        } else if (value === 'subcontractor') {
                          form.setValue(`items.${index}.vendor_id`, '');
                        } else {
                          form.setValue(`items.${index}.vendor_id`, '');
                          form.setValue(`items.${index}.subcontractor_id`, '');
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="vendor">Material (Vendor)</SelectItem>
                        <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Show vendor selector if type is vendor */}
            {itemType === 'vendor' && (
              <div className="col-span-12 md:col-span-3">
                <FormField
                  control={form.control}
                  name={`items.${index}.vendor_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loading ? "Loading..." : "Select vendor"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors.map(vendor => (
                            <SelectItem key={vendor.vendorid} value={vendor.vendorid}>
                              {vendor.vendorname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Show subcontractor selector if type is subcontractor */}
            {itemType === 'subcontractor' && (
              <div className="col-span-12 md:col-span-3">
                <FormField
                  control={form.control}
                  name={`items.${index}.subcontractor_id`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcontractor</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loading ? "Loading..." : "Select subcontractor"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subcontractors.map(sub => (
                            <SelectItem key={sub.subid} value={sub.subid}>
                              {sub.subname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="col-span-6 md:col-span-2">
              <FormField
                control={form.control}
                name={`items.${index}.cost`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost*</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 md:col-span-2">
              <FormField
                control={form.control}
                name={`items.${index}.markup_percentage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Markup %</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-6 md:col-span-2">
              <FormItem>
                <FormLabel>Price</FormLabel>
                <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-right">
                  ${itemPrice.toFixed(2)}
                </div>
              </FormItem>
            </div>

            <div className="col-span-6 md:col-span-2">
              <FormItem>
                <FormLabel>Gross Margin</FormLabel>
                <div className="h-10 px-3 py-2 rounded-md border border-input bg-gray-50 text-right">
                  ${grossMargin.toFixed(2)} ({grossMarginPercentage.toFixed(1)}%)
                </div>
              </FormItem>
            </div>

            <div className="col-span-12 flex justify-end">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove Item
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EstimateItemFields;
