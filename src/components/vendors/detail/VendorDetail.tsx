
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building, MapPin, Phone, Mail, FileText, Package, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import PageTransition from '@/components/layout/PageTransition';
import VendorDialog from '@/components/vendors/VendorDialog';
import VendorDocuments from './VendorDocuments';
import { getPaymentTermsLabel } from '../utils/vendorUtils';

const VendorDetail = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendor, setVendor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('vendorid', vendorId)
          .single();

        if (error) {
          throw error;
        }

        setVendor(data);
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
    };

    fetchVendor();
  }, [vendorId]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleVendorUpdated = () => {
    // Refetch vendor data after update
    const fetchUpdatedVendor = async () => {
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('vendorid', vendorId)
          .single();

        if (error) {
          throw error;
        }

        setVendor(data);
        toast({
          title: 'Success',
          description: 'Vendor information updated successfully.',
        });
      } catch (error) {
        console.error('Error fetching updated vendor:', error);
      }
    };

    fetchUpdatedVendor();
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="container py-6 space-y-4">
          <div className="h-8 w-48 animate-pulse bg-gray-200 rounded"></div>
          <div className="h-64 animate-pulse bg-gray-100 rounded-lg"></div>
        </div>
      </PageTransition>
    );
  }

  if (!vendor) {
    return (
      <PageTransition>
        <div className="container py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-semibold mb-2">Vendor Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  The vendor you're looking for doesn't exist or has been removed.
                </p>
                <Button asChild>
                  <Link to="/vendors">Go Back to Vendors</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/vendors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{vendor.vendorname}</h1>
          </div>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Vendor
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(vendor.address || vendor.city || vendor.state || vendor.zip) && (
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p>{vendor.address}</p>
                  <p>
                    {[vendor.city, vendor.state, vendor.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
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

        <div className="mt-6">
          <VendorDocuments vendorId={vendor.vendorid} />
        </div>

        {/* Edit Vendor Dialog */}
        <VendorDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onVendorAdded={handleVendorUpdated}
          initialData={vendor}
          isEditing={true}
        />
      </div>
    </PageTransition>
  );
};

export default VendorDetail;
