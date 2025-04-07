
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
      <CardContent className="pt-6">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-medium">{title}</h2>
          <div className="relative flex-1 ml-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${title}...`}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        {/* Data Table */}
        {loading ? (
          <div className="py-10 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
          </div>
        ) : error ? (
          <div className="py-10 text-center text-destructive">
            <p>Error loading data. Please try again.</p>
          </div>
        ) : data && data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">No data found for the selected filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportContentSection;
