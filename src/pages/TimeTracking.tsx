import React, { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { useMediaQuery } from '@/hooks/use-media-query';
import MobileTimeEntryView from '@/components/timeTracking/MobileTimeEntryView';
import DesktopTimeEntryView from '@/components/timeTracking/DesktopTimeEntryView';
import { useTimeEntries } from '@/components/timeTracking/hooks/useTimeEntries';

const TimeTracking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Detect if we're on a mobile device
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Fetch time entries and related data
  const { timeEntries, isLoading, refetch } = useTimeEntries(selectedDate);
  
  // Calculate total hours for the selected day
  const totalHours = timeEntries?.reduce((sum, entry) => sum + entry.hours_worked, 0) || 0;
  
  const handleAddSuccess = () => {
    setShowAddForm(false);
    refetch();
  };
  
  // If on mobile, show a simplified view
  if (isMobile) {
    return (
      <PageTransition>
        <MobileTimeEntryView 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          timeEntries={timeEntries}
          isLoading={isLoading}
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
      <DesktopTimeEntryView
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        timeEntries={timeEntries}
        isLoading={isLoading}
        onAddSuccess={handleAddSuccess}
        totalHours={totalHours}
      />
      
      {/* Mobile Add Form Dialog - keep for compatibility with existing code */}
      {isMobile && showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Log Time</h2>
            </div>
            <div className="p-4">
              {/* This is handled by MobileTimeEntryView now, but keeping for backward compatibility */}
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default TimeTracking;
