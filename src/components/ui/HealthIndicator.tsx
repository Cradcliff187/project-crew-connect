import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export type HealthStatus = 'good' | 'warning' | 'critical' | 'unknown';

interface HealthMetric {
  name: string;
  status: HealthStatus;
  value: number; // 0-100 percentage
  label?: string;
}

interface HealthIndicatorProps {
  metrics: HealthMetric[];
  className?: string;
  showIcons?: boolean;
  showLabels?: boolean;
}

export const HealthIndicator = ({
  metrics,
  className,
  showIcons = true,
  showLabels = true,
}: HealthIndicatorProps) => {
  const getOverallStatus = (): HealthStatus => {
    if (metrics.some(m => m.status === 'critical')) return 'critical';
    if (metrics.some(m => m.status === 'warning')) return 'warning';
    if (metrics.every(m => m.status === 'good')) return 'good';
    return 'unknown';
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    good: {
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      icon: CheckCircle,
      label: 'Good',
    },
    warning: {
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Warning',
    },
    critical: {
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      icon: XCircle,
      label: 'Critical',
    },
    unknown: {
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      icon: AlertTriangle,
      label: 'Unknown',
    },
  };

  const renderIcon = (status: HealthStatus, size: string = 'h-4 w-4') => {
    const IconComponent = statusConfig[status].icon;
    return <IconComponent className={cn(size, statusConfig[status].color)} />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {metrics.map(metric => {
        const config = statusConfig[metric.status];

        return (
          <div key={metric.name} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium">{metric.name}</p>
              <div className="flex items-center gap-1.5">
                {showLabels && (
                  <Badge variant="outline" className={cn('text-xs', config.color)}>
                    {metric.label || config.label}
                  </Badge>
                )}
                {showIcons && renderIcon(metric.status)}
              </div>
            </div>
            <Progress value={metric.value} className={cn('h-2', config.bgColor)} />
          </div>
        );
      })}

      {/* Overall Health Summary */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Overall Health</p>
          <Badge
            variant="outline"
            className={cn('flex items-center gap-1', statusConfig[overallStatus].color)}
          >
            {renderIcon(overallStatus, 'h-3.5 w-3.5')}
            <span>{statusConfig[overallStatus].label}</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default HealthIndicator;
