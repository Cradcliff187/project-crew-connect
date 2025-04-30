import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({ icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-10', className)}>
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-2">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
