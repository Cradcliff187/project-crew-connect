import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  containerClassName?: string;
  iconClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, iconClassName, ...props }, ref) => {
    return (
      <div className={cn('relative w-full', containerClassName)}>
        <Search
          className={cn('absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground', iconClassName)}
          aria-hidden="true"
        />
        <Input ref={ref} type="search" className={cn('pl-9 rounded-md', className)} {...props} />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
