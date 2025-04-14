import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';

const DashboardBudgetChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudgetData() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('projectid, projectname, total_budget, current_expenses')
          .in('status', ['active', 'ACTIVE', 'in_progress', 'IN_PROGRESS'])
          .order('createdon', { ascending: false })
          .limit(5);

        if (error) throw error;

        const processedData = (data || []).map(project => ({
          name: project.projectname,
          id: project.projectid,
          budget: project.total_budget || 0,
          spent: project.current_expenses || 0,
          percentage: project.total_budget
            ? Math.round((project.current_expenses / project.total_budget) * 100)
            : 0,
        }));

        setChartData(processedData);
      } catch (err) {
        console.error('Error fetching budget data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBudgetData();
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-2 shadow-md text-xs">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p>Budget: {formatCurrency(payload[0].payload.budget)}</p>
          <p>Spent: {formatCurrency(payload[0].payload.spent)}</p>
          <p>Usage: {payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Budget Usage</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="h-[180px] w-full bg-muted rounded animate-pulse" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-[200px] text-muted-foreground">
            No budget data available
          </div>
        ) : (
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                layout="vertical"
              >
                <XAxis type="number" tickFormatter={value => `${value}%`} domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={value =>
                    value.length > 15 ? `${value.substring(0, 15)}...` : value
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="percentage" fill="#0485ea" radius={[0, 4, 4, 0]} barSize={12}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.percentage > 90
                          ? '#ef4444'
                          : entry.percentage > 75
                            ? '#f97316'
                            : '#0485ea'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardBudgetChart;
