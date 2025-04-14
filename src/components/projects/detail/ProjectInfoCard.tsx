import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectDetails } from '../ProjectDetails';
import { formatDate } from '@/lib/utils';

interface ProjectInfoCardProps {
  project: ProjectDetails;
}

const ProjectInfoCard = ({ project }: ProjectInfoCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Created On</p>
              <p className="text-sm text-muted-foreground">{formatDate(project.createdon)}</p>
            </div>
          </div>

          {/* Additional project info could be added here */}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoCard;
