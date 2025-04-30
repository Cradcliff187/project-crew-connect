import React, { ReactNode } from 'react';
import { Button } from './button';
import { Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterButtonProps {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FilterButton({ children, className, onClick }: FilterButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('flex items-center gap-1', className)}
      onClick={onClick}
    >
      <Filter className="h-4 w-4 mr-1" aria-hidden="true" />
      {children || 'Filter'}
      <ChevronDown className="h-3 w-3 ml-1 opacity-70" aria-hidden="true" />
    </Button>
  );
}
