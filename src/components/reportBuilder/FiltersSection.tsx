
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldDefinition, FilterDefinition } from '@/types/reports';
import { Plus, Trash2 } from 'lucide-react';
import { entityFields } from '@/data/reportEntities';

interface FiltersSectionProps {
  entityType: string;
  filters: FilterDefinition[];
  onAddFilter: (filter: FilterDefinition) => void;
  onRemoveFilter: (id: string) => void;
}

const FiltersSection = ({
  entityType,
  filters,
  onAddFilter,
  onRemoveFilter
}: FiltersSectionProps) => {
  const [currentFilter, setCurrentFilter] = useState<Partial<FilterDefinition>>({
    id: '',
    field: undefined,
    operator: 'equals',
    value: ''
  });
  
  const handleAddFilter = () => {
    if (!currentFilter.field) return;
    
    const newFilter: FilterDefinition = {
      id: `filter-${Date.now()}`,
      field: currentFilter.field as FieldDefinition,
      operator: currentFilter.operator || 'equals',
      value: currentFilter.value || ''
    };
    
    onAddFilter(newFilter);
    
    setCurrentFilter({
      id: '',
      field: undefined,
      operator: 'equals',
      value: ''
    });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter the data in your report</CardDescription>
        </div>
        <Badge variant="outline">{filters.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 p-4 border rounded-md">
          <div className="space-y-2">
            <Label>Field</Label>
            <Select
              value={currentFilter.field?.field || ''}
              onValueChange={(value) => {
                const field = (entityFields as any)[entityType].find((f: any) => f.field === value);
                setCurrentFilter(prev => ({
                  ...prev,
                  field
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {(entityFields as any)[entityType].map((field: FieldDefinition) => (
                  <SelectItem key={field.field} value={field.field}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Operator</Label>
            <Select
              value={currentFilter.operator || 'equals'}
              onValueChange={(value) => {
                setCurrentFilter(prev => ({
                  ...prev,
                  operator: value
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="notEquals">Not Equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="startsWith">Starts With</SelectItem>
                <SelectItem value="greaterThan">Greater Than</SelectItem>
                <SelectItem value="lessThan">Less Than</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              value={currentFilter.value || ''}
              onChange={(e) => {
                setCurrentFilter(prev => ({
                  ...prev,
                  value: e.target.value
                }));
              }}
            />
          </div>
          
          <Button className="w-full" onClick={handleAddFilter}>
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>
        
        {filters.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Active Filters</div>
            <div className="space-y-2">
              {filters.map(filter => (
                <div key={filter.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                  <div className="text-sm">
                    <span className="font-medium">{filter.field.label}</span>
                    <span className="mx-1 text-muted-foreground">
                      {filter.operator === 'equals' && '='}
                      {filter.operator === 'notEquals' && '≠'}
                      {filter.operator === 'contains' && 'contains'}
                      {filter.operator === 'startsWith' && 'starts with'}
                      {filter.operator === 'greaterThan' && '>'}
                      {filter.operator === 'lessThan' && '<'}
                    </span>
                    <span className="font-medium">{filter.value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFilter(filter.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltersSection;
