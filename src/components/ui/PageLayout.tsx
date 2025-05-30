import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  badge,
  className,
}) => {
  return (
    <div
      className={cn('min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50', className)}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              {Icon && <Icon className="h-8 w-8 mr-3 text-blue-600" />}
              {title}
            </h1>
            {badge && (
              <Badge
                variant={badge.variant || 'outline'}
                className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
              >
                {badge.text}
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-gray-600 font-opensans">{subtitle}</p>}
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
