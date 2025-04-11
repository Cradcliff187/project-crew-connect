
import React from 'react';

interface SubcontractorInfoProps {
  name: string;
  id: string;
}

const SubcontractorInfo = ({ name, id }: SubcontractorInfoProps) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{id}</span>
    </div>
  );
};

export default SubcontractorInfo;
