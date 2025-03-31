
import React, { useState, useRef, KeyboardEvent } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control, FieldValues, Path } from 'react-hook-form';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagsInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  instanceId?: string; // Added instanceId prop
}

function TagsInput<TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label = "Tags",
  instanceId = 'default-tags'  // Default value
}: TagsInputProps<TFieldValues>) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, onChange: (value: string[]) => void, value: string[] = []) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        const newTag = inputValue.trim();
        if (!value.includes(newTag)) {
          onChange([...value, newTag]);
        }
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && value?.length > 0) {
      // Remove the last tag when backspacing with an empty input
      const updatedTags = [...value];
      updatedTags.pop();
      onChange(updatedTags);
    }
  };

  const removeTag = (tagToRemove: string, onChange: (value: string[]) => void, value: string[] = []) => {
    const updatedTags = value.filter(tag => tag !== tagToRemove);
    onChange(updatedTags);
  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <div 
            className="flex flex-wrap items-center gap-2 p-2 border rounded-md min-h-10 cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
            onClick={focusInput}
          >
            {field.value?.map((tag: string, index: number) => (
              <Badge 
                key={`${tag}-${index}`} 
                variant="secondary"
                className="flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag, field.onChange, field.value);
                  }}
                  className="h-4 w-4 rounded-full hover:bg-muted-foreground/20 inline-flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {tag}</span>
                </button>
              </Badge>
            ))}
            <FormControl>
              <Input
                ref={inputRef}
                id={`${instanceId}-tags-input`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, field.onChange, field.value)}
                className="flex-1 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-20"
                placeholder={field.value?.length > 0 ? "" : "Add tags (press Enter or comma to add)"}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default TagsInput;
