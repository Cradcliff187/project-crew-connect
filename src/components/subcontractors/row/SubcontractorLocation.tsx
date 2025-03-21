
import React from 'react';
import { Subcontractor } from '../utils/types';

interface SubcontractorLocationProps {
  subcontractor: Subcontractor;
}

const SubcontractorLocation = ({ subcontractor }: SubcontractorLocationProps) => {
  return (
    <>
      {subcontractor.city && subcontractor.state ? (
        <div>{subcontractor.city}, {subcontractor.state}</div>
      ) : (
        <div className="text-muted-foreground">No Location</div>
      )}
    </>
  );
};

export default SubcontractorLocation;
