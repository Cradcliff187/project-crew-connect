
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Subcontractor } from '../utils/subcontractorUtils';

interface SpecialtiesSectionProps {
  subcontractor: Subcontractor;
  specialties: Record<string, any>;
}

const SpecialtiesSection = ({ subcontractor, specialties }: SpecialtiesSectionProps) => {
  if (!subcontractor.specialty_ids || subcontractor.specialty_ids.length === 0) {
    return null;
  }

  const renderSpecialties = () => {
    return (
      <div className="flex flex-wrap gap-1">
        {subcontractor.specialty_ids.map(id => {
          const specialty = specialties[id];
          return specialty ? (
            <Badge key={id} variant="secondary" className="text-xs">
              {specialty.specialty}
            </Badge>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Specialties</h3>
      <div>
        {renderSpecialties()}
      </div>
    </div>
  );
};

export default SpecialtiesSection;
