import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VarianceBadgeProps {
  variance: number;
  tooltipDescription?: string;
  compact?: boolean;
}

/**
 * VarianceBadge component to display budget variance with appropriate styling
 * Positive variance = Under Budget (good) = green
 * Negative variance = Over Budget (bad) = red
 */
export const VarianceBadge = ({
  variance,
  tooltipDescription = 'Variance = Budget - Actual',
  compact = false,
}: VarianceBadgeProps) => {
  const label = variance >= 0 ? 'Under Budget' : 'Over Budget';
  const display = Math.abs(variance).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const content = compact ? display : `${label}: ${display}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={variance >= 0 ? 'success' : 'destructive'}>{content}</Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipDescription}</p>
        <p>
          {label}: {display}
        </p>
      </TooltipContent>
    </Tooltip>
  );
};
