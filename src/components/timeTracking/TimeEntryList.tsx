
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash, Edit, MoreVertical, Building, Briefcase, File } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TimeEntry, TimeEntryReceipt } from '@/types/timeTracking';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Skeleton } from '@/components/ui/skeleton';
import TimeEntryReceipts from './TimeEntryReceipts';

interface TimeEntryListProps {
  timeEntries: TimeEntry[];
  isLoading: boolean;
  onEntryChange: () => void;
  isMobile?: boolean;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ 
  timeEntries, 
  isLoading,
  onEntryChange,
  isMobile = false
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<TimeEntryReceipt | null>(null);
  const smallScreen = useMediaQuery("(max-width: 640px)");
  const useCompactLayout = isMobile || smallScreen;
  
  const handleViewReceipt = (receipt: TimeEntryReceipt) => {
    setSelectedReceipt(receipt);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/5" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (timeEntries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No time entries found for this date
      </div>
    );
  }
  
  // For compact mobile layout
  if (useCompactLayout) {
    return (
      <div className="space-y-3">
        {timeEntries.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center">
                    {entry.entity_type === 'project' ? (
                      <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    ) : (
                      <Briefcase className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    )}
                    <span className="font-medium truncate max-w-[180px]">
                      {entry.entity_name || entry.entity_id}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(`${entry.date_worked}T${entry.start_time}`), 'h:mm a')} - 
                    {format(new Date(`${entry.date_worked}T${entry.end_time}`), 'h:mm a')}
                  </div>
                  
                  {entry.employee_name && (
                    <div className="text-xs text-muted-foreground">
                      {entry.employee_name}
                    </div>
                  )}
                  
                  {entry.notes && (
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {entry.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="font-semibold text-[#0485ea]">
                    {entry.hours_worked.toFixed(1)}h
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {entry.has_receipts && (
                <div className="mt-2 pt-2 border-t">
                  <TimeEntryReceipts 
                    timeEntryId={entry.id} 
                    onViewReceipt={handleViewReceipt}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {/* Receipt Viewer Dialog */}
        <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Receipt</DialogTitle>
            </DialogHeader>
            
            {selectedReceipt && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{selectedReceipt.file_name}</div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (selectedReceipt.url) {
                        window.open(selectedReceipt.url, '_blank');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{' '}
                    {selectedReceipt.expense_type || 'Not specified'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{' '}
                    {selectedReceipt.amount ? `$${selectedReceipt.amount.toFixed(2)}` : 'Not specified'}
                  </div>
                </div>
                
                {selectedReceipt.url && selectedReceipt.file_type?.startsWith('image/') && (
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={selectedReceipt.url} 
                      alt="Receipt" 
                      className="w-full h-auto max-h-[300px] object-contain"
                    />
                  </div>
                )}
                
                {selectedReceipt.url && selectedReceipt.file_type === 'application/pdf' && (
                  <div className="text-center py-4 border rounded-md">
                    <File className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div className="mt-2">PDF Document</div>
                    <Button 
                      variant="link" 
                      onClick={() => window.open(selectedReceipt.url, '_blank')}
                      className="mt-2"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open PDF
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Desktop layout
  return (
    <div className="space-y-2">
      {timeEntries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center">
                  {entry.entity_type === 'project' ? (
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  ) : (
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  )}
                  <span className="font-medium">
                    {entry.entity_name || entry.entity_id}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>
                    {format(new Date(`${entry.date_worked}T${entry.start_time}`), 'h:mm a')} - 
                    {format(new Date(`${entry.date_worked}T${entry.end_time}`), 'h:mm a')}
                  </span>
                  {entry.employee_name && (
                    <span className="ml-4 pl-4 border-l">
                      {entry.employee_name}
                    </span>
                  )}
                </div>
                
                {entry.notes && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {entry.notes}
                  </div>
                )}
                
                {entry.has_receipts && (
                  <div className="mt-2">
                    <TimeEntryReceipts 
                      timeEntryId={entry.id} 
                      onViewReceipt={handleViewReceipt}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end">
                <span className="font-semibold text-[#0485ea] text-lg">
                  {entry.hours_worked.toFixed(1)}h
                </span>
                
                <div className="flex space-x-1 mt-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Receipt Viewer Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{selectedReceipt.file_name}</div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedReceipt.url) {
                      window.open(selectedReceipt.url, '_blank');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  {selectedReceipt.expense_type || 'Not specified'}
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>{' '}
                  {selectedReceipt.amount ? `$${selectedReceipt.amount.toFixed(2)}` : 'Not specified'}
                </div>
                <div>
                  <span className="text-muted-foreground">Uploaded:</span>{' '}
                  {format(new Date(selectedReceipt.uploaded_at), 'MMM d, yyyy')}
                </div>
              </div>
              
              {selectedReceipt.url && selectedReceipt.file_type?.startsWith('image/') && (
                <div className="border rounded-md overflow-hidden">
                  <img 
                    src={selectedReceipt.url} 
                    alt="Receipt" 
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </div>
              )}
              
              {selectedReceipt.url && selectedReceipt.file_type === 'application/pdf' && (
                <div className="text-center py-6 border rounded-md">
                  <File className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div className="mt-2">PDF Document</div>
                  <Button 
                    variant="link" 
                    onClick={() => window.open(selectedReceipt.url, '_blank')}
                    className="mt-2"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open PDF
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeEntryList;
