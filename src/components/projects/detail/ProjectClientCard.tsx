import { User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectDetails } from '../ProjectDetails';

interface ProjectClientCardProps {
  project: ProjectDetails;
  customerName: string | null;
  customerId: string | null;
}

const ProjectClientCard = ({ project, customerName, customerId }: ProjectClientCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <User className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Client</p>
              <p className="text-sm font-medium">{customerName || 'No Client Assigned'}</p>
              {customerId && (
                <p className="text-xs text-muted-foreground">Client ID: {customerId}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectClientCard;
