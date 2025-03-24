
import React, { useState } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface TagsInputProps {
  control: Control<DocumentUploadFormValues>;
  name?: string;
  label?: string;
  description?: string;
}

const TagsInput: React.FC<TagsInputProps> = ({ 
  control, 
  name = "metadata.tags", 
  label = "Tags", 
  description = "Add tags to help organize and search for this document later" 
}) => {
  return (
    <FormField
      control={control}
      name="metadata.tags"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <TagsInputField
              value={field.value || []}
              onChange={field.onChange}
              placeholder="Type and press Enter to add a tag"
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export interface TagsInputFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const TagsInputField: React.FC<TagsInputFieldProps> = ({ 
  value = [], 
  onChange, 
  placeholder = "Add tag..." 
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      onChange(value.slice(0, -1));
    }
  };
  
  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };
  
  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md items-center bg-background">
      {value.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          {tag}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-destructive" 
            onClick={() => removeTag(tag)} 
          />
        </Badge>
      ))}
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-grow border-0 px-2 py-1 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};

export default TagsInput;
