import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChangeOrderItem } from '@/types/changeOrders';
import { formatCurrency } from '@/lib/utils';

interface BudgetImpactAnalysisProps {
  items: ChangeOrderItem[];
}

interface CategoryImpact {
  name: string;
  amount: number;
}

const BudgetImpactAnalysis: React.FC<BudgetImpactAnalysisProps> = ({ items }) => {
  // Group and sum the items by category
  const getCategoryImpacts = (): CategoryImpact[] => {
    const categoryMap = new Map<string, number>();

    items.forEach(item => {
      const category = item.item_type || item.trade_type || item.expense_type || 'Other';
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + item.total_price);
    });

    return Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      amount,
    }));
  };

  const categoryImpacts = getCategoryImpacts();

  // Create custom tooltip to format currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-[#0485ea]">{`Amount: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Budget Impact Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryImpacts.length > 0 ? (
          <div className="h-72 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryImpacts} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={value => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="amount" fill="#0485ea" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-40 text-muted-foreground">
            No items added to analyze budget impact
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetImpactAnalysis;
