import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CalendarDays, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface ContactActivity {
  id: string;
  interaction_type: string;
  subject: string;
  notes: string;
  interaction_date: string;
  duration_minutes: number;
  created_by: string;
}

interface ContactActivitySectionProps {
  contactId: string;
}

const ContactActivitySection: React.FC<ContactActivitySectionProps> = ({ contactId }) => {
  const [activities, setActivities] = useState<ContactActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!contactId) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('contact_interactions')
          .select('*')
          .eq('contact_id', contactId)
          .order('interaction_date', { ascending: false });

        if (error) throw error;

        setActivities(data || []);
      } catch (err) {
        console.error('Error fetching contact activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [contactId]);

  // Get icon based on interaction type
  const getInteractionIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CALL':
        return <Phone className="h-5 w-5 text-blue-500" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5 text-green-500" />;
      case 'MEETING':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'NOTE':
        return <MessageCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/5" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
          <h3 className="text-lg font-medium mb-2">No activity yet</h3>
          <p className="text-muted-foreground mb-4">
            There is no activity recorded for this contact yet.
          </p>
          <Button className="bg-[#0485ea] hover:bg-[#0375d1]">
            <Plus className="h-4 w-4 mr-1" />
            Add Interaction
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Activity History</h2>
        <Button className="bg-[#0485ea] hover:bg-[#0375d1]">
          <Plus className="h-4 w-4 mr-1" />
          Add Interaction
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map(activity => (
          <Card key={activity.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {getInteractionIcon(activity.interaction_type)}
                  <span className="font-medium ml-2 text-lg">{activity.subject}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>{format(new Date(activity.interaction_date), 'MMM d, yyyy')}</span>
                  {activity.duration_minutes > 0 && (
                    <>
                      <span className="mx-1">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{activity.duration_minutes} min</span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">
                {activity.notes || 'No notes provided.'}
              </p>
              {activity.created_by && (
                <div className="mt-4 pt-2 border-t text-xs text-muted-foreground">
                  Logged by {activity.created_by}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Import these at the top
const Phone = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const Mail = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
  </svg>
);

const Users = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default ContactActivitySection;
