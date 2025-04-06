
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import ProjectFinancialReport from '@/components/reports/ProjectFinancialReport';

const Reports: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectParam = searchParams.get('project');
  const [activeTab, setActiveTab] = useState('project-financial');
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  // Handle direct linking with project ID
  useEffect(() => {
    if (projectParam) {
      setSelectedProjectId(projectParam);
      setActiveTab('project-financial');
    }
  }, [projectParam]);

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Financial Reports"
          description="View and analyze financial performance across your business"
        />

        <div className="mt-6">
          <Tabs defaultValue="project-financial" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="w-full grid grid-cols-1 md:grid-cols-5">
              <TabsTrigger value="project-financial">Project Financial Summary</TabsTrigger>
              <TabsTrigger value="estimate-analysis" disabled>Estimate Analysis</TabsTrigger>
              <TabsTrigger value="work-order-cost" disabled>Work Order Cost Analysis</TabsTrigger>
              <TabsTrigger value="labor-utilization" disabled>Labor Utilization</TabsTrigger>
              <TabsTrigger value="vendor-performance" disabled>Vendor Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="project-financial" className="mt-6">
              <ProjectFinancialReport projectId={selectedProjectId} />
            </TabsContent>
            <TabsContent value="estimate-analysis" className="mt-6">
              <div className="text-center p-10 text-muted-foreground">
                Estimate Analysis report is under development.
              </div>
            </TabsContent>
            <TabsContent value="work-order-cost" className="mt-6">
              <div className="text-center p-10 text-muted-foreground">
                Work Order Cost Analysis report is under development.
              </div>
            </TabsContent>
            <TabsContent value="labor-utilization" className="mt-6">
              <div className="text-center p-10 text-muted-foreground">
                Labor Utilization report is under development.
              </div>
            </TabsContent>
            <TabsContent value="vendor-performance" className="mt-6">
              <div className="text-center p-10 text-muted-foreground">
                Vendor Performance report is under development.
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default Reports;
