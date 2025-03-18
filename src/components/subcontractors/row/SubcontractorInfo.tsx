
import React from 'react';
import { Subcontractor, calculateVendorScore } from '../utils/subcontractorUtils';
import InsuranceStatus from '../InsuranceStatus';
import VendorScoreBadge from '../VendorScoreBadge';
import { Star, Clock, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubcontractorInfoProps {
  subcontractor: Subcontractor;
}

const SubcontractorInfo = ({ subcontractor }: SubcontractorInfoProps) => {
  // Calculate vendor score
  const vendorScore = calculateVendorScore(subcontractor);
  
  // Render vendor compliance status indicators
  const renderComplianceIndicators = () => {
    return (
      <div className="flex gap-1 items-center">
        {/* Insurance Status */}
        <InsuranceStatus expirationDate={subcontractor.insurance_expiration} />
        
        {/* Vendor Score */}
        <VendorScoreBadge score={vendorScore} />
        
        {/* Contract Status */}
        {subcontractor.contract_on_file && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M9 17h6" />
                    <path d="M9 13h6" />
                  </svg>
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
        
        {/* Performance Review Status */}
        {subcontractor.last_performance_review && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <Clock className={`h-4 w-4 ${
                    // If review is within the last 6 months
                    new Date(subcontractor.last_performance_review) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) 
                      ? 'text-green-500' 
                      : 'text-amber-500'
                  }`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last review: {formatDate(subcontractor.last_performance_review)}</p>
                {new Date(subcontractor.last_performance_review) <= new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) && 
                  <p className="text-amber-400">Review overdue</p>
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Performance Metrics */}
        {subcontractor.on_time_percentage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <CheckCircle2 className={`h-4 w-4 ${
                    subcontractor.on_time_percentage >= 90 ? 'text-green-500' :
                    subcontractor.on_time_percentage >= 75 ? 'text-amber-500' : 'text-red-500'
                  }`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>On-time percentage: {subcontractor.on_time_percentage}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  // Format created_at date
  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).format(new Date(dateString));
    } catch (error) {
      return 'Invalid date';
    }
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
