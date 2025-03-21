
import React from 'react';

const DocumentLoading: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-md"></div>
      ))}
    </div>
  );
};

export default DocumentLoading;
