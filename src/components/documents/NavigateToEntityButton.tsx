
import React from 'react';
import { Button } from '@/components/ui/button';
import { Document } from './schemas/documentSchema';
import { Link } from 'react-router-dom';

interface NavigateToEntityButtonProps {
  document: Document;
}

const NavigateToEntityButton: React.FC<NavigateToEntityButtonProps> = ({ document }) => {
  if (!document.entity_id || !document.entity_type || document.entity_id === 'detached') {
    return null;
  }
  
  let entityPath = '';
  let entityName = '';
  
  switch (document.entity_type) {
    case 'PROJECT':
      entityPath = `/projects/${document.entity_id}`;
      entityName = 'Project';
      break;
    case 'CUSTOMER':
      entityPath = `/contacts/${document.entity_id}`;
      entityName = 'Customer';
      break;
    case 'VENDOR':
      entityPath = `/contacts/${document.entity_id}`;
      entityName = 'Vendor';
      break;
    case 'SUBCONTRACTOR':
      entityPath = `/contacts/${document.entity_id}`;
      entityName = 'Subcontractor';
      break;
    case 'ESTIMATE':
      entityPath = `/estimates/${document.entity_id}`;
      entityName = 'Estimate';
      break;
    case 'WORK_ORDER':
      entityPath = `/work-orders/${document.entity_id}`;
      entityName = 'Work Order';
      break;
    default:
      return null;
  }
  
  return (
    <Button variant="outline" asChild>
      <Link to={entityPath}>
        View {entityName}
      </Link>
    </Button>
  );
};

export default NavigateToEntityButton;
