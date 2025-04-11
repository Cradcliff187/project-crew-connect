
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TagsFieldProps {
  control: Control<any>;
}

const TagsField: React.FC<TagsFieldProps> = ({ control }) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentTags: string[],
    onChange: (...event: any[]) => void
  ) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      
      // Normalize tag to lowercase and trim
      const normalizedTag = newTag.trim().toLowerCase();
      
      // Only add if tag doesn't already exist
      if (!currentTags.includes(normalizedTag)) {
        onChange([...currentTags, normalizedTag]);
      }
      
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string, currentTags: string[], onChange: (...event: any[]) => void) => {
    onChange(currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <FormField
      control={control}
      name="metadata.tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Input 
                placeholder="Add tags (press Enter after each tag)"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => handleAddTag(e, field.value || [], field.onChange)}
              />
              
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(field.value) && field.value.map((tag: string, index: number) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="px-3 py-1 flex items-center gap-1 bg-blue-50"
                  >
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer ml-1" 
                      onClick={() => handleRemoveTag(tag, field.value || [], field.onChange)} 
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TagsField;
