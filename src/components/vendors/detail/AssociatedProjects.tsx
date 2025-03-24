
import React from 'react';
import { Calendar, Folder } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '../utils/vendorUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { VendorProject } from './types';

interface AssociatedProjectsProps {
  projects: VendorProject[];
  loading: boolean;
}

const AssociatedProjects: React.FC<AssociatedProjectsProps> = ({ projects, loading }) => {
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Associated Projects
        </h3>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center pb-4 border-b">
            <div className="space-y-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Folder className="h-5 w-5" />
          Associated Projects
        </h3>
        <div className="text-center py-6 text-muted-foreground">
          <Folder className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p>No projects are associated with this vendor yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Folder className="h-5 w-5" />
        Associated Projects
      </h3>
      <div className="space-y-4">
        {projects.map((project) => (
          <div 
            key={project.project_id} 
            className="flex justify-between items-center pb-4 border-b last:border-b-0 last:pb-0"
          >
            <div className="space-y-1">
              <h4 className="font-medium">{project.project_name}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(project.created_at)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={project.status || 'unknown'} size="sm" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8"
                onClick={() => handleProjectClick(project.project_id)}
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssociatedProjects;
