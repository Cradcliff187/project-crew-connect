
import { Button } from '@/components/ui/button';
import { Filter, FileDown, BarChart3 } from 'lucide-react';

interface ReportPageHeaderProps {
  title: string;
  description: string;
  onToggleFilters: () => void;
  onExportCsv: () => void;
  showFilters: boolean;
}

const ReportPageHeader = ({
  title,
  description,
  onToggleFilters,
  onExportCsv,
  showFilters
}: ReportPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold font-montserrat text-[#0485ea]">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onToggleFilters} 
          variant="outline"
          className={showFilters ? "bg-muted" : ""}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters {showFilters ? "▼" : "▶"}
        </Button>
        <Button onClick={onExportCsv} className="bg-[#0485ea] hover:bg-[#0370c9]">
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/report-builder'}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Report Builder
        </Button>
      </div>
    </div>
  );
};

export default ReportPageHeader;
