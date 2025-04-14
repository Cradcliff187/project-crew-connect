import { ChevronDown as LucideChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChevronDownProps extends React.ComponentPropsWithoutRef<typeof LucideChevronDown> {}

export const ChevronDown = ({ className, ...props }: ChevronDownProps) => {
  return <LucideChevronDown className={cn(className)} {...props} />;
};
