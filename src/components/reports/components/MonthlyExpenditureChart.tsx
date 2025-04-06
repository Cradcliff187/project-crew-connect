
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartTooltipContent } from '@/components/ui/chart';

interface MonthlyData {
  month: string;
  expenses: number;
  budget?: number;
}

interface MonthlyExpenditureChartProps {
  data: MonthlyData[];
  loading: boolean;
}

const MonthlyExpenditureChart: React.FC<MonthlyExpenditureChartProps> = ({ data, loading }) => {
  if (loading) {
    return <Skeleton className="w-full h-[300px]" />;
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No monthly data available for the selected date range.
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip 
          formatter={(value) => formatCurrency(value as number)} 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-background p-2 border rounded-md shadow-md">
                  <p className="font-medium">{label}</p>
                  {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color }}>
                      {entry.name}: {formatCurrency(entry.value as number)}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
        <Bar dataKey="budget" fill="#0485ea" name="Budget Allocation" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyExpenditureChart;
