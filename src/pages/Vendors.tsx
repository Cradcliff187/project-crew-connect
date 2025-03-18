
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import VendorsHeader from '@/components/vendors/VendorsHeader';
import VendorsTable, { Vendor } from '@/components/vendors/VendorsTable';

const fetchVendors = async () => {
  const { data, error } = await supabase
    .from('vendors')
    .select('vendorid, vendorname, email, phone, address, city, state, zip, status, createdon')
    .order('createdon', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  return data || [];
};

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    data: vendors = [], 
    isLoading: loading, 
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching vendors:', error);
      }
    }
  });

  // Handle errors outside the query to show toast
  useEffect(() => {
    if (queryError) {
      toast({
        title: 'Error fetching vendors',
        description: (queryError as Error).message,
        variant: 'destructive'
      });
    }
  }, [queryError]);

  const error = queryError ? (queryError as Error).message : null;
  
  const handleVendorAdded = () => {
    refetch();
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <VendorsHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onVendorAdded={handleVendorAdded}
        />
        
        <VendorsTable 
          vendors={vendors}
          loading={loading}
          error={error}
          searchQuery={searchQuery}
        />
      </div>
    </PageTransition>
  );
};

export default Vendors;
