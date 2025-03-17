
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Define vendor form data type
interface VendorFormData {
  vendorname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  status: string;
}

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorAdded: () => void;
}

const VendorDialog = ({
  open,
  onOpenChange,
  onVendorAdded
}: VendorDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<VendorFormData>({
    defaultValues: {
      vendorname: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      status: 'active',
    }
  });
  
  const onSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    
    try {
      // Insert new vendor into Supabase
      // Note: We don't need to specify vendorid as it will be automatically generated
      // by the Supabase trigger function set_vendor_id()
      const { data: vendor, error } = await supabase
        .from('vendors')
        .insert({
          vendorname: data.vendorname,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          status: data.status,
          createdon: new Date().toISOString(),
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Vendor created successfully',
        description: `${data.vendorname} has been added to your vendors.`,
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Refresh vendors list
      onVendorAdded();
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      toast({
        title: 'Error creating vendor',
        description: error.message || 'There was an error creating the vendor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Vendor</DialogTitle>
          <DialogDescription>
            Enter the vendor details below to add them to your system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="vendorname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter vendor name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="preferred">Preferred</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={isSubmitting}
              >
                <Check className="h-4 w-4 mr-1" />
                {isSubmitting ? 'Creating...' : 'Create Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDialog;
