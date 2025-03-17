
import { Star as LucideStar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarProps extends React.ComponentPropsWithoutRef<typeof LucideStar> {
  filled?: boolean;
}

export const Star = ({ filled = false, className, ...props }: StarProps) => {
  return (
    <LucideStar
      className={cn(className)}
      fill={filled ? "currentColor" : "none"}
      {...props}
    />
  );
};
