
import { useNavigate } from 'react-router-dom';
import { Document } from '../schemas/documentSchema';
import { toast } from '@/hooks/use-toast';

export const useDocumentNavigation = () => {
  const navigate = useNavigate();

  const navigateToEntity = (document: Document) => {
    if (!document.entity_type || !document.entity_id) {
      toast({
        title: "Navigation Error",
        description: "Cannot navigate to this document's entity. Missing entity information.",
        variant: "destructive"
      });
      return;
    }
    
    let route = '';
    
    switch (document.entity_type.toUpperCase()) {
      case 'PROJECT':
        route = `/projects/${document.entity_id}`;
        break;
      case 'WORK_ORDER':
        route = `/work-orders/${document.entity_id}`;
        break;
      case 'VENDOR':
        route = `/vendors/${document.entity_id}`;
        break;
      case 'CUSTOMER':
        route = `/customers/${document.entity_id}`;
        break;
      case 'ESTIMATE':
        route = `/estimates/${document.entity_id}`;
        break;
      case 'EXPENSE':
        route = `/expenses/${document.entity_id}`;
        break;
      default:
        toast({
          title: "Unsupported Entity",
          description: `Navigation to ${document.entity_type} entities is not supported.`,
          variant: "destructive"
        });
        return;
    }
    
    toast({
      title: "Navigating",
      description: `Going to ${document.entity_type.toLowerCase().replace('_', ' ')} details`,
    });
    
    navigate(route);
  };
  
  const navigateToDocument = (documentId: string) => {
    if (!documentId) return;
    navigate(`/documents/${documentId}`);
  };
  
  return {
    navigateToEntity,
    navigateToDocument
  };
};
