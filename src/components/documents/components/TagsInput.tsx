
import React, { KeyboardEvent, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface TagsInputProps {
  control: Control<DocumentUploadFormValues>;
  name: 'metadata.tags'; // This enforces that we only use this for tags
  instanceId?: string; // Added instanceId prop
}

const TagsInput: React.FC<TagsInputProps> = ({ 
  control, 
  name,
  instanceId = 'default-tags'  // Default value
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>, 
    onChange: (value: string[]) => void, 
    currentTags: string[]
  ) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      
      // Don't add duplicates
      if (!currentTags.includes(newTag)) {
        onChange([...currentTags, newTag]);
      }
      
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string, onChange: (value: string[]) => void, currentTags: string[]) => {
    onChange(currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap gap-1 mb-2">
            {field.value && field.value.map((tag, index) => (
              <Badge 
                key={`${tag}-${index}`} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button 
                  type="button" 
                  className="h-3 w-3 rounded-full"
                  onClick={() => removeTag(tag, field.onChange, field.value || [])}
                  aria-label={`Remove tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <FormControl>
            <Input
              id={`${instanceId}-tags-input`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field.onChange, field.value || [])}
              placeholder="Type and press Enter to add tags"
              className="flex-1"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TagsInput;
