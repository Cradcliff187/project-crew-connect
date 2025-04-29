import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, Phone, Mail, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/common/layout/PageHeader';
import VendorSheet from '@/components/vendors/VendorSheet';
import VendorDocuments from './VendorDocuments';
import { getPaymentTermsLabel } from '../utils/vendorUtils';
import useVendorAssociatedData from '../hooks/useVendorAssociatedData';
import AssociatedProjects from './AssociatedProjects';
import AssociatedWorkOrders from './AssociatedWorkOrders';

const VendorDetail = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendor, setVendor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  // Fetch associated data
  const { projects, workOrders, loadingAssociations, fetchAssociatedData } =
    useVendorAssociatedData();

  // Create a stable fetch vendor function that doesn't recreate itself on every render
  const fetchVendor = useCallback(async () => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendorid', vendorId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setVendor(data);
      // Only fetch associated data if we have vendor data
      if (data) {
        fetchAssociatedData(vendorId);
      }
    } catch (error) {
      console.error('Error fetching vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendor details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [vendorId, fetchAssociatedData]);

  // Use a more stable approach for fetching data
  useEffect(() => {
    fetchVendor();
  }, [fetchVendor]); // fetchVendor is now stable with useCallback

  const handleEdit = () => {
    setEditSheetOpen(true);
  };

  const handleVendorUpdated = () => {
    // Refetch vendor data after update
    fetchVendor();
    toast({
      title: 'Success',
      description: 'Vendor information updated successfully.',
    });
  };

  // Loading state with skeleton UI
  if (loading) {
    return (
      <PageTransition>
        <div className="container py-6 space-y-4">
          <div className="h-12 w-full max-w-xs bg-gray-100 animate-pulse rounded"></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Not found state
  if (!vendor) {
    return (
      <PageTransition>
        <div className="container py-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">Vendor Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  The vendor you're looking for doesn't exist or has been removed.
                </p>
                <Button asChild className="bg-[#0485ea] hover:bg-[#0370c9]">
                  <Link to="/vendors">Go Back to Vendors</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Actions for the page header
  const headerActions = (
    <Button onClick={handleEdit}>
      <Edit className="h-4 w-4 mr-2" />
      Edit Vendor
    </Button>
  );

  // Render vendor details once loaded
  return (
    <PageTransition>
      <div className="container py-6">
        <PageHeader
          title={vendor.vendorname}
          backLink="/vendors"
          backText="Back to vendors"
          actions={headerActions}
        />

        {/* Basic Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vendor Information Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Building className="h-5 w-5" />
                Vendor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Vendor ID</p>
                <p>{vendor.vendorid}</p>
              </div>

              {vendor.tax_id && (
                <div>
                  <p className="text-sm font-medium">Tax ID</p>
                  <p>{vendor.tax_id}</p>
                </div>
              )}

              {vendor.payment_terms && (
                <div>
                  <p className="text-sm font-medium">Payment Terms</p>
                  <p>{getPaymentTermsLabel(vendor.payment_terms)}</p>
                </div>
              )}

              {vendor.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium">Notes</p>
                    <p className="whitespace-pre-wrap">{vendor.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MapPin className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(vendor.address || vendor.city || vendor.state || vendor.zip) && (
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p>{vendor.address}</p>
                  <p>{[vendor.city, vendor.state, vendor.zip].filter(Boolean).join(', ')}</p>
                </div>
              )}

              {vendor.phone && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {vendor.phone}
                  </p>
                </div>
              )}

              {vendor.email && (
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {vendor.email}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Associated Projects & Work Orders - Render components directly */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <AssociatedProjects projects={projects} loading={loadingAssociations} />
          <AssociatedWorkOrders workOrders={workOrders} loading={loadingAssociations} />
        </div>

        <div className="mt-6">
          <VendorDocuments vendorId={vendor.vendorid} />
        </div>

        {/* Edit Vendor Sheet */}
        <VendorSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          onVendorAdded={handleVendorUpdated}
          initialData={vendor}
          isEditing={true}
        />
      </div>
    </PageTransition>
  );
};

export default VendorDetail;
