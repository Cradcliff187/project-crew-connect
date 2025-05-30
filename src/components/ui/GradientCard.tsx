import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'orange';
  className?: string;
}

const variantStyles = {
  blue: {
    gradient: 'from-blue-50 to-blue-100',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-600',
    value: 'text-blue-900',
    trend: 'text-blue-700',
  },
  green: {
    gradient: 'from-green-50 to-green-100',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-600',
    value: 'text-green-900',
    trend: 'text-green-700',
  },
  yellow: {
    gradient: 'from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-600',
    value: 'text-yellow-900',
    trend: 'text-yellow-700',
  },
  purple: {
    gradient: 'from-purple-50 to-purple-100',
    border: 'border-purple-200',
    icon: 'text-purple-600',
    title: 'text-purple-600',
    value: 'text-purple-900',
    trend: 'text-purple-700',
  },
  red: {
    gradient: 'from-red-50 to-red-100',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-600',
    value: 'text-red-900',
    trend: 'text-red-700',
  },
  orange: {
    gradient: 'from-orange-50 to-orange-100',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    title: 'text-orange-600',
    value: 'text-orange-900',
    trend: 'text-orange-700',
  },
};

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  variant = 'blue',
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(`bg-gradient-to-r ${styles.gradient} ${styles.border}`, className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={`${styles.title} text-sm font-medium font-opensans`}>{title}</p>
            <p className={`text-2xl font-bold ${styles.value} font-montserrat`}>{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground font-opensans">{subtitle}</p>}
            {trend && (
              <p className={`text-sm ${styles.trend} font-opensans`}>
                {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
              </p>
            )}
          </div>
          {Icon && <Icon className={`h-8 w-8 ${styles.icon}`} />}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradientCard;
