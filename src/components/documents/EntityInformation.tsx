
import React from 'react';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import { ExternalLink, Briefcase, Wrench, Landmark, Receipt, Clock, User, FileText } from 'lucide-react';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';

interface EntityInformationProps {
  document: Document;
}

const EntityInformation: React.FC<EntityInformationProps> = ({ document }) => {
  const { navigateToEntity, isNavigating } = useDocumentNavigation();

  if (!document.entity_type || !document.entity_id || document.entity_id.includes('general')) {
    return <div className="text-sm text-muted-foreground">No entity association</div>;
  }

  const getEntityIcon = () => {
    switch (document.entity_type.toUpperCase()) {
      case 'PROJECT':
        return <Briefcase className="h-4 w-4" />;
      case 'WORK_ORDER':
        return <Wrench className="h-4 w-4" />;
      case 'ESTIMATE':
        return <FileText className="h-4 w-4" />;
      case 'CUSTOMER':
        return <User className="h-4 w-4" />;
      case 'VENDOR':
        return <Landmark className="h-4 w-4" />;
      case 'SUBCONTRACTOR':
        return <Wrench className="h-4 w-4" />;
      case 'EXPENSE':
        return <Receipt className="h-4 w-4" />;
      case 'TIME_ENTRY':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatEntityId = (id: string) => {
    // For display purposes, show only the last part of the ID
    if (id.includes('-')) {
      const parts = id.split('-');
      return parts[parts.length - 1];
    }
    // Or last 5 characters
    return id.slice(-5);
  };

  const getEntityName = () => {
    return document.entity_type.toLowerCase().replace('_', ' ');
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">Associated with:</span>
        <div className="flex items-center gap-1.5 text-[#0485ea]">
          {getEntityIcon()}
          <span className="capitalize">{getEntityName()}</span>
          <span>#{formatEntityId(document.entity_id)}</span>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        className="mt-1 text-xs h-8"
        onClick={() => navigateToEntity(document)}
        disabled={isNavigating}
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1" />
        Go to {getEntityName()}
      </Button>
    </div>
  );
};

export default EntityInformation;
