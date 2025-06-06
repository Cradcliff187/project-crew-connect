import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { startOfWeek, endOfWeek } from 'date-fns';
import PageTransition from '@/components/layout/PageTransition';
import { useMediaQuery } from '@/hooks/use-media-query';
import MobileTimeEntryView from '@/components/timeTracking/MobileTimeEntryView';
import DesktopTimeEntryView from '@/components/timeTracking/DesktopTimeEntryView';
import { useTimeEntries } from '@/components/timeTracking/hooks/useTimeEntries';
import { useEmployees } from '@/hooks/useEmployees';
import { Helmet } from 'react-helmet-async';
import TimeEntryFormWizard from '@/components/timeTracking/TimeEntryFormWizard';
import { TimeEntry } from '@/types/timeTracking';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const TimeTracking = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  // Fetch time entries for the current week (hook handles the date range)
  const {
    entries,
    loading,
    refreshEntries,
    dateRange,
    setDateRange,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    handleDeleteTimeEntry,
    handleEditTimeEntry,
    editingEntry,
    clearEditingEntry,
  } = useTimeEntries();

  // Fetch employees
  const { employees = [], isLoadingEmployees } = useEmployees();

  // Detect if we're on a mobile device
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Calculate total hours for the selected week
  const totalHours = entries?.reduce((sum, entry) => sum + entry.hours_worked, 0) || 0;

  // Effect to handle navigation with a target date
  useEffect(() => {
    if (location.state?.targetDate) {
      try {
        const target = new Date(location.state.targetDate);
        if (!isNaN(target.getTime())) {
          const startOfTargetWeek = startOfWeek(target, { weekStartsOn: 1 });
          const endOfTargetWeek = endOfWeek(target, { weekStartsOn: 1 });
          console.log(
            '[TimeTracking] Navigated with targetDate, setting range:',
            startOfTargetWeek,
            endOfTargetWeek
          );
          setDateRange({ startDate: startOfTargetWeek, endDate: endOfTargetWeek });

          // Clean the state to prevent re-triggering on refresh/back navigation within the page
          window.history.replaceState({}, document.title);
        } else {
          console.warn(
            '[TimeTracking] Invalid targetDate received in state:',
            location.state.targetDate
          );
        }
      } catch (e) {
        console.error('[TimeTracking] Error processing targetDate from state:', e);
      }
    }
  }, [location.state, setDateRange]); // Depend on location.state and setDateRange

  const handleAddSuccess = async (savedEntryData?: Partial<TimeEntry>) => {
    const projectId = savedEntryData?.entity_id;
    const entityType = savedEntryData?.entity_type;

    clearEditingEntry();
    refreshEntries();

    if (entityType === 'project' && projectId) {
      await queryClient.refetchQueries({
        queryKey: ['project-budget-summary', projectId],
        exact: true,
      });
      await queryClient.refetchQueries({ queryKey: ['project-detail', projectId], exact: true });
      await queryClient.refetchQueries({ queryKey: ['project-expenses', projectId], exact: true });
    }
  };

  const handleEditRequest = (entry: TimeEntry) => {
    handleEditTimeEntry(entry);
  };

  const handleFormCancel = () => {
    clearEditingEntry();
  };

  const showTimeEntryForm = !!editingEntry;

  const [selectedDate, setSelectedDate] = useState(new Date());
  // Add state for Sheet control
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'add' | 'edit'>('add');
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);

  // If on mobile, show a simplified view
  if (isMobile) {
    return (
      <PageTransition>
        <Helmet>
          <title>Time Tracking | AKC LLC</title>
        </Helmet>
        <MobileTimeEntryView
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onNextWeek={goToNextWeek}
          onPrevWeek={goToPrevWeek}
          onCurrentWeek={goToCurrentWeek}
          timeEntries={entries}
          employees={employees}
          isLoading={loading || isLoadingEmployees}
          onAddSuccess={refreshEntries}
          onEditEntry={handleEditRequest}
          onDeleteEntry={handleDeleteTimeEntry}
          totalHours={totalHours}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onOpenAddSheet={() => {
            setCurrentEntry(null);
            setSheetMode('add');
            setIsSheetOpen(true);
          }}
          onOpenEditSheet={entry => {
            setCurrentEntry(entry);
            setSheetMode('edit');
            setIsSheetOpen(true);
          }}
        />
      </PageTransition>
    );
  }

  // Otherwise show the desktop view
  return (
    <PageTransition>
      <Helmet>
        <title>Time Tracking | AKC LLC</title>
      </Helmet>
      <div className="flex flex-col h-full">
        <DesktopTimeEntryView
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onNextWeek={goToNextWeek}
          onPrevWeek={goToPrevWeek}
          onCurrentWeek={goToCurrentWeek}
          timeEntries={entries}
          employees={employees}
          isLoading={loading || isLoadingEmployees}
          onAddSuccess={refreshEntries}
          onEditEntry={handleEditRequest}
          onDeleteEntry={handleDeleteTimeEntry}
          totalHours={totalHours}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onOpenAddSheet={() => {
            setCurrentEntry(null);
            setSheetMode('add');
            setIsSheetOpen(true);
          }}
          onOpenEditSheet={entry => {
            setCurrentEntry(entry);
            setSheetMode('edit');
            setIsSheetOpen(true);
          }}
        />
      </div>

      {/* Sheet for Add/Edit Time Entry */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'add' ? 'Log New Time Entry' : 'Edit Time Entry'}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === 'add'
                ? 'Fill in the details for your work time.'
                : 'Update the details for this time entry.'}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <TimeEntryFormWizard
              date={selectedDate}
              initialData={currentEntry}
              onSuccess={() => {
                handleAddSuccess(currentEntry || undefined);
                setIsSheetOpen(false);
              }}
              onCancel={() => {
                setIsSheetOpen(false);
                queryClient.invalidateQueries({
                  queryKey: ['timeEntries', selectedDate.toISOString().split('T')[0]],
                });
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </PageTransition>
  );
};

export default TimeTracking;
