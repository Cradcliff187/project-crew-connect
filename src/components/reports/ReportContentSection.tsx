import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Search, Loader2, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FieldDefinition } from '@/types/reports';
import { generateTableColumns } from '@/utils/reportUtils';
import StatusBadge from '@/components/common/status/StatusBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  fields,
}: ReportContentSectionProps) => {
  // Custom column generator that handles status badges properly
  const columns = fields.map(field => ({
    accessorKey: field.field,
    header: ({ column }) => (
      <div className="flex items-center space-x-1">
        <span>{field.label}</span>
        {field.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{field.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    ),
    cell: ({ row }: { row: any }) => {
      try {
        const value = row.getValue(field.field);

        // Format the value based on its type
        if (value === null || value === undefined) {
          return '—';
        }

        // Handle specific field types
        let formattedValue;
        switch (field.type) {
          case 'date':
            try {
              formattedValue = new Date(value).toLocaleDateString();
            } catch (e) {
              formattedValue = '—';
            }
            break;
          case 'currency':
            try {
              formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value);
            } catch (e) {
              formattedValue = '$0';
            }
            break;
          case 'percentage':
            try {
              formattedValue = `${Number(value).toFixed(1)}%`;
            } catch (e) {
              formattedValue = '0%';
            }
            break;
          case 'status':
            return <StatusBadge status={String(value)} />;
          case 'boolean':
            formattedValue = value ? 'Yes' : 'No';
            break;
          default:
            formattedValue = String(value);
        }

        // For non-status fields, wrap with tooltip for better readability
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="truncate max-w-[200px]">{formattedValue}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formattedValue}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      } catch (e) {
        console.error('Error rendering cell value:', e);
        return '—';
      }
    },
  }));

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
              onChange={e => onSearchChange(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>

        {/* Data Table - Excel-style with compact rows */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              defaultSorting={{
                columnId: data[0] ? Object.keys(data[0])[0] : fields[0]?.field,
                direction: 'asc',
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
