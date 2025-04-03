
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

export const useDocumentNavigation = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  /**
   * Navigate to the appropriate entity page based on the document's entity type
   */
  const navigateToEntity = (document: Document) => {
    if (!document.entity_type || !document.entity_id || document.entity_id === 'detached') {
      toast({
        title: 'Navigation error',
        description: 'This document is not associated with any entity',
        variant: 'destructive',
      });
      return;
    }

    setIsNavigating(true);
    
    try {
      switch (document.entity_type.toUpperCase()) {
        case 'PROJECT':
          navigate(`/projects/${document.entity_id}`);
          break;
        case 'WORK_ORDER':
          navigate(`/work-orders/${document.entity_id}`);
          break;
        case 'CUSTOMER':
        case 'CONTACT':
          // Handle contact navigation - this will open the contact detail
          // For now, navigate to contacts page with query param
          navigate(`/contacts?id=${document.entity_id}`);
          break;
        case 'VENDOR':
          navigate(`/vendors/${document.entity_id}`);
          break;
        case 'SUBCONTRACTOR':
          navigate(`/subcontractors/${document.entity_id}`);
          break;
        case 'ESTIMATE':
          navigate(`/estimates?id=${document.entity_id}`);
          break;
        case 'MAINTENANCE_WORK_ORDER':
          navigate(`/maintenance/work-orders/${document.entity_id}`);
          break;
        case 'CHANGE_ORDER':
          // For change orders, we need to determine if it's for a project or other entity
          // This might need additional context from the document metadata
          navigate(`/change-orders?id=${document.entity_id}`);
          break;
        case 'INVOICE':
          navigate(`/invoices?id=${document.entity_id}`);
          break;
        case 'EXPENSE':
          navigate(`/expenses?id=${document.entity_id}`);
          break;
        default:
          // Default to document detail page
          toast({
            title: 'Navigation',
            description: `Entity type ${document.entity_type} doesn't have a dedicated page`,
          });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: 'Navigation error',
        description: 'Failed to navigate to the entity page',
        variant: 'destructive',
      });
    } finally {
      setIsNavigating(false);
    }
  };

  return {
    navigateToEntity,
    isNavigating
  };
};
