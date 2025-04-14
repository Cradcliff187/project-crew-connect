import React from 'react';
import { format } from 'date-fns';
import { Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getInsuranceStatusInfo } from './utils/complianceUtils';

interface InsuranceStatusProps {
  expirationDate: string | null;
  showText?: boolean;
  showIcon?: boolean;
  showTooltip?: boolean;
}

const InsuranceStatus: React.FC<InsuranceStatusProps> = ({
  expirationDate,
  showText = false,
  showIcon = true,
  showTooltip = true,
}) => {
  const { status, color, urgency } = getInsuranceStatusInfo(expirationDate);

  const getIcon = () => {
    switch (urgency) {
      case 'critical':
        return <ShieldAlert className={`h-4 w-4 ${color}`} />;
      case 'warning':
        return <Shield className={`h-4 w-4 ${color}`} />;
      case 'valid':
        return <ShieldCheck className={`h-4 w-4 ${color}`} />;
      default:
        return <ShieldQuestion className={`h-4 w-4 ${color}`} />;
    }
  };

  const content = (
    <div className="flex items-center gap-1">
      {showIcon && getIcon()}
      {showText && <span className={`text-sm ${color}`}>{status}</span>}
    </div>
  );

  if (!showTooltip) {
    return content;
  }

  // Provide detailed tooltip content
  const tooltipContent = (
    <div className="text-sm">
      <p className="font-semibold mb-1">Insurance Status: {status}</p>
      {expirationDate && <p>Expiration date: {format(new Date(expirationDate), 'MMM d, yyyy')}</p>}
      {urgency === 'critical' && (
        <p className="mt-1 text-red-400">Insurance needs to be renewed immediately!</p>
      )}
      {urgency === 'warning' && (
        <p className="mt-1 text-amber-400">Insurance renewal needed soon.</p>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InsuranceStatus;
