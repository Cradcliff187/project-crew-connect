
import React, { useEffect, useState } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Vendor {
  id: string;
  name: string;
}

interface VendorSelectorProps {
  vendorType: 'vendor' | 'subcontractor' | 'other';
  value?: string;
  onChange: (value: string) => void;
  entityType?: string;
  entityId?: string;
  showAddNew?: boolean;
}

const VendorSelector: React.FC<VendorSelectorProps> = ({ 
  vendorType, 
  value,
  onChange,
  entityType,
  entityId,
  showAddNew = false
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch vendors on initial load or when vendorType changes
  useEffect(() => {
    fetchVendors();
  }, [vendorType, entityType, entityId]);
  
  const fetchVendors = async () => {
    setLoading(true);
    try {
      let data: Vendor[] = [];
      
      // If we have entity information, try to fetch associated vendors first
      if (entityType && entityId) {
        const { data: associatedVendors } = await supabase
          .from('vendor_associations')
          .select('vendor_id')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);
          
        if (associatedVendors && associatedVendors.length > 0) {
          // We have associated vendors, fetch their details
          const vendorIds = associatedVendors.map(v => v.vendor_id);
          
          if (vendorType === 'vendor') {
            const { data: vendorsData } = await supabase
              .from('vendors')
              .select('vendorid, vendorname')
              .in('vendorid', vendorIds)
              .order('vendorname', { ascending: true });
            
            if (vendorsData && vendorsData.length > 0) {
              data = vendorsData.map(v => ({
                id: v.vendorid,
                name: v.vendorname || v.vendorid
              }));
            }
          } else if (vendorType === 'subcontractor') {
            const { data: subcontractorsData } = await supabase
              .from('subcontractors')
              .select('subid, subname')
              .in('subid', vendorIds)
              .order('subname', { ascending: true });
            
            if (subcontractorsData && subcontractorsData.length > 0) {
              data = subcontractorsData.map(s => ({
                id: s.subid,
                name: s.subname || s.subid
              }));
            }
          }
        }
      }
      
      // If we didn't get associated vendors or don't have entity info, fetch all
      if (data.length === 0) {
        if (vendorType === 'vendor') {
          const { data: vendorsData } = await supabase
            .from('vendors')
            .select('vendorid, vendorname')
            .order('vendorname', { ascending: true })
            .limit(50);
          
          data = (vendorsData || []).map(v => ({
            id: v.vendorid,
            name: v.vendorname || v.vendorid
          }));
        } else if (vendorType === 'subcontractor') {
          const { data: subcontractorsData } = await supabase
            .from('subcontractors')
            .select('subid, subname')
            .order('subname', { ascending: true })
            .limit(50);
          
          data = (subcontractorsData || []).map(s => ({
            id: s.subid,
            name: s.subname || s.subid
          }));
        }
      }
      
      setVendors(data);
    } catch (error) {
      console.error(`Error fetching ${vendorType}s:`, error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddVendor = async () => {
    if (!newVendorName.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (vendorType === 'vendor') {
        const { data, error } = await supabase
          .from('vendors')
          .insert({
            vendorname: newVendorName,
            status: 'ACTIVE'
          })
          .select('vendorid, vendorname')
          .single();
          
        if (error) throw error;
        
        // Add to list and select it
        setVendors(prev => [...prev, { id: data.vendorid, name: data.vendorname }]);
        onChange(data.vendorid);
        
        // If we have entity info, create association
        if (entityType && entityId) {
          await supabase
            .from('vendor_associations')
            .insert({
              entity_type: entityType,
              entity_id: entityId,
              vendor_id: data.vendorid,
              description: `Associated via time entry receipt`
            });
        }
      } else if (vendorType === 'subcontractor') {
        const { data, error } = await supabase
          .from('subcontractors')
          .insert({
            subname: newVendorName,
            status: 'ACTIVE'
          })
          .select('subid, subname')
          .single();
          
        if (error) throw error;
        
        // Add to list and select it
        setVendors(prev => [...prev, { id: data.subid, name: data.subname }]);
        onChange(data.subid);
        
        // If we have entity info, create association
        if (entityType && entityId) {
          await supabase
            .from('subcontractor_associations')
            .insert({
              entity_type: entityType,
              entity_id: entityId,
              subcontractor_id: data.subid,
              description: `Associated via time entry receipt`
            });
        }
      }
      
      setShowAddVendor(false);
      setNewVendorName('');
    } catch (error) {
      console.error(`Error adding ${vendorType}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const entityLabel = vendorType === 'vendor' ? 'Vendor' : 
                     vendorType === 'subcontractor' ? 'Subcontractor' : 
                     'Supplier';
  
  return (
    <>
      {loading ? (
        <div className="flex items-center space-x-2 h-10 px-3 border rounded-md">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading {entityLabel.toLowerCase()}s...</span>
        </div>
      ) : vendors.length > 0 ? (
        <div className="relative">
          <Select
            value={value}
            onValueChange={onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${entityLabel.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showAddNew && (
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="absolute right-0 top-0 h-10 px-3"
              onClick={() => setShowAddVendor(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between h-10 px-4 border rounded-md bg-muted/20">
          <span className="text-sm text-muted-foreground">No {entityLabel.toLowerCase()}s found</span>
          {showAddNew && (
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-[#0485ea]"
              onClick={() => setShowAddVendor(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          )}
        </div>
      )}
      
      {/* Add Vendor Dialog */}
      <Dialog open={showAddVendor} onOpenChange={setShowAddVendor}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New {entityLabel}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{entityLabel} Name</Label>
              <Input
                id="name"
                placeholder={`Enter ${entityLabel.toLowerCase()} name`}
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddVendor(false);
                  setNewVendorName('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddVendor}
                disabled={isSubmitting || !newVendorName.trim()}
                className="bg-[#0485ea] hover:bg-[#0375d1]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorSelector;
