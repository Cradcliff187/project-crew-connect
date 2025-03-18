
import React from 'react';

interface NotesSectionProps {
  notes: string | null;
}

const NotesSection = ({ notes }: NotesSectionProps) => {
  if (!notes) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notes</h3>
      <div className="whitespace-pre-line bg-muted p-4 rounded-md">
        {notes}
      </div>
    </div>
  );
};

export default NotesSection;
