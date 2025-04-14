import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTransition from '@/components/layout/PageTransition';
import ActiveWorkTable from '@/components/activeWork/ActiveWorkTable';
import ActiveWorkDashboard from '@/components/activeWork/ActiveWorkDashboard';
import ActiveWorkHeader from '@/components/activeWork/ActiveWorkHeader';
import { useActiveWorkData } from '@/components/activeWork/hooks/useActiveWorkData';
import { filterWorkItems } from '@/components/activeWork/utils/filterUtils';

const ActiveWork = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'dashboard'>('table');
  const [activeTab, setActiveTab] = useState('all');

  // Get tab from URL if present
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['all', 'projects', 'workOrders'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('tab', value);
      return newParams;
    });
  };

  // Use the custom hook to fetch data
  const {
    allItems,
    projectsLoading,
    workOrdersLoading,
    projectsError,
    workOrdersError,
    handleWorkOrderChange,
  } = useActiveWorkData();

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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
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
