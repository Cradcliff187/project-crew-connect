
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface DocumentsCardProps {
  onUploadClick: () => void;
}

const DocumentsCard = ({ onUploadClick }: DocumentsCardProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-warmgray-50/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-montserrat">Documents</CardTitle>
          <Button 
            onClick={onUploadClick}
            size="sm"
            variant="earth"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mt-2">
          <p>
            Upload work order related documents such as:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Customer approvals</li>
            <li>Photos of the work performed</li>
            <li>Material receipts</li>
            <li>Inspection reports</li>
            <li>Signed completion forms</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsCard;
