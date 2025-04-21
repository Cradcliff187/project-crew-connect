import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import ProjectHeader from '@/components/projects/detail/ProjectHeader';
import ProjectInfoCard from '@/components/projects/detail/ProjectInfoCard';
import ProjectClientCard from '@/components/projects/detail/ProjectClientCard';
import ProjectBudgetCard from '@/components/projects/detail/ProjectBudgetCard';
import ProjectDescription from '@/components/projects/detail/ProjectDescription';
import ProjectBudgetTab from '@/components/projects/detail/tabs/ProjectBudgetTab';
import ProjectMilestones from '@/components/projects/detail/ProjectMilestones';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (projectId) {
      fetchProjectData(projectId);
    } else {
      setError('Project ID is missing');
      setLoading(false);
    }
  }, [projectId]);

  const fetchProjectData = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [projectResult, budgetItemsResult, milestonesResult] = await Promise.all([
        supabase.from('projects').select('*').eq('projectid', id).single(),
        supabase.from('project_budget_items').select('*').eq('project_id', id).order('created_at'),
        supabase.from('project_milestones').select('*').eq('projectid', id).order('due_date'),
      ]);

      if (projectResult.error) throw projectResult.error;
      if (!projectResult.data) throw new Error('Project not found');
      setProject(projectResult.data);

      if (budgetItemsResult.error) {
        console.warn('Error fetching budget items:', budgetItemsResult.error);
        setBudgetItems([]);
      } else {
        setBudgetItems(budgetItemsResult.data || []);
      }

      if (milestonesResult.error) {
        console.warn('Error fetching milestones:', milestonesResult.error);
        setMilestones([]);
      } else {
        setMilestones(milestonesResult.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching project data:', error);
      setError(error.message || 'Error fetching project data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        </div>
      </PageTransition>
    );
  }

  if (error || !project) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/projects')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Error Loading Project</h1>
                <p className="mt-2 text-gray-600">{error || 'Project not found'}</p>
                <Button
                  onClick={() => navigate('/projects')}
                  className="mt-4 bg-[#0485ea] hover:bg-[#0373ce]"
                >
                  Return to Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/projects')} size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-xl font-bold">{project.projectname || 'Project Details'}</h1>
          </div>
          <Badge
            variant={project.status === 'ACTIVE' ? 'default' : 'outline'}
            className="capitalize"
          >
            {project.status || 'No Status'}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 w-full rounded-lg border p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="changes">Change Orders</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <ProjectInfoCard project={project} />
                  <ProjectDescription description={project.jobdescription} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <ProjectClientCard
                    customerName={project.customername}
                    customerId={project.customerid}
                  />
                  <ProjectBudgetCard project={project} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="mt-0">
              <ProjectBudgetTab budgetItems={budgetItems} totalBudget={project.total_budget} />
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <ProjectMilestones projectId={project.projectid} />
            </TabsContent>

            <TabsContent value="changes" className="mt-0">
              <Card>
                <CardContent className="p-6">Change Orders Content</CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <Card>
                <CardContent className="p-6">Documents Content</CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default ProjectDetail;
