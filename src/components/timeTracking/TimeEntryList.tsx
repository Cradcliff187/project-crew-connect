
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TimeEntry } from '@/types/timeTracking';
import { Button } from '@/components/ui/button';
import { formatTimeRange } from '@/lib/utils';
import { format } from 'date-fns';
import { Edit, Trash2, Receipt, Clock } from 'lucide-react';
import TimeEntryEditDialog from './TimeEntryEditDialog';
import TimeEntryDeleteDialog from './TimeEntryDeleteDialog';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import DocumentUploadDirectSheet from './DocumentUploadDirectSheet';
import { MobileDocumentUploadButton } from '@/components/documents';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeEntryListProps {
  entries: TimeEntry[];
  isLoading: boolean;
  onEntryChange: () => void;
  isMobile?: boolean;
}

export const TimeEntryList = ({
  entries,
  isLoading,
  onEntryChange,
  isMobile = false
}: TimeEntryListProps) => {
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<TimeEntry | null>(null);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  
  const handleEditClick = (entry: TimeEntry) => {
    setEditingEntry(entry);
  };
  
  const handleDeleteClick = (entry: TimeEntry) => {
    setDeletingEntry(entry);
  };
  
  const handleReceiptClick = (entry: TimeEntry) => {
    setCurrentEntryId(entry.id);
    setShowReceiptUpload(true);
  };
  
  const handleReceiptUploadSuccess = () => {
    setShowReceiptUpload(false);
    onEntryChange();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
        <p className="text-muted-foreground">No time entries for this period</p>
      </div>
    );
  }
  
  if (isMobile) {
    return (
      <div className="space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">
                    {entry.entity_name || entry.entity_id}
                  </div>
                  <Badge className="ml-2 bg-[#0485ea]">
                    {entry.hours_worked} hrs
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  {format(new Date(entry.date_worked), 'MMM d, yyyy')} • {formatTimeRange(entry.start_time, entry.end_time)}
                </div>
                
                {entry.notes && (
                  <div className="text-sm mt-1">
                    {entry.notes}
                  </div>
                )}
                
                {entry.has_receipts && (
                  <div className="flex items-center text-xs text-[#0485ea] mt-2">
                    <Receipt className="h-3 w-3 mr-1" />
                    Has receipt(s)
                  </div>
                )}
              </div>
              
              <div className="flex border-t">
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-none h-10 text-xs" 
                  onClick={() => handleEditClick(entry)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                
                <div className="border-r h-10" />
                
                <MobileDocumentUploadButton
                  entityType="TIME_ENTRY"
                  entityId={entry.id}
                  onSuccess={onEntryChange}
                  buttonVariant="ghost"
                  buttonText="Receipt"
                  className="flex-1 rounded-none h-10 text-xs"
                  isReceiptOnly={true}
                />
                
                <div className="border-r h-10" />
                
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-none h-10 text-xs text-destructive hover:text-destructive" 
                  onClick={() => handleDeleteClick(entry)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Edit Dialog */}
        {editingEntry && (
          <TimeEntryEditDialog
            open={!!editingEntry}
            onOpenChange={(open) => !open && setEditingEntry(null)}
            entry={editingEntry}
            onSuccess={() => {
              setEditingEntry(null);
              onEntryChange();
            }}
          />
        )}
        
        {/* Delete Dialog */}
        {deletingEntry && (
          <TimeEntryDeleteDialog
            open={!!deletingEntry}
            onOpenChange={(open) => !open && setDeletingEntry(null)}
            entry={deletingEntry}
            onSuccess={() => {
              setDeletingEntry(null);
              onEntryChange();
            }}
          />
        )}
      </div>
    );
  }
  
  return (
    <>
      <ScrollArea className="h-[45vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Hours</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  {format(new Date(entry.date_worked), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {entry.entity_name || entry.entity_id}
                    {entry.has_receipts && (
                      <Receipt className="h-4 w-4 ml-2 text-[#0485ea]" />
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatTimeRange(entry.start_time, entry.end_time)}</TableCell>
                <TableCell className="text-right">{entry.hours_worked}</TableCell>
                <TableCell className="max-w-[200px] truncate">{entry.notes}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8" 
                      onClick={() => handleEditClick(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-[#0485ea]" 
                      onClick={() => handleReceiptClick(entry)}
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive" 
                      onClick={() => handleDeleteClick(entry)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      
      {/* Edit Dialog */}
      {editingEntry && (
        <TimeEntryEditDialog
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
          entry={editingEntry}
          onSuccess={() => {
            setEditingEntry(null);
            onEntryChange();
          }}
        />
      )}
      
      {/* Delete Dialog */}
      {deletingEntry && (
        <TimeEntryDeleteDialog
          open={!!deletingEntry}
          onOpenChange={(open) => !open && setDeletingEntry(null)}
          entry={deletingEntry}
          onSuccess={() => {
            setDeletingEntry(null);
            onEntryChange();
          }}
        />
      )}
      
      {/* Receipt Upload Sheet */}
      {currentEntryId && (
        <DocumentUploadDirectSheet
          open={showReceiptUpload}
          onOpenChange={setShowReceiptUpload}
          entityType="TIME_ENTRY"
          entityId={currentEntryId}
          onSuccess={handleReceiptUploadSuccess}
          title="Upload Receipt"
          isReceiptUploadOnly={true}
          description="Upload a receipt for this time entry"
          showHelpText={false}
        />
      )}
    </>
  );
};
