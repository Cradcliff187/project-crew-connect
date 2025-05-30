import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  Plus,
  FileText,
  Calendar,
  ArrowRight,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Hash,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { ChangeOrder } from '@/types/changeOrders';
import { GradientCard } from '@/components/ui/GradientCard';
import ChangeOrderDialog from '@/components/changeOrders/ChangeOrderDialog';
import { Skeleton } from '@/components/ui/skeleton';

interface ChangeOrdersListProps {
  projectId: string;
  onChangeOrderAdded?: () => void;
}

const ChangeOrdersList = ({ projectId, onChangeOrderAdded }: ChangeOrdersListProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedChangeOrder, setSelectedChangeOrder] = useState<ChangeOrder | null>(null);

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

  // Calculate statistics
  const stats = {
    total: changeOrders.length,
    totalRevenue: changeOrders.reduce((sum, co) => sum + (co.revenue_impact || 0), 0),
    totalCost: changeOrders.reduce((sum, co) => sum + (co.cost_impact || 0), 0),
    totalItems: changeOrders.reduce((sum, co) => sum + (co.items?.length || 0), 0),
  };

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
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-montserrat flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Change Orders
            </CardTitle>
            {changeOrders.length > 0 && (
              <Badge variant="secondary" className="font-opensans">
                {changeOrders.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            className="bg-[#0485ea] hover:bg-[#0375d1] font-opensans"
            onClick={() => {
              setSelectedChangeOrder(null);
              setShowAddDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Change Order
          </Button>
        </CardHeader>
        <CardContent>
          {changeOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground font-opensans">No change orders created yet</p>
              <Button
                variant="outline"
                className="mt-4 font-opensans hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                onClick={() => setShowAddDialog(true)}
              >
                Create First Change Order
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {changeOrders.map(changeOrder => (
                <div
                  key={changeOrder.id}
                  className="border rounded-lg p-4 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all duration-200"
                  onClick={() => handleViewChangeOrder(changeOrder)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold font-montserrat text-gray-900">
                        {changeOrder.title}
                      </h4>
                      <p className="text-sm text-muted-foreground font-opensans">
                        {changeOrder.change_order_number}
                      </p>
                    </div>
                    <Badge variant="outline" className="font-opensans">
                      {changeOrder.items?.length || 0} items
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-sm font-opensans">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-gray-600">
                        Requested: {formatDate(changeOrder.requested_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-opensans">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-gray-600">
                        New Completion: {formatDate(changeOrder.new_completion_date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                        <span className="text-sm font-medium font-opensans text-green-600">
                          {formatCurrency(changeOrder.revenue_impact || 0)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-yellow-600" />
                        <span className="text-sm font-medium font-opensans text-yellow-600">
                          {formatCurrency(changeOrder.cost_impact || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="font-semibold font-montserrat text-blue-600">
                      {formatCurrency(changeOrder.total_amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </>
  );
};

export default ChangeOrdersList;
