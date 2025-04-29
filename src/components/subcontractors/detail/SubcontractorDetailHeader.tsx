import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/layout/PageHeader';
import { Subcontractor } from '../utils/types';

interface SubcontractorDetailHeaderProps {
  subcontractor: Subcontractor | null;
  loading: boolean;
  onEdit: () => void;
}

const SubcontractorDetailHeader = ({
  subcontractor,
  loading,
  onEdit,
}: SubcontractorDetailHeaderProps) => {
  const headerActions = (
    <Button onClick={onEdit} size="sm">
      <Edit className="h-4 w-4 mr-2" />
      Edit Subcontractor
    </Button>
  );

  if (loading) {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
    );
  }

  if (!subcontractor) {
    return <PageHeader title="Subcontractor Not Found" backLink="/subcontractors" />;
  }

  return (
    <PageHeader
      title={subcontractor.subname || 'Subcontractor Detail'}
      backLink="/subcontractors"
      backText="Back to Subcontractors"
      actions={headerActions}
    />
  );
};

export default SubcontractorDetailHeader;
