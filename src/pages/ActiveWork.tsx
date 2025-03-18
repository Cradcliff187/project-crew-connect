
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTransition from '@/components/layout/PageTransition';
import ActiveWorkTable from '@/components/activeWork/ActiveWorkTable';
import ActiveWorkDashboard from '@/components/activeWork/ActiveWorkDashboard';
import ActiveWorkHeader from '@/components/activeWork/ActiveWorkHeader';
import { useActiveWorkData } from '@/components/activeWork/hooks/useActiveWorkData';
import { filterWorkItems } from '@/components/activeWork/utils/filterUtils';

const ActiveWork = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'dashboard'>('table');
  const [activeTab, setActiveTab] = useState('all');

  // Use the custom hook to fetch data
  const {
    allItems,
    projectsLoading,
    workOrdersLoading,
    projectsError,
    workOrdersError,
    handleWorkOrderChange
  } = useActiveWorkData();

  // Show error toast if there's an error
  if (projectsError && !toast.check({ title: 'Error fetching projects' })) {
    toast({
      title: 'Error fetching projects',
      description: (projectsError as Error).message,
      variant: 'destructive'
    });
  }

  // Apply filters
  const filteredItems = filterWorkItems(allItems, activeTab, searchQuery);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <ActiveWorkHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="all">All Work</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="workOrders">Work Orders</TabsTrigger>
          </TabsList>
          
          {viewMode === 'table' ? (
            <TabsContent value={activeTab} className="space-y-6">
              <ActiveWorkTable 
                items={filteredItems}
                loading={projectsLoading || workOrdersLoading}
                projectsError={projectsError ? (projectsError as Error).message : null}
                workOrdersError={workOrdersError ? (workOrdersError as Error).message : null}
                onWorkOrderChange={handleWorkOrderChange}
              />
            </TabsContent>
          ) : (
            <TabsContent value={activeTab} className="pt-4">
              <ActiveWorkDashboard 
                items={filteredItems}
                projectsLoading={projectsLoading}
                workOrdersLoading={workOrdersLoading}
                searchQuery={searchQuery}
                onWorkOrderChange={handleWorkOrderChange}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default ActiveWork;
