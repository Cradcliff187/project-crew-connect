
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

interface MonthlyData {
  month: string;
  expenses: number;
  budget?: number;
}

interface MonthlyExpenditureChartProps {
  data: MonthlyData[];
  loading: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
}

const MonthlyExpenditureChart: React.FC<MonthlyExpenditureChartProps> = ({ 
  data, 
  loading,
  title = "Monthly Expenditure",
  subtitle,
  height = 300
}) => {
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

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card className="bg-background p-3 border shadow-md">
          <p className="font-medium text-sm mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value as number)}
            </p>
          ))}
        </Card>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#0485ea]">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#333333' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tickFormatter={formatCurrency} 
            tick={{ fill: '#333333' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(value as number)} 
            content={<CustomTooltip />}
          />
          <Legend />
          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
          <Bar dataKey="budget" fill="#0485ea" name="Budget Allocation" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyExpenditureChart;
