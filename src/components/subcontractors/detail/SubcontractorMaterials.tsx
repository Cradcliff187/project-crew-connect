
import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SubcontractorMaterialsProps {
  subcontractorId: string;
}

interface Material {
  material_id: string;
  work_order_id: string;
  work_order_title: string;
  material_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  date_added: string;
}

const SubcontractorMaterials = ({ subcontractorId }: SubcontractorMaterialsProps) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        // Fetch materials from the database
        const { data, error } = await supabase
          .from('materials')
          .select('material_id, work_order_id, material_name, quantity, unit_price, date_added')
          .eq('vendor_id', subcontractorId)
          .eq('vendor_type', 'SUBCONTRACTOR');

        if (error) throw error;

        // Fetch work order titles for each material
        if (data && data.length > 0) {
          const workOrderIds = [...new Set(data.map(mat => mat.work_order_id))];
          
          const { data: workOrders, error: woError } = await supabase
            .from('work_orders')
            .select('work_order_id, title')
            .in('work_order_id', workOrderIds);
          
          if (woError) throw woError;
          
          const workOrderMap = (workOrders || []).reduce((acc, wo) => {
            acc[wo.work_order_id] = wo.title;
            return acc;
          }, {} as Record<string, string>);
          
          // Combine data
          const enrichedMaterials = data.map(mat => ({
            ...mat,
            work_order_title: workOrderMap[mat.work_order_id] || 'Unknown Work Order',
            total: mat.quantity * (mat.unit_price || 0)
          }));
          
          setMaterials(enrichedMaterials);
        } else {
          setMaterials([]);
        }
      } catch (error: any) {
        console.error('Error fetching materials:', error);
        toast({
          title: 'Error',
          description: 'Failed to load materials. ' + error.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [subcontractorId]);

  const totalAmount = materials.reduce((sum, mat) => sum + mat.total, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Materials</CardTitle>
        <Button size="sm" className="bg-[#0485ea] hover:bg-[#0375d1]">
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
          </div>
        ) : materials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No materials found for this subcontractor</p>
            <Button size="sm" className="mt-4 bg-[#0485ea] hover:bg-[#0375d1]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Material
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.material_id}>
                      <TableCell>{material.material_name}</TableCell>
                      <TableCell>{material.work_order_title}</TableCell>
                      <TableCell>{material.quantity}</TableCell>
                      <TableCell>{formatCurrency(material.unit_price)}</TableCell>
                      <TableCell>{formatCurrency(material.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex justify-end">
              <div className="bg-muted p-4 rounded-md w-64">
                <div className="flex justify-between">
                  <span>Total Materials Cost:</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubcontractorMaterials;
