
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import EstimateFormContent from './components/EstimateFormContent';

interface EstimateFormProps {
  open: boolean;
  onClose: () => void;
}

const EstimateForm = ({ open, onClose }: EstimateFormProps) => {
  const [customers, setCustomers] = useState<{ id: string; name: string; address?: string; city?: string; state?: string; zip?: string }[]>([]);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  // Fetch customers when the form opens
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('customerid, customername, address, city, state, zip')
          .order('customername');
          
        if (error) throw error;
        setCustomers(data?.map(c => ({ 
          id: c.customerid, 
          name: c.customername || '',
          address: c.address,
          city: c.city,
          state: c.state,
          zip: c.zip
        })) || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 font-sans">
        <DialogHeader className="sticky top-0 z-10 bg-white px-6 pt-6 pb-4 border-b shadow-sm">
          <DialogTitle className="text-2xl font-bold font-montserrat text-[#0485ea]">Create New Estimate</DialogTitle>
        </DialogHeader>

        <EstimateFormContent 
          onClose={onClose}
          customers={customers}
          useCustomLocation={useCustomLocation}
          setUseCustomLocation={setUseCustomLocation}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EstimateForm;
