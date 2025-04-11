
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldDefinition } from '@/types/reports';

interface SortAndGroupFormProps {
  selectedFields: FieldDefinition[];
  sortByField?: FieldDefinition;
  sortDirection: 'asc' | 'desc';
  groupByField?: FieldDefinition;
  onSortFieldChange: (field?: FieldDefinition) => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  onGroupByFieldChange: (field?: FieldDefinition) => void;
}

const SortAndGroupForm = ({
  selectedFields,
  sortByField,
  sortDirection,
  groupByField,
  onSortFieldChange,
  onSortDirectionChange,
  onGroupByFieldChange,
}: SortAndGroupFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sorting & Grouping</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={sortByField?.field || "none"}
            onValueChange={(value) => {
              if (value === "none") {
                onSortFieldChange(undefined);
                return;
              }
              
              const field = selectedFields.find(f => f.field === value);
              onSortFieldChange(field);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {selectedFields.map((field) => (
                <SelectItem key={field.field} value={field.field}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {sortByField && (
          <div className="flex items-center space-x-2">
            <Label>Order</Label>
            <Select
              value={sortDirection}
              onValueChange={(value: 'asc' | 'desc') => onSortDirectionChange(value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Group By</Label>
          <Select
            value={groupByField?.field || "none"}
            onValueChange={(value) => {
              if (value === "none") {
                onGroupByFieldChange(undefined);
                return;
              }
              
              const field = selectedFields.find(f => f.field === value);
              onGroupByFieldChange(field);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {selectedFields.map((field) => (
                <SelectItem key={field.field} value={field.field}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default SortAndGroupForm;
