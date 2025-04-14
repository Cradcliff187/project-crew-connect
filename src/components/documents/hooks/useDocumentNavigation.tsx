import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to handle navigation between entities related to documents
 */
export const useDocumentNavigation = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  // Navigate to the entity associated with the document
  const navigateToEntity = useCallback(
    (document: Document) => {
      if (!document || !document.entity_type || !document.entity_id) {
        toast({
          title: 'Navigation error',
          description: 'Unable to navigate to associated entity. Missing information.',
          variant: 'destructive',
        });
        return;
      }

      setIsNavigating(true);

      try {
        // Navigate based on entity type
        switch (document.entity_type.toUpperCase()) {
          case 'PROJECT':
            navigate(`/projects/${document.entity_id}`);
            break;
          case 'WORK_ORDER':
            navigate(`/work-orders/${document.entity_id}`);
            break;
          case 'ESTIMATE':
            navigate(`/estimates/${document.entity_id}`);
            break;
          case 'CUSTOMER':
            navigate(`/customers/${document.entity_id}`);
            break;
          case 'VENDOR':
            navigate(`/vendors/${document.entity_id}`);
            break;
          case 'SUBCONTRACTOR':
            navigate(`/subcontractors/${document.entity_id}`);
            break;
          case 'EXPENSE':
            // This requires special handling as expenses are typically viewed within their parent entity
            toast({
              title: 'Navigation limited',
              description:
                'Expenses are viewed within their parent entities. Navigate to the associated project or work order.',
            });
            break;
          case 'TIME_ENTRY':
            // Time entries are also typically viewed within parent entities
            toast({
              title: 'Navigation limited',
              description: 'Time entries are viewed within their parent entities.',
            });
            break;
          default:
            toast({
              title: 'Navigation unavailable',
              description: `Navigation to ${document.entity_type} is not supported.`,
              variant: 'destructive',
            });
        }
      } catch (error) {
        console.error('Navigation error:', error);
        toast({
          title: 'Navigation failed',
          description: 'An error occurred while trying to navigate to the associated entity.',
          variant: 'destructive',
        });
      } finally {
        setIsNavigating(false);
      }
    },
    [navigate]
  );

  return {
    navigateToEntity,
    isNavigating,
  };
};
