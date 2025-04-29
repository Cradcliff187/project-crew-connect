import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface NotesSectionProps {
  notes: string | null;
}

const NotesSection = ({ notes }: NotesSectionProps) => {
  if (!notes) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-primary">Notes</CardTitle>
      </CardHeader>
      <div className="whitespace-pre-line bg-muted p-4 rounded-md">{notes}</div>
    </Card>
  );
};

export default NotesSection;
