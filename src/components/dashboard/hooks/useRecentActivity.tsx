import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, FileText, Users, Briefcase, Wrench, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  content: string;
  timeAgo: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      setActivitiesLoading(true);
      setError(null);

      try {
        console.log('Fetching activity logs...');
        // Fetch recent activity logs
        const { data, error } = await supabase
          .from('activitylog')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(5);

        if (error) throw error;

        console.log('Activity logs fetched:', data);

        // Process and format the activity data
        const formattedActivities = await Promise.all(
          (data || []).map(async activity => {
            console.log('Formatting activity:', activity);
            return formatActivity(activity);
          })
        );

        setActivities(formattedActivities);
      } catch (err: any) {
        console.error('Error fetching activity data:', err);
        setError(err.message);
      } finally {
        setActivitiesLoading(false);
      }
    }

    fetchActivities();
  }, []);

  // Function to format activity data with appropriate icons and text
  async function formatActivity(activity: any): Promise<Activity> {
    let icon: ReactNode;
    let iconBg: string;
    let iconColor: string;
    let content: string;
    let entityName = '';

    // Get entity name based on reference ID and module type
    if (activity.referenceid) {
      try {
        console.log(
          `Getting entity name for ${activity.moduletype} with ID ${activity.referenceid}`
        );

        if (activity.moduletype === 'PROJECTS') {
          const { data, error } = await supabase
            .from('projects')
            .select('projectname')
            .eq('projectid', activity.referenceid)
            .maybeSingle(); // Changed from .single() to .maybeSingle()

          console.log('Project lookup result:', { data, error });

          if (error) {
            console.error('Error fetching project name:', error);
            entityName = 'Unknown Project';
          } else {
            entityName = data?.projectname || 'Unknown Project';
          }
        } else if (activity.moduletype === 'WORK_ORDER') {
          const { data, error } = await supabase
            .from('maintenance_work_orders')
            .select('title')
            .eq('work_order_id', activity.referenceid)
            .maybeSingle(); // Changed from .single() to .maybeSingle()

          console.log('Work order lookup result:', { data, error });

          if (error) {
            console.error('Error fetching work order title:', error);
            entityName = 'Unknown Work Order';
          } else {
            entityName = data?.title || 'Unknown Work Order';
          }
        }
      } catch (err) {
        console.error('Error fetching entity name:', err);
        entityName = `Unknown ${activity.moduletype}`;
      }
    }

    console.log(`Entity name determined: "${entityName}" for ${activity.moduletype}`);

    // Set properties based on activity type
    switch (activity.moduletype) {
      case 'PROJECTS':
        icon = <Briefcase className="h-4 w-4" />;
        iconBg = 'bg-construction-100';
        iconColor = 'text-construction-700';
        content = `<span class="font-medium">${activity.useremail || 'A user'}</span> ${activity.action?.toLowerCase() || 'updated'} project <span class="text-construction-700">${entityName}</span>`;
        if (activity.action === 'Status Change') {
          content = `<span class="font-medium">${activity.useremail || 'A user'}</span> changed project status from <span class="font-medium">${activity.previousstatus || 'unknown'}</span> to <span class="font-medium">${activity.status || 'unknown'}</span> for <span class="text-construction-700">${entityName}</span>`;
        }
        break;

      case 'WORK_ORDER':
        icon = <Wrench className="h-4 w-4" />;
        iconBg = 'bg-blue-100';
        iconColor = 'text-blue-700';
        content = `<span class="font-medium">${activity.useremail || 'A user'}</span> ${activity.action?.toLowerCase() || 'updated'} work order <span class="text-construction-700">${entityName}</span>`;
        if (activity.action === 'Status Change') {
          content = `<span class="font-medium">${activity.useremail || 'A user'}</span> changed work order status from <span class="font-medium">${activity.previousstatus || 'unknown'}</span> to <span class="font-medium">${activity.status || 'unknown'}</span> for <span class="text-construction-700">${entityName}</span>`;
        }
        break;

      case 'CUSTOMERS':
        icon = <Users className="h-4 w-4" />;
        iconBg = 'bg-blue-100';
        iconColor = 'text-blue-700';
        content = `<span class="font-medium">${activity.useremail || 'A user'}</span> ${activity.action?.toLowerCase() || 'updated'} customer record`;
        break;

      case 'ESTIMATES':
        icon = <FileText className="h-4 w-4" />;
        iconBg = 'bg-yellow-100';
        iconColor = 'text-yellow-700';
        content = `<span class="font-medium">${activity.useremail || 'A user'}</span> ${activity.action?.toLowerCase() || 'updated'} an estimate`;
        break;

      default:
        icon = <CheckCircle className="h-4 w-4" />;
        iconBg = 'bg-green-100';
        iconColor = 'text-green-700';
        content = `<span class="font-medium">${activity.useremail || 'A user'}</span> performed an action`;
    }

    const timeAgo = activity.timestamp
      ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
      : '2 days ago';

    console.log(`Formatted activity with content: "${content}" and timeAgo: "${timeAgo}"`);

    return {
      icon,
      iconBg,
      iconColor,
      content,
      timeAgo,
    };
  }

  return { activities, activitiesLoading, error };
}
