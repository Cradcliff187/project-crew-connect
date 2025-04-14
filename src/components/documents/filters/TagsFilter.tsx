import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Plus, Tag, X } from 'lucide-react';

interface TagsFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsFilter: React.FC<TagsFilterProps> = ({ selectedTags, onTagsChange }) => {
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const addNewTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      onTagsChange([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewTag();
    }
  };

  const clearTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter by Tags</h3>
        {selectedTags.length > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground flex items-center"
            onClick={clearTags}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedTags.map(tag => (
          <Badge
            key={tag}
            variant="default"
            className="cursor-pointer bg-[#0485ea] hover:bg-[#0485ea]/90"
            onClick={() => toggleTag(tag)}
          >
            <Check className="h-3 w-3 mr-1" />
            {tag}
          </Badge>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-1">
            <Input
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 min-w-[120px] max-w-[200px]"
              autoFocus
              placeholder="Enter tag..."
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addNewTag}>
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsAdding(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer border-dashed hover:bg-muted"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add tag filter
          </Badge>
        )}
      </div>
    </div>
  );
};

export default TagsFilter;
