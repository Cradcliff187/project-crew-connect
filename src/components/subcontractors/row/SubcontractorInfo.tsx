
import React from 'react';
import { Subcontractor } from '../utils/types';
import { formatDate } from '../utils/formatUtils';
import InsuranceStatus from '../InsuranceStatus';
import { Star, FileCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubcontractorInfoProps {
  subcontractor: Subcontractor;
}

const SubcontractorInfo = ({ subcontractor }: SubcontractorInfoProps) => {
  // Render vendor compliance status indicators
  const renderComplianceIndicators = () => {
    return (
      <div className="flex gap-1 items-center">
        {/* Insurance Status */}
        <InsuranceStatus expirationDate={subcontractor.insurance_expiration} />
        
        {/* Contract Status */}
        {subcontractor.contract_on_file && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <FileCheck className="h-4 w-4 text-blue-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contract on file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Preferred Vendor Status */}
        {subcontractor.preferred && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preferred vendor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="font-medium">{subcontractor.subname}</div>
      <div className="text-xs text-muted-foreground">{subcontractor.subid}</div>
      {renderComplianceIndicators()}
    </div>
  );
};

export default SubcontractorInfo;
