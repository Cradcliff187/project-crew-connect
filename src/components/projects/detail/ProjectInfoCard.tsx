import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Database } from '@/integrations/supabase/types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectInfoCardProps {
  project: Project;
}

const ProjectInfoCard = ({ project }: ProjectInfoCardProps) => {
  // Log the correct prop now
  console.log('ProjectInfoCard - created_at prop:', project.created_at);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
            <div>
              <p className="font-medium">Created On</p>
              <p className="text-sm text-muted-foreground">{formatDate(project.created_at)}</p>
            </div>
          </div>

          {/* Additional project info could be added here */}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInfoCard;
