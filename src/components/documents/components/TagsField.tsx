
import React, { useState, useRef } from 'react';
import { Control, useController } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface TagsFieldProps {
  control: Control<DocumentUploadFormValues>;
  name?: string;
}

const TagsField: React.FC<TagsFieldProps> = ({ control, name = "metadata.tags" }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { field } = useController({
    name: name as any,
    control,
  });

  // Ensure we're working with an array of strings
  const tags = Array.isArray(field.value) ? field.value : [];
  
  // Focus the input when clicking on the container
  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Add a tag when Enter is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  // Add a tag when input loses focus
  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };

  // Add a new tag
  const addTag = (tag: string) => {
    // Don't add duplicates
    if (tags.includes(tag)) {
      setInputValue('');
      return;
    }
    
    // Limit to 10 tags
    if (tags.length >= 10) {
      return;
    }
    
    const newTags = [...tags, tag];
    field.onChange(newTags);
    setInputValue('');
  };

  // Remove a tag
  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    field.onChange(newTags);
  };

  return (
    <FormField
      control={control}
      name={name as any}
      render={() => (
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <FormControl>
            <div 
              className="border rounded-md px-3 py-2 flex flex-wrap gap-2 min-h-[70px] cursor-text"
              onClick={focusInput}
            >
              {tags.map((tag, index) => (
                <Badge 
                  key={index}
                  className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    className="ml-1 rounded-full hover:bg-blue-200 p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="flex-1 min-w-[120px] border-none shadow-none focus-visible:ring-0 p-0 h-7"
                placeholder={tags.length === 0 ? "Add tags..." : ""}
                disabled={tags.length >= 10}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TagsField;
