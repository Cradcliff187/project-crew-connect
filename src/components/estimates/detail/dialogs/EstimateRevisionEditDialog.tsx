
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EstimateRevisionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId: string;
  revisionId: string;
  onSuccess?: () => void;
}

interface RevisionFormData {
  notes: string;
  revisionDate: Date;
  sentDate?: Date | null;
  sentTo?: string;
}

const EstimateRevisionEditDialog: React.FC<EstimateRevisionEditDialogProps> = ({
  open,
  onOpenChange,
  estimateId,
  revisionId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RevisionFormData>({
    notes: '',
    revisionDate: new Date(),
    sentDate: null,
    sentTo: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (open && revisionId) {
      fetchRevisionDetails();
    }
  }, [open, revisionId]);

  const fetchRevisionDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', revisionId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          notes: data.notes || '',
          revisionDate: data.revision_date ? new Date(data.revision_date) : new Date(),
          sentDate: data.sent_date ? new Date(data.sent_date) : null,
          sentTo: data.sent_to || ''
        });
      }
    } catch (error) {
      console.error('Error fetching revision details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revision details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: 'revisionDate' | 'sentDate', date?: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [field]: date }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        notes: formData.notes,
        revision_date: formData.revisionDate.toISOString(),
        sent_date: formData.sentDate ? formData.sentDate.toISOString() : null,
        sent_to: formData.sentTo || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('estimate_revisions')
        .update(updateData)
        .eq('id', revisionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Revision details updated successfully',
        className: 'bg-[#0485ea] text-white'
      });

      if (onSuccess) {
        onSuccess();
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating revision:', error);
      toast({
        title: 'Error',
        description: 'Failed to update revision details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Revision Details</DialogTitle>
          <DialogDescription>
            Update the information for this estimate revision.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="revision-date">Revision Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="revision-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.revisionDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.revisionDate ? format(formData.revisionDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.revisionDate}
                    onSelect={(date) => handleDateChange('revisionDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sent-date">Sent Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="sent-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.sentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.sentDate ? format(formData.sentDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.sentDate || undefined}
                    onSelect={(date) => handleDateChange('sentDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sent-to">Sent To (optional)</Label>
              <Input
                id="sent-to"
                name="sentTo"
                placeholder="Enter recipient email"
                value={formData.sentTo || ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes about this revision"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateRevisionEditDialog;
