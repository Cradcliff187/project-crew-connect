import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'flat';
  value: number; // The percentage change
  className?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TrendIndicator = ({
  trend,
  value,
  className,
  showValue = true,
  size = 'md',
}: TrendIndicatorProps) => {
  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const valueText = value !== undefined ? `${Math.abs(value).toFixed(1)}%` : '';

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      {trend === 'up' && <TrendingUp className={cn('text-green-500', iconSizes[size])} />}
      {trend === 'down' && <TrendingDown className={cn('text-red-500', iconSizes[size])} />}
      {trend === 'flat' && <Minus className={cn('text-muted-foreground', iconSizes[size])} />}

      {showValue && (
        <span
          className={cn(
            trend === 'up' && 'text-green-600',
            trend === 'down' && 'text-red-600',
            trend === 'flat' && 'text-muted-foreground',
            'font-medium'
          )}
        >
          {valueText}
        </span>
      )}
    </div>
  );
};

export default TrendIndicator;
