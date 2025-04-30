import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface TableLoadingProps {
  rowCount?: number;
  className?: string;
}

export function TableLoading({ rowCount = 5, className }: TableLoadingProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}
