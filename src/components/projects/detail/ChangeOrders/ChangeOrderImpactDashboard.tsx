import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangeOrder, ChangeOrderEntityType, ChangeOrderStatus } from '@/types/changeOrders';

interface ChangeOrderImpactDashboardProps {
  projectId: string;
}

const ChangeOrderImpactDashboard: React.FC<ChangeOrderImpactDashboardProps> = ({ projectId }) => {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectBudget, setProjectBudget] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project budget
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('total_budget')
          .eq('projectid', projectId)
          .single();

        if (!projectError && projectData) {
          setProjectBudget(projectData.total_budget || 0);
        }

        // Fetch change orders
        const { data, error } = await supabase
          .from('change_orders')
          .select('*')
          .eq('entity_type', 'PROJECT')
          .eq('entity_id', projectId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Map the data to ensure the proper types for entity_type and status
        const typedChangeOrders: ChangeOrder[] =
          data?.map(order => ({
            ...order,
            entity_type: order.entity_type as ChangeOrderEntityType,
            status: order.status as ChangeOrderStatus,
          })) || [];

        setChangeOrders(typedChangeOrders);
      } catch (error) {
        console.error('Error fetching change order data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Calculate the cumulative impact over time
  const getCumulativeImpactData = () => {
    if (!changeOrders.length) return [];

    let cumulativeAmount = 0;
    let cumulativeDays = 0;

    return changeOrders.map(co => {
      const date = new Date(co.created_at);
      cumulativeAmount += co.total_amount;
      cumulativeDays += co.impact_days;

      return {
        name: date.toLocaleDateString(),
        amount: cumulativeAmount,
        days: cumulativeDays,
        budget: projectBudget,
        budgetWithChanges: projectBudget + cumulativeAmount,
        changeOrder: co.title,
      };
    });
  };

  const cumulativeData = getCumulativeImpactData();

  // Calculate total impacts
  const calculateTotals = () => {
    return changeOrders.reduce(
      (acc, co) => {
        return {
          amount: acc.amount + co.total_amount,
          days: acc.days + co.impact_days,
          count: acc.count + 1,
        };
      },
      { amount: 0, days: 0, count: 0 }
    );
  };

  const totals = calculateTotals();

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium mb-1">
            {label} - {payload[0]?.payload?.changeOrder}
          </p>
          <p className="text-sm text-[#0485ea] mb-1">
            Cumulative Amount: {formatCurrency(payload[0]?.value || 0)}
          </p>
          <p className="text-sm text-amber-500">Cumulative Days: {payload[1]?.value || 0} days</p>
          <p className="text-sm text-emerald-500 mt-1">
            Budget: {formatCurrency(payload[2]?.value || 0)}
          </p>
          <p className="text-sm text-red-500">
            Budget With Changes: {formatCurrency(payload[3]?.value || 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate percentage of budget impact
  const budgetImpactPercentage =
    projectBudget > 0 ? ((totals.amount / projectBudget) * 100).toFixed(1) : 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Change Order Impact Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-[#0485ea]/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Change Orders</p>
                  <p className="text-2xl font-bold">{totals.count}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#0485ea]/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Financial Impact</p>
                  <p className="text-2xl font-bold">{formatCurrency(totals.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {budgetImpactPercentage}% of budget
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#0485ea]/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total Schedule Impact</p>
                  <p className="text-2xl font-bold">{totals.days} days</p>
                </CardContent>
              </Card>
            </div>

            {changeOrders.length > 0 ? (
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cumulativeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="amount"
                      stroke="#0485ea"
                      fill="#0485ea"
                      fillOpacity={0.3}
                      name="Cumulative Amount"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="days"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      name="Cumulative Days"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="budget"
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      fill="none"
                      name="Original Budget"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="budgetWithChanges"
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      fill="none"
                      name="Budget With Changes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-40 text-muted-foreground">
                No change orders to display impact analysis
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChangeOrderImpactDashboard;
