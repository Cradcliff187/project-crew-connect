
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, ListFilter, LineChart, PieChart } from 'lucide-react';
import { ChartTypeOption } from '@/types/reports';

const chartTypes: ChartTypeOption[] = [
  { value: 'table', label: 'Table', icon: <ListFilter className="h-4 w-4" /> },
  { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
  { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> }
];

interface ChartTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const ChartTypeSelector = ({ value, onChange }: ChartTypeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualization</CardTitle>
        <CardDescription>Select how to display your report data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <Select
              value={value}
              onValueChange={onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map(chart => (
                  <SelectItem key={chart.value} value={chart.value}>
                    <div className="flex items-center">
                      {chart.icon}
                      <span className="ml-2">{chart.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartTypeSelector;
