import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Download, FileText } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
// Removed import of WorkOrderDocument from ./types
import { Database } from '@/integrations/supabase/types';

// Use generated type alias
type DocumentRow = Database['public']['Tables']['documents']['Row'];

interface DocumentCardProps {
  document: DocumentRow;
  onViewDocument: (document: DocumentRow) => void;
}

const DocumentCard = ({ document, onViewDocument }: DocumentCardProps) => {
  return (
    <Card key={document.document_id} className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start">
          <FileText className="h-10 w-10 mr-3 text-muted-foreground shrink-0" />
          <div className="overflow-hidden">
            <p className="font-medium truncate">{document.file_name || 'Untitled'}</p>
            <p className="text-xs text-muted-foreground">
              {/* Ensure document properties exist before accessing */}
              {(document.is_expense ? 'Expense Receipt' : document.category || 'Uncategorized') +
                (document.created_at ? ` • ${formatDate(document.created_at)}` : '')}
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                // Use theme colors
                className="text-primary border-primary/30 hover:bg-primary/10"
                onClick={() => onViewDocument(document)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                // Use theme colors
                className="text-primary border-primary/30 hover:bg-primary/10"
                asChild
                // Disable if URL is missing
                disabled={!document.storage_path}
              >
                {/* Generate URL dynamically or ensure it's passed if needed */}
                {/* Assuming a function getPublicUrl exists or needs to be created */}
                {/* For now, let's just disable if no path */}
                <a
                  href={
                    document.storage_path ? `/placeholder-download/${document.storage_path}` : '#'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-disabled={!document.storage_path}
                  onClick={e => !document.storage_path && e.preventDefault()}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
