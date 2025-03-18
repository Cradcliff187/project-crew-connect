
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

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

  // Status badge styling
  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'QUALIFIED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Qualified</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'VERIFIED':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Verified</Badge>;
      case 'PREFERRED':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Preferred</Badge>;
      case 'REVIEW_NEEDED':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Review Needed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
      <Button onClick={onEdit}>Edit Subcontractor</Button>
    </div>
  );
};

export default SubcontractorDetailHeader;
