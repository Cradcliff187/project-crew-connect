
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, Receipt, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TimeEntryFormValues } from './hooks/useTimeEntryForm';
import { useTimeEntrySubmit } from '@/hooks/useTimeEntrySubmit';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import ReceiptMetadataForm from './form/ReceiptMetadataForm';
import TimePickerMobile from './form/TimePickerMobile';
import { useMediaQuery } from '@/hooks/use-media-query';
import { supabase } from '@/integrations/supabase/client';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  selectedDate: Date;
}

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  selectedDate
}) => {
  const [workDate, setWorkDate] = useState<Date>(selectedDate);
  const [hours, setHours] = useState('1');
  const [entityType, setEntityType] = useState<'work_order' | 'project'>('work_order');
  const [entityId, setEntityId] = useState<string>('');
  const [entityOptions, setEntityOptions] = useState<{id: string, name: string}[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [attachReceipt, setAttachReceipt] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const { submitTimeEntry } = useTimeEntrySubmit(onSuccess);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [receiptMetadata, setReceiptMetadata] = useState<{
    category: string,
    expenseType: string | null,
    tags: string[],
    vendorId?: string,
    vendorType?: 'vendor' | 'subcontractor' | 'other',
    amount?: number
  }>({
    category: 'receipt',
    expenseType: null,
    tags: ['time-entry'],
    vendorType: 'vendor'
  });
  
  // Update receipt metadata
  const updateReceiptMetadata = (
    data: Partial<{
      category: string, 
      expenseType: string | null, 
      tags: string[],
      vendorId?: string,
      vendorType?: 'vendor' | 'subcontractor' | 'other',
      amount?: number
    }>
  ) => {
    setReceiptMetadata(prev => ({
      ...prev,
      ...data
    }));
  };
  
  // Load entities based on type
  React.useEffect(() => {
    const fetchEntities = async () => {
      setLoadingEntities(true);
      try {
        if (entityType === 'work_order') {
          const { data } = await supabase
            .from('maintenance_work_orders')
            .select('work_order_id, title')
            .order('created_at', { ascending: false });
          
          setEntityOptions((data || []).map(wo => ({
            id: wo.work_order_id,
            name: wo.title
          })));
        } else {
          const { data } = await supabase
            .from('projects')
            .select('projectid, projectname')
            .order('createdon', { ascending: false });
          
          setEntityOptions((data || []).map(p => ({
            id: p.projectid,
            name: p.projectname
          })));
        }
      } catch (error) {
        console.error('Error fetching entities:', error);
      } finally {
        setLoadingEntities(false);
      }
    };
    
    fetchEntities();
  }, [entityType]);
  
  // Calculate hours based on start and end time
  React.useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24; // Handle overnight shifts
      }
      
      const totalHours = hours + (minutes / 60);
      setHours(totalHours.toFixed(2));
    }
  }, [startTime, endTime]);
  
  const handleSubmit = async () => {
    if (!entityId) {
      toast({
        title: 'Missing information',
        description: `Please select a ${entityType === 'work_order' ? 'work order' : 'project'}.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
      toast({
        title: 'Invalid hours',
        description: 'Please enter a valid number of hours worked.',
        variant: 'destructive',
      });
      return;
    }
    
    const validateReceiptData = () => {
      // If attachment is enabled but no files were selected
      if (attachReceipt && selectedFiles.length === 0) {
        toast({
          title: 'Receipt required',
          description: 'You indicated you have receipts but none were uploaded. Please upload at least one receipt or turn off the receipt option.',
          variant: 'destructive',
        });
        return false;
      }
      
      // If we have receipts but no expense type
      if (attachReceipt && selectedFiles.length > 0 && !receiptMetadata.expenseType) {
        toast({
          title: 'Expense type required',
          description: 'Please select an expense type for your receipt.',
          variant: 'destructive',
        });
        return false;
      }
      
      // If we have receipts but no vendor selected (unless it's 'other')
      if (attachReceipt && selectedFiles.length > 0 && 
          receiptMetadata.vendorType !== 'other' && 
          !receiptMetadata.vendorId) {
        toast({
          title: 'Vendor required',
          description: `Please select a ${receiptMetadata.vendorType} for this receipt.`,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    };
    
    if (!validateReceiptData()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const formData: TimeEntryFormValues = {
        entityType,
        entityId,
        workDate,
        startTime,
        endTime,
        hoursWorked: parseFloat(hours),
        notes,
        hasReceipts: attachReceipt && selectedFiles.length > 0
      };
      
      await submitTimeEntry(formData, selectedFiles, receiptMetadata);
      
      toast({
        title: 'Time logged successfully',
        description: `You've logged ${hours} hours.`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error logging time:', error);
      toast({
        title: 'Error logging time',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] pt-6">
        <SheetHeader>
          <SheetTitle>Quick Log Time</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4 overflow-y-auto pb-20">
          <Tabs defaultValue="hours" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hours">
                <Clock className="h-4 w-4 mr-2" />
                Hours
              </TabsTrigger>
              <TabsTrigger value="range">
                <Clock className="h-4 w-4 mr-2" />
                Time Range
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hours" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours Worked</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Enter hours"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="range" className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TimePickerMobile
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                />
                
                <TimePickerMobile
                  label="End Time"
                  value={endTime}
                  onChange={setEndTime}
                />
              </div>
              
              <div className="text-sm font-medium text-center">
                Total: {hours} hours
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !workDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {workDate ? format(workDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={workDate}
                  onSelect={(date) => date && setWorkDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entityType">Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={entityType === 'work_order' ? 'default' : 'outline'}
                className={entityType === 'work_order' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
                onClick={() => {
                  setEntityType('work_order');
                  setEntityId('');
                }}
              >
                Work Order
              </Button>
              <Button
                type="button"
                variant={entityType === 'project' ? 'default' : 'outline'}
                className={entityType === 'project' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
                onClick={() => {
                  setEntityType('project');
                  setEntityId('');
                }}
              >
                Project
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="entityId">{entityType === 'work_order' ? 'Work Order' : 'Project'}</Label>
            <select
              id="entityId"
              className="w-full border border-input bg-background px-3 py-2 rounded-md"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              disabled={loadingEntities}
            >
              <option value="">Select {entityType === 'work_order' ? 'Work Order' : 'Project'}</option>
              {entityOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            {loadingEntities && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Loading...
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              className="w-full border border-input bg-background px-3 py-2 rounded-md"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the work performed..."
            />
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
              <div>
                <h4 className="font-medium">Attach Receipt</h4>
                <p className="text-sm text-muted-foreground">
                  Do you have a receipt for this time entry?
                </p>
              </div>
              <Switch
                checked={attachReceipt}
                onCheckedChange={setAttachReceipt}
                className="data-[state=checked]:bg-[#0485ea]"
              />
            </div>
          </div>
          
          {attachReceipt && (
            <div className="space-y-4 pt-2">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Label>Upload Receipt</Label>
                    <FileUpload
                      onChange={handleFileSelect}
                      maxFiles={1}
                      accept="image/*,application/pdf"
                      maxSize={5 * 1024 * 1024} // 5MB
                    />
                  </div>
                </CardContent>
              </Card>
              
              {selectedFiles.length > 0 && (
                <ReceiptMetadataForm
                  metadata={receiptMetadata}
                  updateMetadata={updateReceiptMetadata}
                  entityType={entityType}
                  entityId={entityId}
                />
              )}
            </div>
          )}
          
          <Button
            onClick={handleSubmit}
            disabled={loading || !entityId || parseFloat(hours) <= 0}
            className="w-full bg-[#0485ea] hover:bg-[#0375d1] mt-4"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Time
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
