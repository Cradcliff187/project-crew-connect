
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
          <CardTitle className="text-2xl text-[#0485ea]">{subcontractor.subname}</CardTitle>
          <CardDescription className="mt-1">{subcontractor.subid}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
};

export default SubcontractorDetailCard;
