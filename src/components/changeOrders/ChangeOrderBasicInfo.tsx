import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ChangeOrder } from '@/types/changeOrders';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ChangeOrderBasicInfoProps {
  form: UseFormReturn<ChangeOrder>;
  isEditing: boolean;
}

const ChangeOrderBasicInfo = ({ form, isEditing }: ChangeOrderBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Change Order Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  placeholder="Describe the changes required"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="requested_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requested By</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="Name of requester" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requested_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Request Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={'outline'} className="w-full pl-3 text-left font-normal">
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={date => field.onChange(date?.toISOString())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="original_completion_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Original Completion Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={'outline'} className="w-full pl-3 text-left font-normal">
                        {field.value ? (
                          format(new Date(field.value), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={date => field.onChange(date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="new_completion_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>New Completion Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={'outline'} className="w-full pl-3 text-left font-normal">
                        {field.value ? (
                          format(new Date(field.value), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={date => field.onChange(date?.toISOString())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default ChangeOrderBasicInfo;
