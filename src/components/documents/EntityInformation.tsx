import React from 'react';
import { Document } from './schemas/documentSchema';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  Briefcase,
  Wrench,
  Landmark,
  Receipt,
  Clock,
  User,
  FileText,
  Building,
  Hammer,
  FileCheck,
} from 'lucide-react';
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
      case 'CONTACT':
        return <User className="h-4 w-4" />;
      case 'VENDOR':
        return <Landmark className="h-4 w-4" />;
      case 'SUBCONTRACTOR':
        return <Hammer className="h-4 w-4" />;
      case 'INVOICE':
        return <Receipt className="h-4 w-4" />;
      case 'CHANGE_ORDER':
        return <FileCheck className="h-4 w-4" />;
      case 'EXPENSE':
        return <Receipt className="h-4 w-4" />;
      case 'MAINTENANCE_WORK_ORDER':
        return <Building className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEntityName = () => {
    switch (document.entity_type.toUpperCase()) {
      case 'PROJECT':
        return 'Project';
      case 'WORK_ORDER':
        return 'Work Order';
      case 'ESTIMATE':
        return 'Estimate';
      case 'CUSTOMER':
        return 'Customer';
      case 'CONTACT':
        return 'Contact';
      case 'VENDOR':
        return 'Vendor';
      case 'SUBCONTRACTOR':
        return 'Subcontractor';
      case 'INVOICE':
        return 'Invoice';
      case 'CHANGE_ORDER':
        return 'Change Order';
      case 'EXPENSE':
        return 'Expense';
      case 'MAINTENANCE_WORK_ORDER':
        return 'Maintenance Work Order';
      default:
        return document.entity_type;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {getEntityIcon()}
        <span className="text-sm ml-1">{getEntityName()}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-[#0485ea]"
        onClick={() => navigateToEntity(document)}
        disabled={isNavigating}
      >
        <ExternalLink className="h-3.5 w-3.5 mr-1" />
        <span className="text-xs">View</span>
      </Button>
    </div>
  );
};

export default EntityInformation;
