import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { StatusType } from '@/types/common';
import ProjectHeader from './detail/ProjectHeader';
import ProjectInfoCard from './detail/ProjectInfoCard';
import ProjectClientCard from './detail/ProjectClientCard';
import ProjectBudgetCard from './detail/ProjectBudgetCard';
import ProjectDescription from './detail/ProjectDescription';
import ProjectStatusControl from './detail/ProjectStatusControl';
import ProjectBudget from './budget/ProjectBudget';
import ProjectMilestones from './milestones/ProjectMilestones';
import { ProjectDocumentsList } from './detail';
import ProjectProgressCard from './progress/ProjectProgressCard';
import ChangeOrdersList from './detail/ChangeOrdersList';
import { ProjectTimelogs } from './timelogs';
import ProjectOverviewTab from './detail/tabs/ProjectOverviewTab';

export interface ProjectDetails {
  projectid: string;
  projectname: string;
  customername: string | null;
  customerid: string | null;
  jobdescription: string;
  status: string;
  created_at: string;
  sitelocationaddress: string | null;
  sitelocationcity: string | null;
  sitelocationstate: string | null;
  sitelocationzip: string | null;
  total_budget: number | null;
  current_expenses: number | null;
  budget_status: string | null;
  description?: string;
  contract_value?: number;
  start_date?: string | null;
  target_end_date?: string | null;
}

interface ProjectDetailsProps {
  project: ProjectDetails;
  customerDetails?: { customerid: string; customername: string } | null;
  onStatusChange: () => void;
}

const ProjectDetails = ({ project, customerDetails, onStatusChange }: ProjectDetailsProps) => {
  // State to manage active tab
  const [activeTab, setActiveTab] = useState('overview');

  // Function to handle refreshing the project data
  const handleRefresh = () => {
    onStatusChange();
  };

  // Project description from either description or jobdescription field
  const description = project.description || project.jobdescription;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <ProjectHeader project={project} />
        <ProjectStatusControl project={project} onStatusChange={handleRefresh} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="overview" className="text-sm font-opensans">
            Overview
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-sm font-opensans">
            Budget
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-sm font-opensans">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-sm font-opensans">
            Documents
          </TabsTrigger>
          <TabsTrigger value="changes" className="text-sm font-opensans">
            Change Orders
          </TabsTrigger>
          <TabsTrigger value="time" className="text-sm font-opensans">
            Time Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProjectOverviewTab
            project={{
              ...project,
              description: description,
              contract_value: project.contract_value || 0,
            }}
            customerName={customerDetails?.customername || project.customername}
            customerId={customerDetails?.customerid || project.customerid}
            onEditClick={() => {
              // TODO: Implement Edit functionality when needed
            }}
            onAddItemClick={() => {
              // TODO: Implement Add functionality when needed
            }}
          />
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardContent className="pt-6">
              <ProjectBudget projectId={project.projectid} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px] flex items-center justify-center">
                <ProjectMilestones projectId={project.projectid} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocumentsList projectId={project.projectid} />
        </TabsContent>

        <TabsContent value="changes">
          <ChangeOrdersList projectId={project.projectid} onChangeOrderAdded={handleRefresh} />
        </TabsContent>

        <TabsContent value="time">
          <ProjectTimelogs projectId={project.projectid} onTimeLogAdded={handleRefresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetails;
