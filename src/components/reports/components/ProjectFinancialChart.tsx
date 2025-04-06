
import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectFinancialChartProps {
  budget: number;
  expenses: number;
  loading: boolean;
}

const ProjectFinancialChart: React.FC<ProjectFinancialChartProps> = ({ budget, expenses, loading }) => {
  if (loading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  const data = [
    {
      name: 'Budget vs. Expenses',
      Budget: budget,
      Expenses: expenses,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Bar dataKey="Budget" fill="#0485ea" name="Total Budget" />
        <Bar dataKey="Expenses" fill="#ef4444" name="Current Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ProjectFinancialChart;
