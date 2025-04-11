
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document, EntityType } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to handle navigation between entities related to documents
 */
export const useDocumentNavigation = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  // Navigate to the entity associated with the document
  const navigateToEntity = useCallback((document: Document) => {
    if (!document || !document.entity_type || !document.entity_id) {
      toast({
        title: "Navigation error",
        description: "Unable to navigate to associated entity. Missing information.",
        variant: "destructive"
      });
      return;
    }

    setIsNavigating(true);

    try {
      // Navigate based on entity type
      const entityType = document.entity_type.toString().toUpperCase() as EntityType;
      
      switch (entityType) {
        case EntityType.PROJECT:
          navigate(`/projects/${document.entity_id}`);
          break;
        case EntityType.WORK_ORDER:
          navigate(`/work-orders/${document.entity_id}`);
          break;
        case EntityType.ESTIMATE:
          navigate(`/estimates/${document.entity_id}`);
          break;
        case EntityType.CUSTOMER:
          navigate(`/customers/${document.entity_id}`);
          break;
        case EntityType.VENDOR:
          navigate(`/vendors/${document.entity_id}`);
          break;
        case EntityType.SUBCONTRACTOR:
          navigate(`/subcontractors/${document.entity_id}`);
          break;
        case EntityType.EXPENSE:
          // Check if the expense has a parent entity
          if (document.parentEntityType && document.parentEntityId) {
            // Navigate to the parent entity with a query parameter to highlight this expense
            navigate(`/${document.parentEntityType.toLowerCase()}s/${document.parentEntityId}?highlight=expense&expenseId=${document.entity_id}`);
          } else {
            toast({
              title: "Navigation limited",
              description: "This expense is not linked to a parent entity. Navigate to the associated project or work order.",
            });
          }
          break;
        case EntityType.TIME_ENTRY:
          // Check if the time entry has a parent entity
          if (document.parentEntityType && document.parentEntityId) {
            // Navigate to the parent entity with a query parameter to highlight this time entry
            navigate(`/${document.parentEntityType.toLowerCase()}s/${document.parentEntityId}?highlight=timeEntry&timeEntryId=${document.entity_id}`);
          } else {
            toast({
              title: "Navigation limited",
              description: "Time entries are viewed within their parent entities.",
            });
          }
          break;
        default:
          toast({
            title: "Navigation unavailable",
            description: `Navigation to ${document.entity_type} is not supported.`,
            variant: "destructive"
          });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation failed",
        description: "An error occurred while trying to navigate to the associated entity.",
        variant: "destructive"
      });
    } finally {
      setIsNavigating(false);
    }
  }, [navigate]);

  // Navigate directly to the document details page
  const navigateToDocument = useCallback((documentId: string) => {
    if (!documentId) {
      toast({
        title: "Navigation error",
        description: "Document ID is required to navigate to document.",
        variant: "destructive"
      });
      return;
    }

    setIsNavigating(true);
    try {
      navigate(`/documents/${documentId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation failed",
        description: "An error occurred while trying to navigate to the document.",
        variant: "destructive"
      });
    } finally {
      setIsNavigating(false);
    }
  }, [navigate]);

  return {
    navigateToEntity,
    navigateToDocument,
    isNavigating
  };
};
