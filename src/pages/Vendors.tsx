
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import Header from '@/components/layout/Header';
import VendorsHeader from '@/components/vendors/VendorsHeader';
import VendorsTable, { Vendor } from '@/components/vendors/VendorsTable';

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch vendors from Supabase
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendorid, vendorname, email, phone, address, city, state, zip, status, createdon')
        .order('createdon', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setVendors(data || []);
    } catch (error: any) {
      console.error('Error fetching vendors:', error);
      setError(error.message);
      toast({
        title: 'Error fetching vendors',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVendors();
  }, []);

  const handleVendorAdded = () => {
    fetchVendors();
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
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
        </main>
      </div>
    </PageTransition>
  );
};

export default Vendors;
