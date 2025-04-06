
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

interface ReportFiltersProps {
  selectedProjectId?: string;
  dateRange: { start: Date | null; end: Date | null };
  onProjectSelect: (projectId: string) => void;
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedProjectId,
  dateRange,
  onProjectSelect,
  onDateRangeChange
}) => {
  const [open, setOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Fetch projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('projectid, projectname')
        .order('createdon', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-full md:w-1/3">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedProjectId
                    ? projects.find((project) => project.projectid === selectedProjectId)?.projectname || "Select project..."
                    : "Select project..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search projects..." />
                  <CommandEmpty>No project found.</CommandEmpty>
                  <CommandGroup>
                    {projects.map((project) => (
                      <CommandItem
                        key={project.projectid}
                        value={project.projectid}
                        onSelect={() => {
                          onProjectSelect(project.projectid);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProjectId === project.projectid ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {project.projectname}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !dateRange.start && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.start ? format(dateRange.start, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.start || undefined}
                  onSelect={(date) => {
                    onDateRangeChange({ ...dateRange, start: date });
                    setStartDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[180px] justify-start text-left font-normal",
                    !dateRange.end && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.end ? format(dateRange.end, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange.end || undefined}
                  onSelect={(date) => {
                    onDateRangeChange({ ...dateRange, end: date });
                    setEndDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button 
              variant="outline" 
              onClick={() => onDateRangeChange({ start: null, end: null })}
              className="px-3"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportFilters;
