
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

const DashboardCard = ({ 
  title, 
  icon, 
  children, 
  className,
  footer
}: DashboardCardProps) => {
  return (
    <div 
      className={cn(
        "premium-card overflow-hidden transition-all duration-300 flex flex-col shadow-md", 
        className
      )}
    >
      <div className="flex items-center justify-between p-5 border-b border-border/50 bg-warmgray-50/50">
        <h3 className="font-medium font-montserrat">{title}</h3>
        {icon && (
          <div className="h-8 w-8 bg-construction-50 rounded-md flex items-center justify-center text-construction-600">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex-1 p-5 relative z-10">
        {children}
      </div>
      
      {footer && (
        <div className="px-5 py-3 bg-warmgray-50/70 border-t border-border/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
