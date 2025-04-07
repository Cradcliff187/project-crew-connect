
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
          <div className="border rounded-sm overflow-auto">
            <DataTable 
              columns={columns} 
              data={data}
              className="excel-style"
              compact={true}
              defaultSorting={{ columnId: Object.keys(data[0])[0], direction: 'asc' }}
              pagination={{
                pageSize: 25,
                pageSizeOptions: [10, 25, 50, 100]
              }}
              cssClass={{
                table: "border-collapse border-spacing-0",
                thead: "bg-[#f8f9fa] text-xs font-medium text-muted-foreground",
                th: "py-1.5 px-2 border-b border-r border-border",
                cell: "py-1 px-2 text-xs border-b border-r border-border whitespace-nowrap",
                pagination: "mt-2"
              }}
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
