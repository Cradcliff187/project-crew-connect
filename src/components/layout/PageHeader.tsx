import React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader = ({ title, description, children }: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col gap-2 animate-in">
        <h1 className="text-xl md:text-2xl font-semibold text-[#0485ea]">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {children && (
        <div
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in"
          style={{ animationDelay: '0.1s' }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
