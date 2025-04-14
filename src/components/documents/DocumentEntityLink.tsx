import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Document } from './schemas/documentSchema';
import { useDocumentNavigation } from './hooks/useDocumentNavigation';
import { Badge } from '../ui/badge';
import { getEntityColor } from '@/lib/utils';

interface DocumentEntityLinkProps {
  document: Document;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'badge';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showEntityType?: boolean;
  className?: string;
}

const DocumentEntityLink: React.FC<DocumentEntityLinkProps> = ({
  document,
  variant = 'outline',
  size = 'sm',
  showEntityType = true,
  className = '',
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
      case 'VENDOR':
        return 'Vendor';
      case 'SUBCONTRACTOR':
        return 'Subcontractor';
      case 'EXPENSE':
        return 'Expense';
      default:
        return document.entity_type.replace(/_/g, ' ');
    }
  };

  const entityColor = getEntityColor(document.entity_type);

  if (variant === 'badge') {
    return (
      <Badge
        variant="outline"
        className={`cursor-pointer hover:bg-${entityColor}-50 border-${entityColor}-200 text-${entityColor}-700 ${className}`}
        onClick={() => navigateToEntity(document)}
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        {showEntityType ? getEntityName() : 'View'}
      </Badge>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`text-[#0485ea] ${className}`}
      onClick={() => navigateToEntity(document)}
      disabled={isNavigating}
    >
      <ExternalLink className="h-4 w-4 mr-1" />
      {showEntityType ? `View ${getEntityName()}` : 'View'}
    </Button>
  );
};

export default DocumentEntityLink;
