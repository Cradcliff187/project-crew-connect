import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

// TODO: Define necessary props (e.g., contract value, budget, spent, est. GP)
interface FinancialSnapshotCardProps {
  contractValue?: number;
  budget?: number;
  spent?: number;
  estimatedGP?: number;
}

const FinancialSnapshotCard: React.FC<FinancialSnapshotCardProps> = ({
  contractValue = 0,
  budget = 0,
  spent = 0,
  estimatedGP = 0,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        {/* TODO: Enhance with more details, maybe charts? */}
        <p>Contract: {formatCurrency(contractValue)}</p>
        <p>Budget: {formatCurrency(budget)}</p>
        <p>Spent: {formatCurrency(spent)}</p>
        <p>Est. GP: {formatCurrency(estimatedGP)}</p>
      </CardContent>
    </Card>
  );
};

export default FinancialSnapshotCard;
