
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import VendorsHeader from '@/components/vendors/VendorsHeader';
import VendorsTable from '@/components/vendors/VendorsTable';
import { useNavigate } from 'react-router-dom';
import VendorSheet from '@/components/vendors/VendorSheet';
import { Vendor } from '@/components/vendors/types/vendorTypes';

const fetchVendors = async () => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('vendorid, vendorname, email, phone, address, city, state, zip, status, createdon, payment_terms, tax_id, notes')
      .order('createdon', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const navigate = useNavigate();
  
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

  // Setup real-time subscription for vendor changes
  useEffect(() => {
    const channel = supabase
      .channel('vendors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors'
        },
        (payload) => {
          console.log('Real-time vendor change:', payload);
          refetch(); // Refetch vendors when changes are detected
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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

  const handleViewVendorDetails = (vendor: Vendor) => {
    navigate(`/vendors/${vendor.vendorid}`);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setEditSheetOpen(true);
  };

  const handleEditSheetClose = () => {
    setEditSheetOpen(false);
    setSelectedVendor(null);
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <VendorsHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          onVendorAdded={handleVendorAdded}
        />
        
        <div className="mt-6">
          <VendorsTable 
            vendors={vendors as Vendor[]}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            onViewDetails={handleViewVendorDetails}
            onEditVendor={handleEditVendor}
          />
        </div>

        {/* Edit Vendor Sheet */}
        {editSheetOpen && selectedVendor && (
          <VendorSheet
            open={editSheetOpen}
            onOpenChange={handleEditSheetClose}
            onVendorAdded={handleVendorAdded}
            initialData={selectedVendor}
            isEditing={true}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Vendors;
