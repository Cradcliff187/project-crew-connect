
import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VendorScoreBadgeProps {
  score: number | null;
  showText?: boolean;
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component to display a vendor's performance score
 * Uses the calculated score from subcontractorUtils.calculateVendorScore
 */
const VendorScoreBadge: React.FC<VendorScoreBadgeProps> = ({ 
  score, 
  showText = false, 
  showIcon = true, 
  showTooltip = true,
  size = 'md'
}) => {
  // If score is null, return a neutral badge
  if (score === null) {
    return (
      <div className="flex items-center gap-1 text-gray-400">
        {showIcon && <BarChart2 className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />}
        {showText && <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>Not rated</span>}
      </div>
    );
  }
  
  // Determine color based on score
  let color = '';
  if (score >= 80) {
    color = 'text-green-500';
  } else if (score >= 60) {
    color = 'text-blue-500';
  } else if (score >= 40) {
    color = 'text-amber-500'; 
  } else if (score >= 20) {
    color = 'text-orange-500';
  } else {
    color = 'text-red-500';
  }
  
  // Format score as integer
  const formattedScore = Math.round(score);
  
  const content = (
    <div className="flex items-center gap-1">
      {showIcon && <BarChart2 className={`${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} ${color}`} />}
      {showText && (
        <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'} font-medium ${color}`}>
          {formattedScore}
        </span>
      )}
    </div>
  );
  
  if (!showTooltip) {
    return content;
  }
  
  // Get rating label
  let ratingLabel = '';
  if (score >= 80) {
    ratingLabel = 'Excellent';
  } else if (score >= 60) {
    ratingLabel = 'Good';
  } else if (score >= 40) {
    ratingLabel = 'Average';
  } else if (score >= 20) {
    ratingLabel = 'Below Average';
  } else {
    ratingLabel = 'Poor';
  }
  
  // Provide detailed tooltip content
  const tooltipContent = (
    <div className="text-sm">
      <p className="font-semibold mb-1">Vendor Score: {formattedScore}/100</p>
      <p>Performance rating: <span className={color}>{ratingLabel}</span></p>
      <p className="text-xs mt-1 text-muted-foreground">
        Based on quality, timeliness, safety, and responsiveness
      </p>
    </div>
  );
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VendorScoreBadge;
