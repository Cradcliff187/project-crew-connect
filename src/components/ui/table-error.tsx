import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableErrorProps {
  error: string;
  className?: string;
  onRetry?: () => void;
}

export function TableError({ error, className, onRetry }: TableErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-md',
        className
      )}
    >
      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
      <h3 className="font-semibold text-lg mb-1">Error Loading Data</h3>
      <p className="text-muted-foreground text-center mb-4 max-w-md">
        {error || 'There was an issue loading the data. Please try again.'}
      </p>
      <Button variant="outline" onClick={handleRetry}>
        <RefreshCw className="mr-1 h-4 w-4" aria-hidden="true" />
        Refresh
      </Button>
    </div>
  );
}
