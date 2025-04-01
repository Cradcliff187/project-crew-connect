
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

export const useDocumentNavigation = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  const navigateToEntity = useCallback((document: Document) => {
    if (!document.entity_type || !document.entity_id) {
      toast({
        title: 'Navigation error',
        description: 'This document is not associated with any entity',
        variant: 'destructive'
      });
      return;
    }

    setIsNavigating(true);

    // Map entity types to their corresponding routes
    const entityRouteMap: Record<string, string> = {
      'PROJECT': `/projects/${document.entity_id}`,
      'WORK_ORDER': `/work-orders/${document.entity_id}`,
      'ESTIMATE': `/estimates/${document.entity_id}`,
      'CUSTOMER': `/customers/${document.entity_id}`,
      'VENDOR': `/vendors/${document.entity_id}`,
      'SUBCONTRACTOR': `/subcontractors/${document.entity_id}`,
      'EXPENSE': `/expenses/${document.entity_id}`,
      'TIME_ENTRY': `/time-tracking?id=${document.entity_id}`
    };

    const route = entityRouteMap[document.entity_type.toUpperCase()];

    if (route) {
      try {
        // React Router's navigate doesn't return a Promise, so don't use .then()
        navigate(route);
        
        // Show success toast after navigation
        toast({
          title: 'Navigation successful',
          description: `Navigated to ${document.entity_type.toLowerCase()}`
        });
      } catch (error) {
        console.error('Navigation error:', error);
        toast({
          title: 'Navigation failed',
          description: 'Could not navigate to the entity page',
          variant: 'destructive'
        });
      } finally {
        setIsNavigating(false);
      }
    } else {
      toast({
        title: 'Navigation error',
        description: `No route defined for entity type: ${document.entity_type}`,
        variant: 'destructive'
      });
      setIsNavigating(false);
    }
  }, [navigate]);

  return {
    navigateToEntity,
    isNavigating
  };
};
