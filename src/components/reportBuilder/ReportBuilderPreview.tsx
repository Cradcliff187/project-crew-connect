
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ReportConfig } from '@/types/reports';
import { generateSqlQuery } from '@/utils/reportUtils';
import { generateTableColumns } from '@/utils/reportUtils';

interface ReportBuilderPreviewProps {
  reportConfig: ReportConfig;
  previewData: any[];
}

const ReportBuilderPreview = ({ reportConfig, previewData }: ReportBuilderPreviewProps) => {
  const previewColumns = generateTableColumns(reportConfig.selectedFields);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{reportConfig.name}</CardTitle>
          <CardDescription>{reportConfig.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {reportConfig.chartType === 'table' ? (
            previewData.length > 0 ? (
              <DataTable
                columns={previewColumns}
                data={previewData}
              />
            ) : (
              <div className="flex items-center justify-center h-40 border rounded-md">
                <p className="text-muted-foreground">No data to display</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-80 border rounded-md">
              <div className="text-center">
                <p className="text-muted-foreground">Chart preview placeholder</p>
                <p className="text-sm text-muted-foreground">
                  {reportConfig.chartType.charAt(0).toUpperCase() + reportConfig.chartType.slice(1)} chart
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <div className="text-sm text-muted-foreground">
            {previewData.length} records
          </div>
          <Button variant="outline" onClick={() => console.log("Export")}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>SQL Query</CardTitle>
          <CardDescription>The generated SQL query for this report</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
            {generateSqlQuery(reportConfig)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportBuilderPreview;
