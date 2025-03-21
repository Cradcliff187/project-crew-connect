
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const EstimateDocumentsTab: React.FC = () => {
  return (
    <Card>
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
