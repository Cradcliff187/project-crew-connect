import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FieldDefinition } from '@/types/reports';
import { ArrowDown, Trash2 } from 'lucide-react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

interface SelectedFieldsListProps {
  fields: FieldDefinition[];
  onRemoveField: (index: number) => void;
  onReorderFields: (fields: FieldDefinition[]) => void;
}

const SelectedFieldsList = ({
  fields,
  onRemoveField,
  onReorderFields,
}: SelectedFieldsListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex(
      field => `${field.entity || ''}-${field.field}` === active.id
    );
    const newIndex = fields.findIndex(field => `${field.entity || ''}-${field.field}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorderFields(arrayMove(fields, oldIndex, newIndex));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Selected Fields</CardTitle>
          <CardDescription>Drag to reorder</CardDescription>
        </div>
        <Badge variant="outline">{fields.length}</Badge>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <div className="flex items-center justify-center h-32 border border-dashed rounded-md">
            <p className="text-sm text-muted-foreground">No fields selected</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(field => `${field.entity || ''}-${field.field}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <SortableItem
                    key={`${field.entity || ''}-${field.field}`}
                    id={`${field.entity || ''}-${field.field}`}
                  >
                    <div className="flex items-center justify-between p-2 border rounded-md bg-background">
                      <div className="flex items-center">
                        <ArrowDown className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{field.label}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => onRemoveField(index)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};

export default SelectedFieldsList;
