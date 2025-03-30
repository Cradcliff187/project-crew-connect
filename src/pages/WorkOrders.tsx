import React from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import PageTransition from "@/components/layout/PageTransition";

const fetchWorkOrders = async () => {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const WorkOrdersPage: React.FC = () => {
  const { data: workOrders, isLoading, isError, error } = useQuery('workOrders', fetchWorkOrders);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: new Date(),
  })

  if (isLoading) {
    return <PageTransition><div>Loading work orders...</div></PageTransition>;
  }

  if (isError) {
    return <PageTransition><div>Error: {error.message}</div></PageTransition>;
  }

  const formatCostDisplay = (workOrder: any) => {
    // Use materials_cost instead if expenses_cost is not available
    const totalCost = workOrder.total_cost || 0;
    const materialsCost = workOrder.materials_cost || 0;
    
    // Calculate or use a default value when expenses_cost is not available
    return `$${totalCost.toFixed(2)}`;
  };

  return (
    <PageTransition>
      <div>
        <h1>Work Orders</h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              pagedNavigation
            />
          </PopoverContent>
        </Popover>

        <ul>
          {workOrders?.map(workOrder => (
            <li key={workOrder.id}>
              {workOrder.work_order_number} - {workOrder.description} - {formatCostDisplay(workOrder)}
            </li>
          ))}
        </ul>
      </div>
    </PageTransition>
  );
};

export default WorkOrdersPage;
