import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';

interface NavigateToEntityButtonProps {
  document: Document;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const NavigateToEntityButton: React.FC<NavigateToEntityButtonProps> = ({
  document,
  variant = 'outline',
  size = 'sm',
}) => {
  const { navigateToEntity, isNavigating } = useDocumentNavigation();

  if (!document.entity_type || !document.entity_id) {
    return null;
  }

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
      default:
        return document.entity_type;
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className="text-[#0485ea]"
      onClick={() => navigateToEntity(document)}
      disabled={isNavigating}
    >
      <ExternalLink className="h-4 w-4 mr-1" />
      View {getEntityName()}
    </Button>
  );
};

export default NavigateToEntityButton;
