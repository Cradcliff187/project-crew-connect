import React from 'react';
import { Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface Project {
  projectid: string;
  projectname?: string;
}

interface AssociatedProjectsCardProps {
  projects: Project[];
  loading: boolean;
}

const AssociatedProjectsCard = ({ projects, loading }: AssociatedProjectsCardProps) => {
  const navigate = useNavigate();

  if (projects.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Associated Projects</h3>
      <div className="grid gap-2">
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          projects.map(project => (
            <Card key={project.projectid} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{project.projectname || 'Unnamed Project'}</div>
                    <div className="text-xs text-muted-foreground">{project.projectid}</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/projects/${project.projectid}`)}
                >
                  View Project
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AssociatedProjectsCard;
