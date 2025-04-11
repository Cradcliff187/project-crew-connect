
import React, { useState, useEffect } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TagsInputProps {
  control: Control<any>;
  name: string;
  prefillTags?: string[];
}

const TagsInput: React.FC<TagsInputProps> = ({ control, name, prefillTags }) => {
  const [inputValue, setInputValue] = useState('');
  const [localTags, setLocalTags] = useState<string[]>([]);

  // Add tag to tags array
  const addTag = (tag: string, onChange: (value: any) => void) => {
    if (!tag.trim()) return;
    
    const normalizedTag = tag.trim().toLowerCase();
    
    // Don't add duplicate tags
    if (!localTags.includes(normalizedTag)) {
      const newTags = [...localTags, normalizedTag];
      setLocalTags(newTags);
      onChange(newTags);
    }
    
    setInputValue('');
  };

  // Remove tag from tags array
  const removeTag = (tagToRemove: string, onChange: (value: any) => void) => {
    const newTags = localTags.filter(tag => tag !== tagToRemove);
    setLocalTags(newTags);
    onChange(newTags);
  };

  // Handle key down events (Enter to add tag)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, onChange: (value: any) => void) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue, onChange);
    }
  };

  // Initialize with prefill tags if provided
  useEffect(() => {
    if (prefillTags?.length && !localTags.length) {
      setLocalTags(prefillTags);
    }
  }, [prefillTags]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Sync field value with local state when field value changes externally
        useEffect(() => {
          if (field.value && Array.isArray(field.value) && field.value.length > 0) {
            setLocalTags(field.value);
          }
        }, [field.value]);
        
        return (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <div className="flex flex-col space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {localTags.map((tag, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {tag}
                    <button 
                      type="button" 
                      className="ml-1 hover:text-red-600" 
                      onClick={() => removeTag(tag, field.onChange)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <FormControl>
                <Input
                  type="text"
                  placeholder="Type tag and press Enter or comma"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, field.onChange)}
                  onBlur={(e) => {
                    if (inputValue) {
                      addTag(inputValue, field.onChange);
                    }
                  }}
                />
              </FormControl>
            </div>
          </FormItem>
        );
      }}
    />
  );
};

export default TagsInput;
