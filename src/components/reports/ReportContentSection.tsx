
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FieldDefinition } from '@/types/reports';
import { generateTableColumns } from '@/utils/reportUtils';

interface ReportContentSectionProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  data: any[];
  loading: boolean;
  error: boolean;
  fields: FieldDefinition[];
}

const ReportContentSection = ({
  title,
  searchValue,
  onSearchChange,
  data,
  loading,
  error,
  fields
}: ReportContentSectionProps) => {
  const columns = generateTableColumns(fields);

  return (
    <Card className="shadow-sm">
      <CardContent className="p-2">
        <div className="flex items-center mb-2">
          <h2 className="text-base font-medium">{title}</h2>
          <div className="relative flex-1 ml-3">
            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={`Search ${title}...`}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>
        
        {/* Data Table - Excel-style with compact rows */}
        {loading ? (
          <div className="py-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0485ea]"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-destructive">
            <p>Error loading data. Please try again.</p>
          </div>
        ) : data && data.length > 0 ? (
          <div className="border rounded-sm overflow-auto excel-style">
            <DataTable 
              columns={columns} 
              data={data}
              compact={true}
              defaultSorting={{ columnId: Object.keys(data[0])[0], direction: 'asc' }}
            />
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No data found for the selected filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportContentSection;
