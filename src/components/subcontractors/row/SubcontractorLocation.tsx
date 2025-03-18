
import React from 'react';
import { Subcontractor, formatSubcontractorAddress } from '../utils/subcontractorUtils';

interface SubcontractorLocationProps {
  subcontractor: Subcontractor;
}

const SubcontractorLocation = ({ subcontractor }: SubcontractorLocationProps) => {
  return (
    <div className="text-sm whitespace-pre-line">
      {formatSubcontractorAddress(subcontractor)}
    </div>
  );
};

export default SubcontractorLocation;
