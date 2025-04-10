
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntry } from '@/types/timeTracking';
import { Plus, Map, ChevronRight, Camera, Clock, Upload, Receipt } from 'lucide-react';
import { TimeEntryList } from './TimeEntryList';
import TimeEntryFormWizard from './TimeEntryFormWizard';
import QuickLogButton from './QuickLogButton';
import PageTransition from '@/components/layout/PageTransition';
import DateNavigation from './DateNavigation';
import { useDeviceCapabilities } from '@/hooks/use-mobile';
import MobileQuickLogSheet from './MobileQuickLogSheet';
import { DateRange } from './hooks/useTimeEntries';
import DocumentUploadDirectSheet from './DocumentUploadDirectSheet';

interface MobileTimeEntryViewProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  onNextWeek: () => void;
  onPrevWeek: () => void;
  onCurrentWeek: () => void;
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onAddSuccess: () => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  totalHours: number;
}

const MobileTimeEntryView: React.FC<MobileTimeEntryViewProps> = ({
  dateRange,
  onDateRangeChange,
  onNextWeek,
  onPrevWeek,
  onCurrentWeek,
  timeEntries,
  isLoading,
  onAddSuccess,
  showAddForm,
  setShowAddForm,
  totalHours
}) => {
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const { hasCamera, isMobile } = useDeviceCapabilities();
  
  const handleQuickLogSuccess = () => {
    setShowQuickLog(false);
    onAddSuccess();
  };
  
  const handleDocumentUploadSuccess = () => {
    setShowDocumentUpload(false);
    onAddSuccess();
  };
  
  return (
    <PageTransition>
      <div className="container px-4 py-4">
        {/* Date Navigation Header */}
        <DateNavigation
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          onNextWeek={onNextWeek}
          onPrevWeek={onPrevWeek}
          onCurrentWeek={onCurrentWeek}
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
            Total Hours This Week: <span className="font-medium text-[#0485ea]">{totalHours.toFixed(1)}</span>
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <Button 
            variant="outline"
            size="sm"
            className="justify-start"
            onClick={() => setShowDocumentUpload(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Document or Receipt
          </Button>
        </div>
        
        {/* Time entries list */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Weekly Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeEntryList 
              entries={timeEntries} 
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
                date={new Date()}
              />
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Quick Log Sheet */}
        <MobileQuickLogSheet 
          open={showQuickLog}
          onOpenChange={setShowQuickLog}
          onSuccess={handleQuickLogSuccess}
          date={new Date()}
        />
        
        {/* Document Upload Sheet */}
        <DocumentUploadDirectSheet
          open={showDocumentUpload}
          onOpenChange={setShowDocumentUpload}
          onSuccess={handleDocumentUploadSuccess}
          title="Upload Document or Receipt"
          description="Upload any document or receipt for your projects, work orders or vendors"
          showHelpText={true}
          allowEntityTypeSelection={true}
        />
      </div>
    </PageTransition>
  );
};

export default MobileTimeEntryView;
