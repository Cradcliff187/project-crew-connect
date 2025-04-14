import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';

interface Task {
  id: string;
  type: 'project' | 'workOrder';
  title: string;
  dueDate: string;
  href: string;
}

const UpcomingTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingTasks() {
      setLoading(true);
      try {
        // Fetch projects with upcoming due dates
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('projectid, projectname, due_date')
          .in('status', ['active', 'ACTIVE', 'in_progress', 'IN_PROGRESS'])
          .not('due_date', 'is', null)
          .order('due_date', { ascending: true })
          .limit(5);

        if (projectsError) throw projectsError;

        // Fetch work orders with upcoming due dates
        const { data: workOrdersData, error: workOrdersError } = await supabase
          .from('maintenance_work_orders')
          .select('work_order_id, title, due_by_date')
          .in('status', ['NEW', 'IN_PROGRESS', 'ASSIGNED'])
          .not('due_by_date', 'is', null)
          .order('due_by_date', { ascending: true })
          .limit(5);

        if (workOrdersError) throw workOrdersError;

        // Convert projects to tasks
        const projectTasks: Task[] = (projectsData || []).map(project => ({
          id: project.projectid,
          type: 'project',
          title: project.projectname,
          dueDate: project.due_date,
          href: `/projects/${project.projectid}`,
        }));

        // Convert work orders to tasks
        const workOrderTasks: Task[] = (workOrdersData || []).map(wo => ({
          id: wo.work_order_id,
          type: 'workOrder',
          title: wo.title,
          dueDate: wo.due_by_date,
          href: `/work-orders/${wo.work_order_id}`,
        }));

        // Combine and sort by due date
        const combinedTasks = [...projectTasks, ...workOrderTasks]
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 5); // Take only the 5 most urgent tasks

        setTasks(combinedTasks);
      } catch (err) {
        console.error('Error fetching upcoming tasks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchUpcomingTasks();
  }, []);

  return (
    <DashboardCard title="Upcoming Due Items" icon={<CalendarClock className="h-5 w-5" />}>
      <div className="space-y-3">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-3 last:border-0"
              >
                <div className="space-y-1">
                  <div className="h-5 bg-muted rounded w-40 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                </div>
                <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              </div>
            ))
        ) : tasks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No upcoming due items</p>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded"
              onClick={() => navigate(task.href)}
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.type === 'project' ? 'Project' : 'Work Order'}
                </p>
              </div>
              <div className="text-sm font-medium text-amber-700">{formatDate(task.dueDate)}</div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 pt-3 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => navigate('/active-work')}
        >
          View All Work
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </DashboardCard>
  );
};

export default UpcomingTasks;
