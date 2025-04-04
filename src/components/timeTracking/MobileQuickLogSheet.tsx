
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TimeEntryFormValues } from './hooks/useTimeEntryForm';
import { useTimeEntrySubmit } from '@/hooks/useTimeEntrySubmit';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import ReceiptMetadataForm from './form/ReceiptMetadataForm';

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
  const [entityId, setEntityId] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [receiptMetadata, setReceiptMetadata] = useState<{
    category: string;
    expenseType: string | null;
    tags: string[];
    vendorId?: string;
    vendorType?: 'vendor' | 'subcontractor' | 'other';
    amount?: number;
  }>({
    category: 'receipt',
    expenseType: null,
    tags: ['time-entry', 'quick-log'],
    vendorType: 'vendor'
  });

  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit(onSuccess);

  const resetForm = () => {
    setWorkDate(selectedDate);
    setHours('1');
    setEntityType('work_order');
    setEntityId('');
    setHasReceipt(false);
    setSelectedFiles([]);
    setReceiptMetadata({
      category: 'receipt',
      expenseType: null,
      tags: ['time-entry', 'quick-log'],
      vendorType: 'vendor'
    });
  };

  const updateReceiptMetadata = (
    data: Partial<{
      category: string;
      expenseType: string | null;
      tags: string[];
      vendorId?: string;
      vendorType?: 'vendor' | 'subcontractor' | 'other';
      amount?: number;
    }>
  ) => {
    setReceiptMetadata(prev => ({
      ...prev,
      ...data
    }));
  };

  const validateForm = () => {
    if (!entityId) {
      toast({
        title: "Missing information",
        description: `Please enter a ${entityType.replace('_', ' ')} ID.`,
        variant: "destructive",
      });
      return false;
    }

    if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter a valid number of hours.",
        variant: "destructive",
      });
      return false;
    }

    if (hasReceipt && selectedFiles.length === 0) {
      toast({
        title: "Receipt required",
        description: "You indicated you have receipts but none were uploaded.",
        variant: "destructive",
      });
      return false;
    }

    if (hasReceipt && selectedFiles.length > 0 && !receiptMetadata.expenseType) {
      toast({
        title: "Expense type required",
        description: "Please select an expense type for your receipt.",
        variant: "destructive",
      });
      return false;
    }

    if (hasReceipt && selectedFiles.length > 0 && 
        receiptMetadata.vendorType !== 'other' && 
        !receiptMetadata.vendorId) {
      toast({
        title: "Vendor required",
        description: `Please select a ${receiptMetadata.vendorType} for this receipt.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleQuickSubmit = async () => {
    if (!validateForm()) return;

    const hoursWorked = Number(hours);
    
    // Calculate reasonable start and end times based on the number of hours
    const now = new Date();
    
    // For end time, use current time
    let endHour = now.getHours();
    let endMinute = now.getMinutes();
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
    
    // For start time, subtract the hours worked
    let startHour = endHour - Math.floor(hoursWorked);
    let startMinute = endMinute - Math.round((hoursWorked % 1) * 60);
    
    // Adjust for minutes overflow
    if (startMinute < 0) {
      startHour -= 1;
      startMinute += 60;
    }
    
    // Adjust for hours overflow (handle 24-hour wrap)
    if (startHour < 0) {
      startHour += 24;
    }
    
    const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

    const formData: TimeEntryFormValues = {
      entityType,
      entityId,
      workDate,
      startTime: startTimeStr,
      endTime: endTimeStr,
      hoursWorked,
      notes: 'Quick log entry',
      hasReceipts: hasReceipt && selectedFiles.length > 0
    };

    // Submit the time entry with receipt metadata
    await submitTimeEntry(formData, selectedFiles, receiptMetadata);
    
    // Reset form and close sheet
    resetForm();
    onOpenChange(false);
  };

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
    if (files.length > 0) {
      setHasReceipt(true);
    }
  };

  const handleFileClear = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setHasReceipt(false);
      }
      return newFiles;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Log Entry</SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <Tabs defaultValue="work_order">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="work_order"
                onClick={() => setEntityType('work_order')}
              >
                Work Order
              </TabsTrigger>
              <TabsTrigger 
                value="project"
                onClick={() => setEntityType('project')}
              >
                Project
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entityId">{entityType === 'work_order' ? 'Work Order' : 'Project'} ID</Label>
              <Input
                id="entityId"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder={`Enter ${entityType === 'work_order' ? 'work order' : 'project'} ID`}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(workDate, "MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
              <Label htmlFor="hours">Hours Worked</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Receipt className="h-4 w-4 mr-2 text-[#0485ea]" />
                    <Label htmlFor="has-receipt" className="cursor-pointer">
                      I have receipt(s)
                    </Label>
                  </div>
                  <Switch
                    id="has-receipt"
                    checked={hasReceipt}
                    onCheckedChange={setHasReceipt}
                    className="data-[state=checked]:bg-[#0485ea]"
                  />
                </div>

                {hasReceipt && (
                  <div className="space-y-4">
                    <FileUpload
                      onFilesSelected={handleFileSelect}
                      onFileClear={handleFileClear}
                      selectedFiles={selectedFiles}
                      allowMultiple={true}
                      acceptedFileTypes="image/*,application/pdf"
                      dropzoneText="Tap to upload receipt"
                    />
                    
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
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleQuickSubmit}
                className="bg-[#0485ea] hover:bg-[#0375d1]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Save Quick Log"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
