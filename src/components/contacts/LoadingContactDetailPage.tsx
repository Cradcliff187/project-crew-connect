import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import PageTransition from '@/components/layout/PageTransition';

const LoadingContactDetailPage = () => {
  return (
    <PageTransition>
      <div className="container max-w-6xl py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button variant="outline" size="icon" asChild className="mr-4">
              <Link to="/contacts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-start">
                      <Skeleton className="h-5 w-5 mr-2 mt-0.5" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-start">
                        <Skeleton className="h-5 w-5 mr-2 mt-0.5" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Skeleton className="h-[400px] w-full" />
          </TabsContent>

          <TabsContent value="activity">
            <Skeleton className="h-[400px] w-full" />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default LoadingContactDetailPage;
