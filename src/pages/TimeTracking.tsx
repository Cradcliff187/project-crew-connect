import React, { useEffect } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { useMediaQuery } from '@/hooks/use-media-query';
import MobileTimeEntryView from '@/components/timeTracking/MobileTimeEntryView';
import DesktopTimeEntryView from '@/components/timeTracking/DesktopTimeEntryView';
import { useTimeEntries } from '@/components/timeTracking/hooks/useTimeEntries';
import { Helmet } from 'react-helmet-async';
import { useDeviceCapabilities } from '@/hooks/use-mobile';

const TimeTracking = () => {
  // Use our hook with Monday as start of week
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
  
  // Use our device capabilities hook for better detection
  const { isMobile, hasCamera, isTouchScreen } = useDeviceCapabilities();
  
  // For fallback, also use media query
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  
  // Use either the device detection or the media query
  const useMobileView = isMobile || isSmallScreen || isTouchScreen;
  
  // Trigger initial data loading when component mounts
  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);
  
  // Calculate total hours for the selected week
  const totalHours = entries?.reduce((sum, entry) => sum + entry.hours_worked, 0) || 0;
  
  // Always pass the refreshEntries function as onAddSuccess
  const handleAddSuccess = () => {
    refreshEntries();
  };
  
  // If on mobile, show optimized mobile view
  if (useMobileView) {
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
          showAddForm={false}
          setShowAddForm={() => {}}
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
