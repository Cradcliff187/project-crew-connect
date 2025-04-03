
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { useNavigate } from 'react-router-dom';

interface NavigateToEntityButtonProps {
  document: Document;
}

const NavigateToEntityButton: React.FC<NavigateToEntityButtonProps> = ({ document }) => {
  const navigate = useNavigate();
  
  // Function to get entity URL
  const getEntityUrl = () => {
    const entityType = document.entity_type?.toUpperCase();
    const entityId = document.entity_id;
    
    if (!entityType || !entityId || entityId === 'detached') {
      return null;
    }
    
    switch (entityType) {
      case 'PROJECT':
        return `/projects/${entityId}`;
      case 'CONTACT':
        return `/contacts/${entityId}`;
      case 'CUSTOMER':
        return `/customers/${entityId}`;
      case 'VENDOR':
        return `/vendors/${entityId}`;
      case 'SUBCONTRACTOR':
        return `/subcontractors/${entityId}`;
      case 'ESTIMATE':
        return `/estimates/${entityId}`;
      case 'WORK_ORDER':
        return `/work-orders/${entityId}`;
      case 'MAINTENANCE_WORK_ORDER':
        return `/maintenance/work-orders/${entityId}`;
      case 'TIME_ENTRY':
        return `/time-tracking/${entityId}`;
      default:
        return null;
    }
  };
  
  // Get entity label
  const getEntityLabel = () => {
    const entityType = document.entity_type?.toUpperCase();
    
    if (!entityType) return 'Entity';
    
    switch (entityType) {
      case 'PROJECT':
        return 'Project';
      case 'CONTACT':
        return 'Contact';
      case 'CUSTOMER':
        return 'Customer';
      case 'VENDOR':
        return 'Vendor';
      case 'SUBCONTRACTOR':
        return 'Subcontractor';
      case 'ESTIMATE':
        return 'Estimate';
      case 'WORK_ORDER':
        return 'Work Order';
      case 'MAINTENANCE_WORK_ORDER':
        return 'Maintenance';
      case 'TIME_ENTRY':
        return 'Time Entry';
      default:
        return entityType;
    }
  };
  
  const url = getEntityUrl();
  
  if (!url) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-[#0485ea]"
      onClick={() => navigate(url)}
    >
      <ExternalLink className="h-3.5 w-3.5 mr-1" />
      <span>View {getEntityLabel()}</span>
    </Button>
  );
};

export default NavigateToEntityButton;
