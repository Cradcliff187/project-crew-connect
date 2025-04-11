
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
        case 'EXPENSE':
          // For expenses, check if there's parent entity information
          if (document.parent_entity_type && document.parent_entity_id) {
            // Navigate to the parent entity instead
            switch (document.parent_entity_type.toUpperCase()) {
              case 'PROJECT':
                navigate(`/projects/${document.parent_entity_id}`);
                break;
              case 'WORK_ORDER':
                navigate(`/work-orders/${document.parent_entity_id}`);
                break;
              default:
                navigate(`/expenses?id=${document.entity_id}`);
            }
          } else {
            navigate(`/expenses?id=${document.entity_id}`);
          }
          break;
        case 'TIME_ENTRY':
          // For time entries, check if there's parent entity information
          if (document.parent_entity_type && document.parent_entity_id) {
            // Navigate to the parent entity instead
            switch (document.parent_entity_type.toUpperCase()) {
              case 'PROJECT':
                navigate(`/projects/${document.parent_entity_id}`);
                break;
              case 'WORK_ORDER':
                navigate(`/work-orders/${document.parent_entity_id}`);
                break;
              default:
                toast({
                  title: 'Navigation',
                  description: 'Time entries are viewed within their parent entities',
                });
            }
          } else {
            toast({
              title: 'Navigation',
              description: 'Time entries are viewed within their parent entities',
            });
          }
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
