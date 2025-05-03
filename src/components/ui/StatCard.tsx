import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import TrendIndicator from './TrendIndicator';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: number;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
  labelClassName?: string;
  secondaryLabel?: string;
  secondaryValue?: string | number;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  };
}

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
  iconClassName,
  valueClassName,
  labelClassName,
  secondaryLabel,
  secondaryValue,
  badge,
}: StatCardProps) => {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className={cn('h-4 w-4 text-muted-foreground', iconClassName)} />}
          <p className={cn('text-xs text-muted-foreground', labelClassName)}>{label}</p>
        </div>
        {badge && (
          <Badge variant={badge.variant || 'outline'} className="text-xs">
            {badge.text}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className={cn('text-lg font-medium', valueClassName)}>{value}</p>
          {secondaryLabel && secondaryValue && (
            <p className="text-xs text-muted-foreground">
              {secondaryLabel}: {secondaryValue}
            </p>
          )}
        </div>

        {trend && trendValue !== undefined && (
          <TrendIndicator trend={trend} value={trendValue} size="sm" />
        )}
      </div>
    </div>
  );
};

export default StatCard;
