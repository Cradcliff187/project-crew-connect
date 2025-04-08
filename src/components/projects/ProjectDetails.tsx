
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
import ProjectBudget from './detail/ProjectBudget';
import ProjectMilestones from './detail/ProjectMilestones';
import { ProjectDocumentsList } from './detail';
import ProjectProgressCard from './progress/ProjectProgressCard';
import ChangeOrdersList from './detail/ChangeOrdersList';
import { ProjectTimelogs } from './timelogs';

export interface ProjectDetails {
  projectid: string;
  projectname: string;
  customername: string | null;
  customerid: string | null;
  jobdescription: string;
  status: string;
  createdon: string;
  sitelocationaddress: string | null;
  sitelocationcity: string | null;
  sitelocationstate: string | null;
  sitelocationzip: string | null;
  total_budget: number | null;
  current_expenses: number | null;
  budget_status: string | null;
}

interface ProjectDetailsProps {
  project: ProjectDetails;
  customerDetails?: { customerid: string; customername: string } | null;
  onStatusChange: () => void;
}

const ProjectDetails = ({ project, customerDetails, onStatusChange }: ProjectDetailsProps) => {
  // State to manage active tab
  const [activeTab, setActiveTab] = useState("overview");
  
  // Function to handle refreshing the project data
  const handleRefresh = () => {
    onStatusChange();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <ProjectHeader project={project} />
        <ProjectStatusControl project={project} onStatusChange={handleRefresh} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="budget" className="text-sm">Budget</TabsTrigger>
          <TabsTrigger value="schedule" className="text-sm">Timeline</TabsTrigger>
          <TabsTrigger value="documents" className="text-sm">Documents</TabsTrigger>
          <TabsTrigger value="changes" className="text-sm">Change Orders</TabsTrigger>
          <TabsTrigger value="time" className="text-sm">Time Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProjectInfoCard project={project} />
            <ProjectClientCard 
              project={project} 
              customerName={customerDetails?.customername || project.customername} 
              customerId={customerDetails?.customerid || project.customerid}
            />
            <ProjectBudgetCard project={project} />
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <ProjectDescription description={project.jobdescription} />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-base font-medium mb-4">Project Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    This project is currently managed with status <span className="font-medium">{project.status}</span>.
                    {project.status === 'completed' ? 
                      ' The project has been completed.' : 
                      project.status === 'active' ? ' Work is in progress.' : ' Work has not started yet.'}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div>
              <ProjectProgressCard projectId={project.projectid} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="budget">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[300px] flex items-center justify-center">
                <ProjectBudget projectId={project.projectid} />
              </div>
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
