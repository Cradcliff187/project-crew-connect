
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';

const EstimateDocumentsTab: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <Card className={isMobile ? "px-2" : ""}>
      <CardHeader>
        <CardTitle>Related Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          No documents attached to this estimate.
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateDocumentsTab;
