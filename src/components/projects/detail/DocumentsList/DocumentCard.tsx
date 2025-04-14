import { File, Eye, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ProjectDocument } from './types';

interface DocumentCardProps {
  document: ProjectDocument;
  onView: () => void;
}

const DocumentCard = ({ document, onView }: DocumentCardProps) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="h-24 bg-muted flex items-center justify-center">
        <File className="h-12 w-12 text-muted-foreground" />
      </div>
      <CardContent className="p-4">
        <h4 className="font-medium text-sm truncate mb-1">{document.file_name}</h4>
        <p className="text-xs text-muted-foreground mb-2">{formatDate(document.created_at)}</p>

        <div className="flex justify-between mt-2">
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onView}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
