import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/types/common';
import { Spinner } from '@/components/ui/spinner';

interface VendorSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorSelected?: (vendor: Vendor) => void;
  onSelect?: (vendor: Vendor) => void;
  title?: string;
  description?: string;
}

const VendorSelectDialog = ({
  open,
  onOpenChange,
  onVendorSelected,
  onSelect,
  title = 'Select Vendor',
  description = 'Search and select a vendor to associate with this document',
}: VendorSelectDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async (query: string = '') => {
    setLoading(true);
    setError(null);

    try {
      let vendorQuery = supabase.from('vendors').select('vendorid, vendorname');

      // Add status filter if the column exists
      try {
        vendorQuery = vendorQuery.eq('status', 'ACTIVE');
      } catch (err) {
        console.warn('Status filter failed, might not exist on vendors table');
      }

      if (query) {
        vendorQuery = vendorQuery.ilike('vendorname', `%${query}%`);
      }

      const { data, error } = await vendorQuery.order('vendorname', { ascending: true }).limit(50);

      if (error) throw error;

      const mappedVendors: Vendor[] = (data || []).map(vendor => ({
        id: vendor.vendorid,
        name: vendor.vendorname,
        // vendorType might not exist in the table, so we're not including it
      }));

      setVendors(mappedVendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchVendors();
    }
  }, [open]);

  const handleSearch = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    fetchVendors(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSearch();
    }
  };

  const handleSelectVendor = (vendor: Vendor, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (onVendorSelected) onVendorSelected(vendor);
    if (onSelect) onSelect(vendor);
    onOpenChange(false);
  };

  const handleClearSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery('');
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
        onPointerDownCapture={e => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-8"
                onClick={e => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              className="bg-[#0485ea] hover:bg-[#0375d1]"
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : vendors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchQuery ? 'No vendors found matching your search.' : 'No active vendors found.'}
              <p className="text-sm mt-1">Try a different search or add a new vendor.</p>
            </div>
          ) : (
            <div className="divide-y">
              {vendors.map(vendor => (
                <div
                  key={vendor.id}
                  className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 cursor-pointer"
                  onClick={e => handleSelectVendor(vendor, e)}
                >
                  <div>
                    <p className="font-medium">{vendor.name}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#0485ea]"
                    onClick={e => {
                      e.stopPropagation();
                      handleSelectVendor(vendor, e);
                    }}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 mt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorSelectDialog;
