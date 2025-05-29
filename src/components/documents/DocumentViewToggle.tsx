import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';

export type DocumentViewType = 'grid' | 'list';

interface DocumentViewToggleProps {
  viewType: DocumentViewType;
  onViewTypeChange: (viewType: DocumentViewType) => void;
  className?: string;
}

const DocumentViewToggle: React.FC<DocumentViewToggleProps> = ({
  viewType,
  onViewTypeChange,
  className = '',
}) => {
  return (
    <ToggleGroup
      type="single"
      value={viewType}
      onValueChange={value => value && onViewTypeChange(value as DocumentViewType)}
      className={className}
    >
      <ToggleGroupItem value="grid" aria-label="Grid view" className="font-opensans">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" className="font-opensans">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default DocumentViewToggle;
