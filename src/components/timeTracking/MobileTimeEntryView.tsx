
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntry } from '@/types/timeTracking';
import { Plus, Map, ChevronRight, Camera, Clock } from 'lucide-react';
import TimeEntryList from './TimeEntryList';
import TimeEntryFormWizard from './TimeEntryFormWizard';
import QuickLogButton from './QuickLogButton';
import PageTransition from '@/components/layout/PageTransition';
import DateNavigation from './DateNavigation';
import { useDeviceCapabilities } from '@/hooks/use-mobile';
import MobileQuickLogSheet from './MobileQuickLogSheet';

interface MobileTimeEntryViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onAddSuccess: () => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  totalHours: number;
}

const MobileTimeEntryView: React.FC<MobileTimeEntryViewProps> = ({
  selectedDate,
  setSelectedDate,
  timeEntries,
  isLoading,
  onAddSuccess,
  showAddForm,
  setShowAddForm,
  totalHours
}) => {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const { hasCamera, isMobile } = useDeviceCapabilities();
  
  const handleQuickLogSuccess = () => {
    setShowQuickLog(false);
    onAddSuccess();
  };
  
  return (
    <PageTransition>
      <div className="container px-4 py-4">
        {/* Date Selection Header */}
        <DateNavigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          totalHours={totalHours}
          isMobile={true}
        />
        
        {/* Quick Log Button */}
        <div className="mb-4">
          <QuickLogButton onQuickLog={() => setShowQuickLog(true)} />
        </div>
        
        {/* Total Hours Display */}
        <div className="mb-4 px-3 py-2 bg-muted rounded-md flex items-center">
          <Clock className="h-4 w-4 mr-2 text-[#0485ea]" />
          <span className="text-sm">
            Total Hours Today: <span className="font-medium text-[#0485ea]">{totalHours.toFixed(1)}</span>
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button 
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Detailed Log
          </Button>
          
          {hasCamera && (
            <Button 
              variant="outline"
              size="sm"
              className="justify-start"
              onClick={() => setShowAddForm(true)}
            >
              <Camera className="h-4 w-4 mr-1" />
              Add Receipt
            </Button>
          )}
        </div>
        
        {/* Time entries list */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeEntryList 
              timeEntries={timeEntries} 
              isLoading={isLoading}
              onEntryChange={onAddSuccess}
              isMobile={true}
            />
          </CardContent>
        </Card>
        
        {/* Log Time Sheet */}
        <Sheet open={showAddForm} onOpenChange={setShowAddForm}>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Log Time</SheetTitle>
            </SheetHeader>
            <div className="py-2 px-2">
              <TimeEntryFormWizard 
                onSuccess={() => {
                  setShowAddForm(false);
                  onAddSuccess();
                }} 
              />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Quick Log Sheet */}
        <MobileQuickLogSheet 
          open={showQuickLog}
          onOpenChange={setShowQuickLog}
          onSuccess={handleQuickLogSuccess}
          selectedDate={selectedDate}
        />
      </div>
    </PageTransition>
  );
};

export default MobileTimeEntryView;
