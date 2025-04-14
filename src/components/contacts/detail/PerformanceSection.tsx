import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Star, BarChart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  PerformanceMetric,
  fetchPerformanceMetrics,
  addPerformanceMetric,
  getMetricTypeOptions,
} from './util/contactPerformance';
import { format } from 'date-fns';
import { Contact } from '@/pages/Contacts';

const formSchema = z.object({
  metric_type: z.string({
    required_error: 'Please select a metric type',
  }),
  score: z
    .number({
      required_error: 'Please select a score',
    })
    .min(1)
    .max(5),
  notes: z.string().optional(),
});

interface PerformanceSectionProps {
  contact: Contact;
  onMetricAdded?: () => void;
}

const PerformanceSection = ({ contact, onMetricAdded }: PerformanceSectionProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metric_type: '',
      score: 3,
      notes: '',
    },
  });

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const data = await fetchPerformanceMetrics(contact.id);
        setMetrics(data);
      } catch (error) {
        console.error('Error loading performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, [contact.id, refreshTrigger]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addPerformanceMetric(contact.id, values.metric_type, values.score, values.notes);
      setShowAddDialog(false);
      form.reset();
      setRefreshTrigger(prev => prev + 1);

      if (onMetricAdded) {
        onMetricAdded();
      }
    } catch (error) {
      console.error('Error adding performance metric:', error);
    }
  };

  // Calculate averages by metric type
  const calculateAveragesByType = () => {
    const groups: { [key: string]: number[] } = {};

    metrics.forEach(metric => {
      if (!groups[metric.metric_type]) {
        groups[metric.metric_type] = [];
      }
      groups[metric.metric_type].push(metric.score);
    });

    return Object.entries(groups).map(([type, scores]) => {
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return { type, average: Math.round(average * 10) / 10 };
    });
  };

  const averages = calculateAveragesByType();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Performance Metrics</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="default"
            className="bg-[#0485ea] hover:bg-[#0375d1]"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Metric
          </Button>
        </div>
      </div>

      {/* Performance Summary */}
      {averages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {averages.map(({ type, average }) => (
            <div
              key={type}
              className="bg-white border rounded-md shadow-sm p-4 flex items-center justify-between"
            >
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">{type}</h4>
                <div className="mt-1 flex items-center">
                  <span className="text-2xl font-semibold mr-2">{average}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${n <= average ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <BarChart className="h-8 w-8 text-muted-foreground/50" />
            </div>
          ))}
        </div>
      )}

      {/* Metrics History */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Metrics History</h4>

        {metrics.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
            No performance metrics recorded for this contact yet.
          </div>
        ) : (
          <div className="space-y-2">
            {metrics.map(metric => (
              <div
                key={metric.id}
                className="flex gap-3 p-3 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2 gap-1">
                    <h4 className="font-medium">{metric.metric_type}</h4>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                      {format(new Date(metric.metric_date), 'PP')}
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          className={`h-4 w-4 ${n <= metric.score ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">{metric.score}/5</span>
                  </div>
                  {metric.notes && <p className="text-sm">{metric.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Performance Metric</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="metric_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getMetricTypeOptions(contact.type).map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Score (1-5)</FormLabel>
                    <Select
                      onValueChange={value => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select score" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">★ Poor</SelectItem>
                        <SelectItem value="2">★★ Fair</SelectItem>
                        <SelectItem value="3">★★★ Good</SelectItem>
                        <SelectItem value="4">★★★★ Very Good</SelectItem>
                        <SelectItem value="5">★★★★★ Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional details about this metric"
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0485ea] hover:bg-[#0375d1]">
                  Add Metric
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PerformanceSection;
