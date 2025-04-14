import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import PageTransition from '@/components/layout/PageTransition';

const SubcontractorLoadingView = () => {
  return (
    <PageTransition>
      <div className="container max-w-4xl mx-auto py-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-40 mr-auto" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="grid gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default SubcontractorLoadingView;
