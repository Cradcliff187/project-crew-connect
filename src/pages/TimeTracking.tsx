
import { useState, useEffect } from 'react';
import { Search, Clock, Filter, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

import PageTransition from '@/components/layout/PageTransition';
import PageHeader from '@/components/layout/PageHeader';
import TimeEntryForm from '@/components/timeTracking/TimeEntryForm';
import TimeEntryEdit from '@/components/timeTracking/TimeEntryEdit';
import TimeEntryDetail from '@/components/timeTracking/TimeEntryDetail';
import TimeTrackingTable from '@/components/timeTracking/TimeTrackingTable';
import { supabase } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import { TimeEntry } from '@/types/timeTracking';
import { ReceiptViewerDialog } from '@/components/timeTracking/dialogs/ReceiptDialog';
import { useReceiptManager } from '@/components/timeTracking/hooks/useReceiptManager';
import { useTimeEntriesData } from '@/components/timeTracking/hooks/useTimeEntriesData';

const TimeTracking = () => {
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
  
  // Handle search filter
  useEffect(() => {
    // Don't trigger fetch on search - just filter locally
  }, [searchQuery]);
  
  // Filtered entries based on search
  const filteredEntries = searchQuery === '' ? 
    timeEntries : 
    timeEntries.filter((entry: any) => 
      (entry.entity_name && entry.entity_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.entity_location && entry.entity_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.employee_name && entry.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
  // Handle view entry - extracted to avoid re-renders
  const handleViewEntry = (id: string) => {
    const entry = timeEntries.find(e => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setShowDetailDialog(true);
    }
  };
  
  // Handle edit entry
  const handleEditEntry = (id: string) => {
    const entry = timeEntries.find(e => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setShowEditDialog(true);
    }
  };
  
  // Handle delete entry confirmation
  const handleConfirmDelete = (id: string) => {
    const entry = timeEntries.find(e => e.id === id);
    if (entry) {
      setSelectedEntry(entry);
      setShowDeleteDialog(true);
    }
  };
  
  // Handle view receipts
  const handleViewReceipts = async (id: string) => {
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
  };
  
  // Handle close detail dialog
  const handleCloseDetailDialog = () => {
    setShowDetailDialog(false);
    setSelectedEntry(null);
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setActiveTab('list');
    fetchTimeEntries();
    setShowEditDialog(false);
    setSelectedEntry(null);
  };

  // Perform deletion
  const executeDelete = async () => {
    if (selectedEntry) {
      await handleDeleteEntry(selectedEntry.id);
      setShowDeleteDialog(false);
      setSelectedEntry(null);
    }
  };
  
  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <PageHeader
          title="Time Tracking"
          description="Log and manage time for projects and work orders"
        >
          <div className="relative w-full md:w-auto flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search entries..." 
              className="pl-9 subtle-input rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select 
              value={filterType} 
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="work_orders">Work Orders Only</SelectItem>
                <SelectItem value="projects">Projects Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </PageHeader>
        
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <Tabs defaultValue="list" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
              <TabsList>
                <TabsTrigger value="list" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Time Entries
                </TabsTrigger>
                <TabsTrigger value="new" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Log New Time
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="list" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0485ea]"></div>
                </div>
              ) : (
                <TimeTrackingTable 
                  entries={filteredEntries}
                  onDelete={handleConfirmDelete}
                  onView={handleViewEntry}
                  onEdit={handleEditEntry}
                  onViewReceipts={handleViewReceipts}
                />
              )}
            </TabsContent>
            
            <TabsContent value="new" className="mt-0">
              <TimeEntryForm onSuccess={handleFormSuccess} />
            </TabsContent>
          </Tabs>
        </main>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            {selectedEntry && (
              <TimeEntryDetail
                timeEntry={selectedEntry}
                onEdit={() => {
                  setShowDetailDialog(false);
                  setShowEditDialog(true);
                }}
                onDelete={() => {
                  setShowDetailDialog(false);
                  setShowDeleteDialog(true);
                }}
                onClose={() => setShowDetailDialog(false)}
                onViewReceipts={() => handleViewReceipts(selectedEntry.id)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-lg">
            {selectedEntry && (
              <TimeEntryEdit
                timeEntry={selectedEntry}
                onCancel={() => setShowEditDialog(false)}
                onSuccess={handleFormSuccess}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this time entry? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={executeDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Receipts Dialog */}
        <Dialog open={showReceiptsDialog} onOpenChange={setShowReceiptsDialog}>
          <DialogContent className="max-w-3xl">
            <div className="space-y-4">
              <div className="font-semibold text-lg">
                Receipt Details
                {selectedEntry && (
                  <div className="text-sm font-normal text-muted-foreground">
                    {selectedEntry.entity_name} - {formatDate(selectedEntry.date_worked)}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                {currentReceipts.map((receipt, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm truncate">{receipt.file_name}</h3>
                      {receipt.amount && (
                        <span className="text-sm font-semibold bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          ${receipt.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    {receipt.url ? (
                      receipt.file_type?.startsWith('image/') ? (
                        <div className="h-48 flex items-center justify-center border rounded-md overflow-hidden">
                          <img 
                            src={receipt.url} 
                            alt={receipt.file_name} 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center border rounded-md bg-gray-50">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(receipt.url, '_blank')}
                          >
                            View Document
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="h-48 flex items-center justify-center border rounded-md bg-gray-50">
                        <div className="text-sm text-gray-500">Unable to load preview</div>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {(receipt.file_size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span>
                        {new Date(receipt.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowReceiptsDialog(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Receipt Viewer Dialog */}
        <ReceiptViewerDialog
          open={viewingReceipt}
          onOpenChange={setViewingReceipt}
          receiptDocument={receiptDocument}
        />
      </div>
    </PageTransition>
  );
};

export default TimeTracking;
