
import React from 'react';
import { Subcontractor } from '../utils/types';
import { Badge } from '@/components/ui/badge';
import { FileText, Star, FileCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDocumentCount } from '@/hooks/useDocumentCount';

interface SubcontractorInfoProps {
  subcontractor: Subcontractor;
}

const SubcontractorInfo = ({ subcontractor }: SubcontractorInfoProps) => {
  const { count, loading } = useDocumentCount('SUBCONTRACTOR', subcontractor.subid);
  
  // Render compliance status indicators
  const renderComplianceIndicators = () => {
    return (
      <div className="flex gap-1 items-center">
        {/* Document Count */}
        {count > 0 && (
          <Badge variant="outline" className="text-xs flex items-center gap-1 h-5 whitespace-nowrap">
            <FileText className="h-3 w-3" />
            {loading ? '...' : count} docs
          </Badge>
        )}
        
        {/* Contract Status */}
        {subcontractor.contract_on_file && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <FileCheck className="h-4 w-4 text-[#0485ea]" />
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
    <div className="flex flex-col">
      <div className="font-medium text-[#0485ea]">{subcontractor.subname || 'Unnamed Subcontractor'}</div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">{subcontractor.subid}</div>
        {renderComplianceIndicators()}
      </div>
    </div>
  );
};

export default SubcontractorInfo;
