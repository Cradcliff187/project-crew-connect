
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SubcontractorSpecialtiesProps {
  specialtyIds: string[];
  specialties: Record<string, any>;
}

const SubcontractorSpecialties = ({ specialtyIds, specialties }: SubcontractorSpecialtiesProps) => {
  if (!specialtyIds || specialtyIds.length === 0) {
    return <span className="text-muted-foreground italic">None</span>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {specialtyIds.map(id => {
        const specialty = specialties[id];
        return specialty ? (
          <Badge key={id} variant="secondary" className="text-xs bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd]">
            {specialty.specialty}
          </Badge>
        ) : null;
      })}
    </div>
  );
};

export default SubcontractorSpecialties;
