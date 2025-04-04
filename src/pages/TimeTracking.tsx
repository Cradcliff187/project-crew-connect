
import React from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { useMediaQuery } from '@/hooks/use-media-query';
import MobileTimeEntryView from '@/components/timeTracking/MobileTimeEntryView';
import DesktopTimeEntryView from '@/components/timeTracking/DesktopTimeEntryView';
import { useTimeEntries } from '@/components/timeTracking/hooks/useTimeEntries';
import { Helmet } from 'react-helmet-async';

const TimeTracking = () => {
  // Fetch time entries for the current week (hook handles the date range)
  const { 
    entries, 
    loading, 
    refreshEntries, 
    dateRange, 
    setDateRange,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek
  } = useTimeEntries();
  
  // State for add form
  const [showAddForm, setShowAddForm] = React.useState(false);
  
  // Detect if we're on a mobile device
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Calculate total hours for the selected week
  const totalHours = entries?.reduce((sum, entry) => sum + entry.hours_worked, 0) || 0;
  
  const handleAddSuccess = () => {
    setShowAddForm(false);
    refreshEntries();
  };
  
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
          isLoading={loading}
          onAddSuccess={handleAddSuccess}
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
          totalHours={totalHours}
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
      <DesktopTimeEntryView
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onNextWeek={goToNextWeek}
        onPrevWeek={goToPrevWeek}
        onCurrentWeek={goToCurrentWeek}
        timeEntries={entries}
        isLoading={loading}
        onAddSuccess={handleAddSuccess}
        totalHours={totalHours}
      />
    </PageTransition>
  );
};

export default TimeTracking;
