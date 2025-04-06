
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EstimateDetailLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
}

/**
 * A two-panel layout component for the estimate detail page
 * Provides a consistent structure with a sidebar for key information
 * and a main content area for detailed views
 */
const EstimateDetailLayout: React.FC<EstimateDetailLayoutProps> = ({ 
  sidebar, 
  main 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        {sidebar}
      </div>
      <div className="lg:col-span-2">
        {main}
      </div>
    </div>
  );
};

export default EstimateDetailLayout;
