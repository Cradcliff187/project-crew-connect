
import { Button } from '@/components/ui/button';

interface ReportBuilderHeaderProps {
  title: string;
  description: string;
  isPreviewMode: boolean;
  onTogglePreviewMode: () => void;
  onSaveReport: () => void;
}

const ReportBuilderHeader = ({
  title,
  description,
  isPreviewMode,
  onTogglePreviewMode,
  onSaveReport
}: ReportBuilderHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold font-montserrat text-[#0485ea]">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant={isPreviewMode ? "default" : "outline"} 
          onClick={onTogglePreviewMode}
        >
          {isPreviewMode ? "Edit Report" : "Preview Report"}
        </Button>
        <Button className="bg-[#0485ea] hover:bg-[#0370c9]" onClick={onSaveReport}>
          Save Report
        </Button>
      </div>
    </div>
  );
};

export default ReportBuilderHeader;
