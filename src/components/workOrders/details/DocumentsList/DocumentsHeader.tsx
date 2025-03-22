
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface DocumentsHeaderProps {
  showUploadForm: boolean;
  toggleUploadForm: () => void;
}

const DocumentsHeader = ({ showUploadForm, toggleUploadForm }: DocumentsHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg">Documents & Receipts</CardTitle>
        <Button 
          variant={showUploadForm ? "outline" : "default"}
          className={showUploadForm 
            ? "text-[#0485ea] border-[#0485ea]/30 hover:bg-blue-50" 
            : "bg-[#0485ea] hover:bg-[#0375d1]"}
          onClick={toggleUploadForm}
        >
          {showUploadForm ? (
            <>
              <X className="h-4 w-4 mr-1" />
              Cancel Upload
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-1" />
              Upload Document
            </>
          )}
        </Button>
      </div>
    </CardHeader>
  );
};

export default DocumentsHeader;
