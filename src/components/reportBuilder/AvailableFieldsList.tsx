import { Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FieldDefinition } from '@/types/reports';

interface AvailableFieldsListProps {
  fields: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
}

const AvailableFieldsList = ({ fields, onAddField }: AvailableFieldsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Fields</CardTitle>
        <CardDescription>Click to add fields to your report</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {fields.map(field => (
            <Button
              key={field.field}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onAddField(field)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {field.label}
              <Badge variant="outline" className="ml-2 text-xs">
                {field.type}
              </Badge>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailableFieldsList;
