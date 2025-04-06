
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  FileText, 
  CreditCard, 
  Wallet, 
  PieChart, 
  Calculator,
  TrendingUp,
  TrendingDown, 
  Clock
} from 'lucide-react';

type IconType = 'DollarSign' | 'FileText' | 'CreditCard' | 'Wallet' | 'PieChart' | 'Calculator' | 'TrendingUp' | 'TrendingDown' | 'Clock';

interface FinancialSummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: IconType;
  percentage?: boolean;
  positive?: boolean;
  neutral?: boolean;
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  title,
  value,
  description,
  icon,
  percentage = false,
  positive,
  neutral
}) => {
  // Determine color scheme based on props
  const getColorClasses = () => {
    if (neutral) return 'text-[#0485ea]';
    if (positive === undefined) return 'text-[#0485ea]';
    return positive ? 'text-green-600' : 'text-red-600';
  };

  // Render the appropriate icon
  const renderIcon = () => {
    switch (icon) {
      case 'DollarSign': return <DollarSign className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'FileText': return <FileText className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'CreditCard': return <CreditCard className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'Wallet': return <Wallet className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'PieChart': return <PieChart className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'Calculator': return <Calculator className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'TrendingUp': return <TrendingUp className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'TrendingDown': return <TrendingDown className={`h-5 w-5 ${getColorClasses()}`} />;
      case 'Clock': return <Clock className={`h-5 w-5 ${getColorClasses()}`} />;
      default: return <DollarSign className={`h-5 w-5 ${getColorClasses()}`} />;
    }
  };

  // Format the value
  const formattedValue = percentage 
    ? `${value.toFixed(1)}%`
    : formatCurrency(value);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {renderIcon()}
        </div>
        <div className={`text-2xl font-bold ${getColorClasses()}`}>
          {formattedValue}
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;
