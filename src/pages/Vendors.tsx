import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, CheckCircle, Users, AlertTriangle } from 'lucide-react';
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
      .select(
        'vendorid, vendorname, email, phone, address, city, state, zip, status, createdon, payment_terms, tax_id, notes'
      )
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
  const { user } = useAuth();

  const {
    data: vendors = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching vendors:', error);
      },
    },
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
          table: 'vendors',
        },
        payload => {
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
        variant: 'destructive',
      });
    }
  }, [queryError]);

  const error = queryError ? (queryError as Error).message : null;

  // Calculate metrics for summary cards
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(vendor => vendor.status === 'active').length;
  const thisMonthVendors = vendors.filter(vendor => {
    if (!vendor.createdon) return false;
    const created = new Date(vendor.createdon);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;
  const pendingVendors = vendors.filter(
    vendor => vendor.status === 'pending' || vendor.status === 'inactive'
  ).length;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              <Building2 className="h-8 w-8 mr-3 text-blue-600" />
              Vendor Management
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
            >
              {user?.role || 'User'}
            </Badge>
          </div>
          <p className="text-gray-600 font-opensans">Manage vendor relationships and contracts</p>
        </div>

        {/* Summary Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium font-opensans">Total Vendors</p>
                  <p className="text-2xl font-bold text-blue-900 font-montserrat">{totalVendors}</p>
                </div>
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium font-opensans">Active Vendors</p>
                  <p className="text-2xl font-bold text-green-900 font-montserrat">
                    {activeVendors}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium font-opensans">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 font-montserrat">
                    {pendingVendors}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium font-opensans">
                    New This Month
                  </p>
                  <p className="text-2xl font-bold text-purple-900 font-montserrat">
                    {thisMonthVendors}
                  </p>
                </div>
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Maximum Space for Business Data */}
        <PageTransition>
          <div className="flex flex-col">
            <VendorsHeader
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onVendorAdded={handleVendorAdded}
            />

            <div className="mt-4">
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
      </div>
    </div>
  );
};

export default Vendors;
