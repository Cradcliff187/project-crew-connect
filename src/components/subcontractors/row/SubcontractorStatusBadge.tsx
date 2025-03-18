
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SubcontractorStatusBadgeProps {
  status: string | null;
}

const SubcontractorStatusBadge = ({ status }: SubcontractorStatusBadgeProps) => {
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

export default SubcontractorStatusBadge;
