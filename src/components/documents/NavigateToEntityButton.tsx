
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavigateToEntityButtonProps {
  document: Document;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const NavigateToEntityButton: React.FC<NavigateToEntityButtonProps> = ({
  document,
  className = '',
  variant = 'ghost',
  size = 'sm'
}) => {
  const { navigateToEntity, isNavigating } = useDocumentNavigation();

  // Don't render anything if the document has no entity
  if (!document.entity_type || !document.entity_id || document.entity_id === 'detached') {
    return null;
  }

  const getEntityName = () => {
    switch (document.entity_type.toUpperCase()) {
      case 'PROJECT':
        return 'Project';
      case 'WORK_ORDER':
        return 'Work Order';
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
      case 'MAINTENANCE_WORK_ORDER':
        return 'Maintenance Work Order';
      case 'CHANGE_ORDER':
        return 'Change Order';
      case 'INVOICE':
        return 'Invoice';
      default:
        return document.entity_type;
    }
  };

  const tooltipText = `Go to ${getEntityName()} Page`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigateToEntity(document);
            }}
            variant={variant}
            size={size}
            className={className}
            disabled={isNavigating}
          >
            {isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NavigateToEntityButton;
