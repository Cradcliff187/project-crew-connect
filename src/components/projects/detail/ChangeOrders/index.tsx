import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, FileText, Calendar, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { ChangeOrder } from '@/types/changeOrders';
import ChangeOrderDialog from '@/components/changeOrders/ChangeOrderDialog';
import ChangeOrderStatusBadge from '@/components/changeOrders/ChangeOrderStatusBadge';
import ChangeOrderImpactDashboard from './ChangeOrderImpactDashboard';

interface ChangeOrdersListProps {
  projectId: string;
  onChangeOrderAdded?: () => void;
}

const ChangeOrdersList = ({ projectId, onChangeOrderAdded }: ChangeOrdersListProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);
  const [showImpactDashboard, setShowImpactDashboard] = useState(true);

  const {
    data: changeOrders = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['project-change-orders', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('change_orders')
        .select('*, items:change_order_items(*)')
        .eq('entity_type', 'PROJECT')
        .eq('entity_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ChangeOrder[];
    },
    meta: {
      onError: (error: any) => {
        console.error('Error fetching change orders:', error);
        toast({
          title: 'Error loading change orders',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  });

  const handleChangeOrderSaved = () => {
    refetch();
    if (onChangeOrderAdded) onChangeOrderAdded();
    setShowAddDialog(false);
    setSelectedChangeOrder(null);
  };

  const handleViewChangeOrder = (changeOrder: ChangeOrder) => {
    setSelectedChangeOrder(changeOrder);
    setShowAddDialog(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-medium">Change Orders</CardTitle>
          <Button
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Change Order
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalAmount = changeOrders.reduce((sum, co) => sum + co.total_amount, 0);
  const totalDays = changeOrders.reduce((sum, co) => sum + co.impact_days, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Change Orders</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowImpactDashboard(!showImpactDashboard)}
          >
            {showImpactDashboard ? 'Hide Impact Dashboard' : 'Show Impact Dashboard'}
          </Button>
          <Button
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => {
              setSelectedChangeOrder(null);
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Change Order
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showImpactDashboard && changeOrders.length > 0 && (
          <div className="mb-6">
            <ChangeOrderImpactDashboard projectId={projectId} />
          </div>
        )}

        {changeOrders.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No change orders created yet</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
              Create First Change Order
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-[#0485ea]/5 border-[#0485ea]/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Change Orders</p>
                  <p className="text-2xl font-bold">{changeOrders.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0485ea]/5 border-[#0485ea]/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0485ea]/5 border-[#0485ea]/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Schedule Impact</p>
                  <p className="text-2xl font-bold">{totalDays} days</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              {changeOrders.map(changeOrder => (
                <div
                  key={changeOrder.id}
                  className="border rounded-lg p-3 hover:bg-[#0485ea]/5 cursor-pointer transition-colors"
                  onClick={() => handleViewChangeOrder(changeOrder)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{changeOrder.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {changeOrder.change_order_number}
                      </p>
                    </div>
                    <ChangeOrderStatusBadge status={changeOrder.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Requested: {formatDate(changeOrder.requested_date)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Impact: {changeOrder.impact_days} days</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="font-semibold flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-[#0485ea]" />
                      {formatCurrency(changeOrder.total_amount)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Badge variant="outline" className="bg-[#0485ea]/5 border-[#0485ea]/20">
                        {changeOrder.items?.length || 0} items
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>

      {showAddDialog && (
        <ChangeOrderDialog
          isOpen={showAddDialog}
          onClose={() => {
            setShowAddDialog(false);
            setSelectedChangeOrder(null);
          }}
          projectId={projectId}
          entityType="PROJECT"
          changeOrder={selectedChangeOrder}
          onSaved={handleChangeOrderSaved}
        />
      )}
    </Card>
  );
};

export default ChangeOrdersList;
