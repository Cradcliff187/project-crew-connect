import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  backText?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backLink,
  backText,
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div className="flex items-start gap-3">
        {backLink && (
          <Button variant="outline" size="icon" asChild className="mt-1">
            <Link to={backLink}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">{backText || 'Go back'}</span>
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="mt-4 md:mt-0 flex flex-wrap gap-2 justify-end">{actions}</div>}
    </div>
  );
};

export default PageHeader;
