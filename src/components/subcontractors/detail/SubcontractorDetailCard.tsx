
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Subcontractor } from '../utils/subcontractorUtils';

interface SubcontractorDetailCardProps {
  subcontractor: Subcontractor;
}

const SubcontractorDetailCard = ({ subcontractor }: SubcontractorDetailCardProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl font-montserrat text-construction-600">
            {subcontractor.subname}
          </CardTitle>
          <CardDescription className="mt-1 text-muted-foreground">
            {subcontractor.subid}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  );
};

export default SubcontractorDetailCard;
