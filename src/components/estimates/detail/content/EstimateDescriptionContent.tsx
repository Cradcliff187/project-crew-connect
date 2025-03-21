
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EstimateDescriptionContentProps {
  description?: string;
}

const EstimateDescriptionContent: React.FC<EstimateDescriptionContentProps> = ({ description }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {description ? (
          <div className="prose max-w-none">
            <p>{description}</p>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No description provided for this estimate.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateDescriptionContent;
