import React from 'react';
import { MapPin } from 'lucide-react';

interface SubcontractorLocationProps {
  city: string | null;
  state: string | null;
}

const SubcontractorLocation = ({ city, state }: SubcontractorLocationProps) => {
  return (
    <div className="flex items-start gap-1">
      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <span className="text-sm">
        {city && state ? `${city}, ${state}` : city || state || 'No location information'}
      </span>
    </div>
  );
};

export default SubcontractorLocation;
