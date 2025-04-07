
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReportDetailsFormProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const ReportDetailsForm = ({
  name,
  description,
  onNameChange,
  onDescriptionChange
}: ReportDetailsFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-name">Report Name</Label>
          <Input 
            id="report-name" 
            value={name} 
            onChange={(e) => onNameChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="report-description">Description</Label>
          <Input 
            id="report-description" 
            value={description} 
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportDetailsForm;
