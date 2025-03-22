
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UseFormRegister } from 'react-hook-form';
import { TimeEntryFormValues } from '../../hooks/useTimeEntryForm';

interface NotesFieldProps {
  register: UseFormRegister<TimeEntryFormValues>;
}

const NotesField: React.FC<NotesFieldProps> = ({ register }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes (Optional)</Label>
      <Textarea
        id="notes"
        placeholder="Add any notes about the work performed..."
        {...register('notes')}
        rows={3}
      />
    </div>
  );
};

export default NotesField;
