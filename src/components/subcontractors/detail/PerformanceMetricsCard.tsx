
import React from 'react';
import { Subcontractor } from '../utils/types';
import { DollarSign } from 'lucide-react';

interface RateInformationCardProps {
  subcontractor: Subcontractor;
}

const RateInformationCard = ({ subcontractor }: RateInformationCardProps) => {
  if (!subcontractor.hourly_rate) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Rate Information</h3>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>Hourly Rate: ${subcontractor.hourly_rate}</span>
        </div>
      </div>
    </div>
  );
};

export default RateInformationCard;
