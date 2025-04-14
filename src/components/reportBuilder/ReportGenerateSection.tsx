import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircleDollarSign, Download, ArrowRight, ListFilter } from 'lucide-react';
import { entityNames } from '@/data/reportEntities';
import { EntityType } from '@/types/reports';

interface ReportGenerateSectionProps {
  selectedEntityType: EntityType;
  selectedFieldsCount: number;
  onGeneratePreview: () => void;
}

const ReportGenerateSection = ({
  selectedEntityType,
  selectedFieldsCount,
  onGeneratePreview,
}: ReportGenerateSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Preview</CardTitle>
        <CardDescription>Generate a preview of your report</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center py-8 bg-muted/20 border border-dashed rounded-md text-center">
          <CircleDollarSign className="h-8 w-8 text-muted-foreground mb-2" />
          <h3 className="font-semibold">Configure Your Report</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1 mb-4">
            Add fields, apply filters, and configure visualization options.
          </p>
          <Button onClick={onGeneratePreview} disabled={selectedFieldsCount === 0}>
            Generate Preview
          </Button>
          {selectedFieldsCount === 0 && (
            <p className="text-xs text-muted-foreground mt-2">Please select at least one field</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Selected Entity</div>
          <div className="p-3 bg-background border rounded-md">
            <div className="flex items-center">
              <ListFilter className="h-5 w-5 mr-2 text-[#0485ea]" />
              <span>{entityNames[selectedEntityType]}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Fields Selected</div>
          <div className="p-3 bg-background border rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-[#0485ea]" />
                <span>{selectedFieldsCount} fields selected</span>
              </div>
              {selectedFieldsCount > 0 && (
                <div className="bg-[#0485ea]/10 px-2 py-0.5 rounded-full text-xs font-medium">
                  {selectedFieldsCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-[#0485ea] hover:bg-[#0370c9]"
          onClick={onGeneratePreview}
          disabled={selectedFieldsCount === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportGenerateSection;
