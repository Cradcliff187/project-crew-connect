
import React from 'react';
import { format, isPast, addDays } from 'date-fns';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface InsuranceStatusProps {
  expiryDate: string | null;
  isRequired: boolean;
}

const InsuranceStatus: React.FC<InsuranceStatusProps> = ({ expiryDate, isRequired }) => {
  if (!isRequired) {
    return (
      <Badge variant="outline" className="text-gray-500">
        Not Required
      </Badge>
    );
  }
  
  if (!expiryDate) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Missing
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insurance documentation required but not provided</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  const expiry = new Date(expiryDate);
  const isExpired = isPast(expiry);
  const isExpiringSoon = !isExpired && isPast(addDays(new Date(), -30));
  
  if (isExpired) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Expired
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Expired on {format(expiry, 'MMM d, yyyy')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (isExpiringSoon) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="warning" className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              Expiring Soon
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Expires on {format(expiry, 'MMM d, yyyy')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3.5 w-3.5" />
            Valid
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Valid until {format(expiry, 'MMM d, yyyy')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InsuranceStatus;
