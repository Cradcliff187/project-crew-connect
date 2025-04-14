import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { ChangeOrder } from '@/types/changeOrders';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ScheduleImpactVisualizationProps {
  changeOrder: ChangeOrder;
}

interface MilestoneData {
  id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
}

const ScheduleImpactVisualization: React.FC<ScheduleImpactVisualizationProps> = ({
  changeOrder,
}) => {
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectDueDate, setProjectDueDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      if (changeOrder.entity_type !== 'PROJECT') return;

      setLoading(true);
      try {
        // Fetch project due date
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('due_date')
          .eq('projectid', changeOrder.entity_id)
          .single();

        if (!projectError && projectData) {
          setProjectDueDate(projectData.due_date);
        }

        // Fetch project milestones
        const { data, error } = await supabase
          .from('project_milestones')
          .select('id, title, due_date, is_completed')
          .eq('projectid', changeOrder.entity_id)
          .order('due_date', { ascending: true });

        if (error) throw error;
        setMilestones(data || []);
      } catch (error) {
        console.error('Error fetching milestone data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [changeOrder]);

  // Format milestone data for the chart
  const getChartData = () => {
    if (!milestones.length) return [];

    // Calculate impact
    const impactDays = changeOrder.impact_days;

    return milestones.map(milestone => {
      const originalDate = new Date(milestone.due_date);
      const impactedDate = new Date(originalDate);
      impactedDate.setDate(originalDate.getDate() + impactDays);

      return {
        name: milestone.title,
        originalDate: originalDate.getTime(),
        impactedDate: impactedDate.getTime(),
        completed: milestone.is_completed,
      };
    });
  };

  const chartData = getChartData();

  // Format date for display
  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  // Calculate new completion date
  const getNewCompletionDate = () => {
    if (!projectDueDate) return 'Not set';

    const dueDate = new Date(projectDueDate);
    const newDate = new Date(dueDate);
    newDate.setDate(dueDate.getDate() + changeOrder.impact_days);

    return newDate.toLocaleDateString();
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const originalDate = new Date(payload[0].value);
      const impactedDate = new Date(payload[1].value);

      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm flex items-center mb-1">
            <Calendar className="h-4 w-4 mr-1" />
            Original: {originalDate.toLocaleDateString()}
          </p>
          <p className="text-sm flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-amber-500" />
            With Impact: {impactedDate.toLocaleDateString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Date formatter for X axis
  const dateFormatter = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Schedule Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="bg-[#0485ea]/10 p-2 rounded-full mr-3">
                  <Clock className="h-5 w-5 text-[#0485ea]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Impact</p>
                  <p className="text-lg font-semibold">{changeOrder.impact_days} days</p>
                </div>
              </div>

              {changeOrder.entity_type === 'PROJECT' && projectDueDate && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground" />
                    <Calendar className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm text-muted-foreground">Completion Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(projectDueDate)} → {getNewCompletionDate()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {changeOrder.impact_days > 0 && milestones.length > 0 ? (
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      dataKey="originalDate"
                      domain={['dataMin', 'dataMax']}
                      tickFormatter={dateFormatter}
                    />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="originalDate"
                      name="Original Date"
                      fill="#0485ea"
                      background={{ fill: '#eee' }}
                    />
                    <Bar dataKey="impactedDate" name="Impacted Date" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mt-4">
                <div className="flex items-center text-amber-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <p className="font-medium">
                    {changeOrder.impact_days === 0
                      ? 'No schedule impact for this change order.'
                      : 'No milestone data available to visualize impact.'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleImpactVisualization;
