
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clock, Camera } from 'lucide-react';
import { useTimeEntrySubmit } from '@/hooks/useTimeEntrySubmit';
import { useEntityData } from './hooks/useEntityData';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MobileDocumentCapture from '@/components/documents/MobileDocumentCapture';

interface MobileQuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  selectedDate: Date;
}

const quickLogSchema = z.object({
  entityType: z.enum(['work_order', 'project']),
  entityId: z.string().min(1, "Please select a work order or project"),
  hoursWorked: z.number().min(0.25, "Hours must be at least 0.25"),
  notes: z.string().optional(),
});

type QuickLogFormValues = z.infer<typeof quickLogSchema>;

const MobileQuickLogSheet: React.FC<MobileQuickLogSheetProps> = ({
  open,
  onOpenChange,
  onSuccess,
  selectedDate
}) => {
  const { toast } = useToast();
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isSubmitting, submitTimeEntry } = useTimeEntrySubmit(onSuccess);
  
  const form = useForm<QuickLogFormValues>({
    resolver: zodResolver(quickLogSchema),
    defaultValues: {
      entityType: 'work_order',
      entityId: '',
      hoursWorked: 1,
      notes: '',
    }
  });
  
  const {
    workOrders,
    projects,
    isLoadingEntities,
    getSelectedEntityDetails
  } = useEntityData(form);
  
  const handleSubmit = async (data: QuickLogFormValues) => {
    // Create synthetic data for the timeentry
    const workDate = selectedDate;
    const currentHour = new Date().getHours();
    let startHour = Math.max(8, currentHour - Math.ceil(data.hoursWorked));
    if (startHour > 17) startHour = 17 - Math.ceil(data.hoursWorked);
    if (startHour < 0) startHour = 0;
    
    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
    const endHour = startHour + Math.floor(data.hoursWorked);
    const endMinutes = Math.round((data.hoursWorked % 1) * 60);
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    const fullFormData = {
      entityType: data.entityType,
      entityId: data.entityId,
      workDate,
      startTime,
      endTime,
      hoursWorked: data.hoursWorked,
      notes: data.notes,
      employeeId: '',
    };
    
    try {
      await submitTimeEntry(fullFormData, selectedFile ? [selectedFile] : []);
      form.reset({
        entityType: 'work_order',
        entityId: '',
        hoursWorked: 1,
        notes: '',
      });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error submitting quick log:', error);
    }
  };
  
  const handleFileCapture = (file: File) => {
    setSelectedFile(file);
    setShowCamera(false);
    toast({
      title: "Receipt captured",
      description: "Your receipt has been added and will be uploaded with your time entry."
    });
  };
  
  const entityOptions = form.watch('entityType') === 'work_order' ? workOrders : projects;
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Log Time</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
          {/* Date Display */}
          <div className="bg-muted p-3 rounded-md text-center mb-4">
            <p className="text-sm font-medium">Logging time for: {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
          </div>
          
          {/* Entity Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={form.watch('entityType') === 'work_order' ? 'default' : 'outline'}
              className={form.watch('entityType') === 'work_order' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
              onClick={() => form.setValue('entityType', 'work_order')}
            >
              Work Order
            </Button>
            <Button
              type="button"
              variant={form.watch('entityType') === 'project' ? 'default' : 'outline'}
              className={form.watch('entityType') === 'project' ? 'bg-[#0485ea] hover:bg-[#0375d1]' : ''}
              onClick={() => form.setValue('entityType', 'project')}
            >
              Project
            </Button>
          </div>
          
          {/* Entity Selection */}
          <div className="space-y-2">
            <Label htmlFor="entity-selector">
              {form.watch('entityType') === 'work_order' ? 'Work Order' : 'Project'}
            </Label>
            <select
              id="entity-selector"
              className="w-full border border-input bg-background px-3 py-2 rounded-md"
              value={form.watch('entityId')}
              onChange={(e) => form.setValue('entityId', e.target.value)}
              disabled={isLoadingEntities}
            >
              <option value="">Select {form.watch('entityType') === 'work_order' ? 'a work order' : 'a project'}</option>
              {entityOptions.map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.title}
                </option>
              ))}
            </select>
            {form.formState.errors.entityId && (
              <p className="text-xs text-destructive">{form.formState.errors.entityId.message}</p>
            )}
          </div>
          
          {/* Hours Worked */}
          <div className="space-y-2">
            <Label htmlFor="hoursWorked">Hours Worked</Label>
            <Input
              id="hoursWorked"
              type="number"
              step="0.25"
              min="0.25"
              className="text-lg"
              {...form.register('hoursWorked', { valueAsNumber: true })}
            />
            {form.formState.errors.hoursWorked && (
              <p className="text-xs text-destructive">{form.formState.errors.hoursWorked.message}</p>
            )}
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add details about the work performed..."
              rows={2}
              {...form.register('notes')}
            />
          </div>
          
          {/* Receipt Attachment */}
          <div className="space-y-2 border-t pt-4">
            {selectedFile ? (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Receipt attached:
                </p>
                <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <span className="text-sm truncate">{selectedFile.name}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowCamera(true)}
              >
                <Camera className="h-4 w-4 mr-2" />
                Add Receipt
              </Button>
            )}
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#0485ea] hover:bg-[#0375d1]"
            disabled={isSubmitting}
          >
            <Clock className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Log Time'}
          </Button>
        </form>
        
        {/* Camera Capture Sheet */}
        {showCamera && (
          <Sheet open={showCamera} onOpenChange={setShowCamera}>
            <SheetContent side="bottom" className="h-[90vh]">
              <SheetHeader>
                <SheetTitle>Capture Receipt</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <MobileDocumentCapture onCapture={handleFileCapture} />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MobileQuickLogSheet;
