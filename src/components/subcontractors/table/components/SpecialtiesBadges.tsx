
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface SpecialtiesBadgesProps {
  specialtyIds: string[];
  specialties: Record<string, any>;
  loading: boolean;
}

const SpecialtiesBadges = ({ specialtyIds, specialties, loading }: SpecialtiesBadgesProps) => {
  if (loading) {
    return <span className="text-xs text-muted-foreground">Loading...</span>;
  }
  
  if (!specialtyIds || specialtyIds.length === 0) {
    return <span className="text-gray-400 italic">No specialties</span>;
  }
  
  const specialtiesToShow = specialtyIds.slice(0, 2);
  const remainingCount = specialtyIds.length - 2;
  
  return (
    <div className="flex flex-wrap gap-1">
      {specialtiesToShow.map(id => {
        const specialty = specialties[id];
        return specialty ? (
          <Badge 
            key={id} 
            variant="secondary" 
            className="text-xs bg-[#f0f7fe] text-[#0485ea] border-[#dcedfd] whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]"
          >
            {specialty.specialty}
          </Badge>
        ) : null;
      })}
      
      {remainingCount > 0 && (
        <Badge 
          variant="outline" 
          className="text-xs flex items-center gap-1"
        >
          <Tag className="h-3 w-3" />
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

export default SpecialtiesBadges;
