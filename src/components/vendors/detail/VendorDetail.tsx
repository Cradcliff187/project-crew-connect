
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageTransition from '@/components/layout/PageTransition';
import StatusBadge from '@/components/ui/StatusBadge';
import { Vendor } from '../VendorsTable';
import { useState } from 'react';
import VendorDialog from '../VendorDialog';
import { formatDate, mapStatusToStatusBadge, formatVendorAddress } from '../utils/vendorUtils';

const fetchVendorDetails = async (vendorId: string) => {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('vendorid', vendorId)
    .single();

  if (error) {
    console.error('Error fetching vendor details:', error);
    throw error;
  }

  return data as Vendor;
};

const VendorDetail = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: vendor, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => fetchVendorDetails(vendorId!),
    enabled: !!vendorId,
    meta: {
      onError: (error: any) => {
        console.error('Error fetching vendor details:', error);
      }
    }
  });

  const handleBack = () => {
    navigate('/vendors');
  };

  const handleEditVendor = () => {
    setEditDialogOpen(true);
  };

  const handleVendorEdited = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <PageTransition>
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </div>
          <div className="space-y-8">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Error or vendor not found
  if (error || !vendor) {
    return (
      <PageTransition>
        <div className="container py-8">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
            <p className="text-muted-foreground mb-6">The vendor you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={handleBack}>Return to Vendors</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container py-8">
        {/* Back Button */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0485ea]">{vendor.vendorname}</h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-muted-foreground">{vendor.vendorid}</p>
              <StatusBadge status={mapStatusToStatusBadge(vendor.status)} />
            </div>
          </div>
          <Button onClick={handleEditVendor} className="mt-4 md:mt-0 bg-[#0485ea] hover:bg-[#0375d1]">
            <Edit className="h-4 w-4 mr-2" />
            Edit Vendor
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vendor Details</CardTitle>
          </CardHeader>
          <CardContent className="px-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="space-y-2">
                  {vendor.email && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Email</h4>
                      <p>{vendor.email}</p>
                    </div>
                  )}
                  {vendor.phone && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Phone</h4>
                      <p>{vendor.phone}</p>
                    </div>
                  )}
                  {formatVendorAddress(vendor) && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Address</h4>
                      <p className="whitespace-pre-line">{formatVendorAddress(vendor)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0485ea]">Financial Information</h3>
                <div className="space-y-2">
                  {vendor.payment_terms && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Payment Terms</h4>
                      <p>{vendor.payment_terms}</p>
                    </div>
                  )}
                  {vendor.tax_id && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">Tax ID</h4>
                      <p>{vendor.tax_id}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Created On</h4>
                    <p>{vendor.createdon ? formatDate(vendor.createdon) : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {vendor.notes && (
              <>
                <Separator />
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Notes</h3>
                  <p className="whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Vendor Dialog */}
        {editDialogOpen && (
          <VendorDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onVendorAdded={handleVendorEdited}
            initialData={vendor}
            isEditing={true}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default VendorDetail;
