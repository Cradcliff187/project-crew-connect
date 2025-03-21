
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
import { mapStatusToStatusBadge } from '../VendorsTable';
import { Vendor } from '../VendorsTable';
import { useState } from 'react';
import VendorDialog from '../VendorDialog';

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Email</h3>
                <p>{vendor.email || 'No email provided'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Phone</h3>
                <p>{vendor.phone || 'No phone provided'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
                <p>{vendor.address || 'No address provided'}</p>
                {(vendor.city || vendor.state || vendor.zip) && (
                  <p>{[vendor.city, vendor.state, vendor.zip].filter(Boolean).join(', ')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Payment Terms</h3>
                <p>{vendor.payment_terms || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Tax ID</h3>
                <p>{vendor.tax_id || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-1">Created On</h3>
                <p>{vendor.createdon ? new Date(vendor.createdon).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {vendor.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{vendor.notes}</p>
            </CardContent>
          </Card>
        )}

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
