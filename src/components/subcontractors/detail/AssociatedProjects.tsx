
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Folder } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/components/subcontractors/utils/formatUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AssociatedProjectsProps {
  projects: any[];
  loading: boolean;
}

const AssociatedProjects: React.FC<AssociatedProjectsProps> = ({ projects, loading }) => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Associated Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center pb-4 border-b">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Associated Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Folder className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No projects are associated with this subcontractor yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Associated Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => (
          <div 
            key={project.projectid} 
            className="flex justify-between items-center pb-4 border-b last:border-b-0 last:pb-0"
          >
            <div className="space-y-1">
              <h4 className="font-medium">{project.projectname}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(project.createdon)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status || 'unknown'} size="sm" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8"
                onClick={() => handleProjectClick(project.projectid)}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssociatedProjects;
