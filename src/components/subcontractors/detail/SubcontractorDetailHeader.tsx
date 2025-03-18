
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SubcontractorDetailHeaderProps {
  subcontractor: any;
  loading: boolean;
  onEdit: () => void;
}

const SubcontractorDetailHeader = ({ subcontractor, loading, onEdit }: SubcontractorDetailHeaderProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/subcontractors');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit();
  };

  if (loading) {
    return (
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Skeleton className="h-8 w-64" />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <Button variant="ghost" size="sm" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Subcontractors
      </Button>
      <Button 
        onClick={handleEdit} 
        className="bg-[#0485ea] hover:bg-[#0375d1] text-white"
      >
        Edit Subcontractor
      </Button>
    </div>
  );
};

export default SubcontractorDetailHeader;
