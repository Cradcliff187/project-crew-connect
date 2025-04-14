import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityType } from '@/types/reports';
import { entityNames } from '@/data/reportEntities';

interface EntitySelectorProps {
  value: EntityType;
  onChange: (value: EntityType) => void;
}

const EntitySelector = ({ value, onChange }: EntitySelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Primary Entity</CardTitle>
        <CardDescription>Select the main data entity for this report</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Select value={value} onValueChange={value => onChange(value as EntityType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an entity" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(entityNames).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default EntitySelector;
