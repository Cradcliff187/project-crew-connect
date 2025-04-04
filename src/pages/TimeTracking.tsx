
import React, { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { useMediaQuery } from '@/hooks/use-media-query';
import MobileTimeEntryView from '@/components/timeTracking/MobileTimeEntryView';
import DesktopTimeEntryView from '@/components/timeTracking/DesktopTimeEntryView';
import { useTimeEntries, DateRange } from '@/components/timeTracking/hooks/useTimeEntries';
import { Helmet } from 'react-helmet-async';

const TimeTracking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Create a date range from the selected date (just the current day)
  const dateRange: DateRange = {
    startDate: selectedDate,
    endDate: selectedDate
  };
  
  // Detect if we're on a mobile device
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Fetch time entries and related data
  const { entries, loading, refreshEntries } = useTimeEntries(dateRange);
  
  // Calculate total hours for the selected day
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
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
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
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        timeEntries={entries}
        isLoading={loading}
        onAddSuccess={handleAddSuccess}
        totalHours={totalHours}
      />
    </PageTransition>
  );
};

export default TimeTracking;
