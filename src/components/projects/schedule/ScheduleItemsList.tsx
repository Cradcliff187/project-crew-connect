import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScheduleItemCard } from './ScheduleItemCard';
import ScheduleItemFormDialog from './ScheduleItemFormDialog';
import { useScheduleItems } from './hooks/useScheduleItems';
import { ScheduleItem } from '@/types/schedule';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ScheduleItemsListProps {
  projectId: string;
  projectName?: string;
}

export function ScheduleItemsList({ projectId, projectName }: ScheduleItemsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const {
    scheduleItems,
    loading,
    error,
    fetchScheduleItems,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    syncWithCalendar,
  } = useScheduleItems(projectId);

  const { toast } = useToast();

  // Filter items based on active tab
  const filteredItems = scheduleItems.filter(item => {
    const now = new Date();
    const startDate = new Date(item.start_datetime);

    switch (activeTab) {
      case 'upcoming':
        return startDate >= now && !item.is_completed;
      case 'past':
        return startDate < now || item.is_completed;
      case 'all':
      default:
        return true;
    }
  });

  // Sort items by start date
  const sortedItems = [...filteredItems].sort((a, b) => {
    return new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime();
  });

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this schedule item?');
    if (!confirmed) return;

    const success = await deleteScheduleItem(id);
    if (success) {
      toast({
        title: 'Schedule item deleted',
        description: 'The schedule item has been removed.',
      });
    }
  };

  const handleSync = async (id: string): Promise<boolean> => {
    const success = await syncWithCalendar(id);
    if (success) {
      toast({
        title: 'Calendar sync complete',
        description: 'The schedule item has been synced with Google Calendar.',
      });
      // Refresh the list to show updated sync status
      await fetchScheduleItems();
    }
    return success;
  };

  const handleSave = async (itemData: Partial<ScheduleItem>): Promise<boolean> => {
    let success = false;

    if (editingItem) {
      const updatedItem = await updateScheduleItem(editingItem.id, itemData);
      success = !!updatedItem;
    } else {
      const newItem = await addScheduleItem(itemData);
      success = !!newItem;
    }

    if (success) {
      setDialogOpen(false);
      setEditingItem(null);
    }

    return success;
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  // Summary stats
  const stats = {
    total: scheduleItems.length,
    upcoming: scheduleItems.filter(item => {
      const startDate = new Date(item.start_datetime);
      return startDate >= new Date() && !item.is_completed;
    }).length,
    synced: scheduleItems.filter(item => item.google_event_id).length,
    withAssignees: scheduleItems.filter(item => item.assignee_id).length,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-red-500 mb-2">Error loading schedule items</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchScheduleItems()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Schedule Items</CardTitle>
              <CardDescription>
                Manage detailed schedule items for {projectName || 'this project'}
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-[#0485ea] hover:bg-[#0375d1]">
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule Item
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {stats.total} Total
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-blue-600">
              <Calendar className="h-3 w-3" />
              {stats.upcoming} Upcoming
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-green-600">
              <Calendar className="h-3 w-3" />
              {stats.synced} Synced
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {stats.withAssignees} Assigned
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-4">
                  {sortedItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No schedule items found.</p>
                      {activeTab === 'upcoming' && (
                        <p className="text-sm mt-2">
                          Click "Add Schedule Item" to create a new scheduled task.
                        </p>
                      )}
                    </div>
                  ) : (
                    sortedItems.map(item => (
                      <ScheduleItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSync={handleSync}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ScheduleItemFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        projectId={projectId}
        projectName={projectName}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
}
