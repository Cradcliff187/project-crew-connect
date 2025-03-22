
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/layout/PageTransition';
import TimeTrackingHeader from './TimeTrackingHeader';
import TimeTrackingTabs from './TimeTrackingTabs';
import TimeEntryDialogs from './TimeEntryDialogs';
import { useTimeEntriesData } from '../hooks/useTimeEntriesData';
import { useReceiptManager } from '../hooks/useReceiptManager';
import { TimeEntry } from '@/types/timeTracking';

const TimeTrackingPage = () => {
  // State for tab and filter management
  const [activeTab, setActiveTab] = useState('list');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for time entries management
  const { 
    timeEntries, 
    isLoading, 
    fetchTimeEntries, 
    handleDeleteEntry 
  } = useTimeEntriesData(filterType);
  
  // State for detail/edit dialogs
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  
  // State for receipt dialogs
  const [showReceiptsDialog, setShowReceiptsDialog] = useState(false);
  const [currentReceipts, setCurrentReceipts] = useState<any[]>([]);
  
  // Use receipt manager for viewing receipts
  const {
    viewingReceipt,
    setViewingReceipt,
    receiptDocument,
    handleCloseReceiptViewer
  } = useReceiptManager();
  
  // Filtered entries based on search
  const filteredEntries = searchQuery === '' ? 
    timeEntries : 
    timeEntries.filter((entry: any) => 
      (entry.entity_name && entry.entity_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.entity_location && entry.entity_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.employee_name && entry.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
  // Handle form success
  const handleFormSuccess = () => {
    setActiveTab('list');
    fetchTimeEntries();
    setShowEditDialog(false);
    setSelectedEntry(null);
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <TimeTrackingHeader 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
        />
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <TimeTrackingTabs 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            isLoading={isLoading}
            filteredEntries={filteredEntries}
            onViewEntry={(id) => {
              const entry = timeEntries.find(e => e.id === id);
              if (entry) {
                setSelectedEntry(entry);
                setShowDetailDialog(true);
              }
            }}
            onEditEntry={(id) => {
              const entry = timeEntries.find(e => e.id === id);
              if (entry) {
                setSelectedEntry(entry);
                setShowEditDialog(true);
              }
            }}
            onDeleteEntry={(id) => {
              const entry = timeEntries.find(e => e.id === id);
              if (entry) {
                setSelectedEntry(entry);
                setShowDeleteDialog(true);
              }
            }}
            onViewReceipts={async (id) => {
              try {
                const entry = timeEntries.find(e => e.id === id);
                setSelectedEntry(entry || null);
                
                const { data: receipts, error } = await supabase
                  .from('time_entry_receipts')
                  .select('*')
                  .eq('time_entry_id', id);
                  
                if (error) throw error;
                
                if (receipts && receipts.length > 0) {
                  const receiptsWithUrls = await Promise.all(receipts.map(async (receipt) => {
                    const { data, error } = await supabase.storage
                      .from('construction_documents')
                      .createSignedUrl(receipt.storage_path, 3600);
                      
                    return {
                      ...receipt,
                      url: error ? null : data?.signedUrl
                    };
                  }));
                  
                  setCurrentReceipts(receiptsWithUrls);
                  setShowReceiptsDialog(true);
                } else {
                  toast({
                    title: 'No receipts',
                    description: 'No receipts were found for this time entry.',
                  });
                }
              } catch (error) {
                console.error('Error fetching receipts:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to load receipts for this time entry.',
                  variant: 'destructive',
                });
              }
            }}
            onSuccess={handleFormSuccess}
          />
        </main>
        
        <TimeEntryDialogs 
          showDetailDialog={showDetailDialog}
          setShowDetailDialog={setShowDetailDialog}
          showEditDialog={showEditDialog}
          setShowEditDialog={setShowEditDialog}
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          showReceiptsDialog={showReceiptsDialog}
          setShowReceiptsDialog={setShowReceiptsDialog}
          selectedEntry={selectedEntry}
          setSelectedEntry={setSelectedEntry}
          currentReceipts={currentReceipts}
          viewingReceipt={viewingReceipt}
          setViewingReceipt={setViewingReceipt}
          receiptDocument={receiptDocument}
          handleFormSuccess={handleFormSuccess}
          handleDeleteEntry={handleDeleteEntry}
        />
      </div>
    </PageTransition>
  );
};

export default TimeTrackingPage;
