
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Star, Clock, CheckCircle2 } from 'lucide-react';
import { 
  formatSubcontractorAddress, 
  getPaymentTermsLabel, 
  getRatingDisplay, 
  Subcontractor,
  calculateVendorScore
} from './utils/subcontractorUtils';
import { format } from 'date-fns';
import InsuranceStatus from './InsuranceStatus';
import VendorScoreBadge from './VendorScoreBadge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface SubcontractorRowProps {
  subcontractor: Subcontractor;
  specialties: Record<string, any>;
  onEdit: (subcontractor: Subcontractor) => void;
  onDelete: (subcontractor: Subcontractor) => void;
  onView: (subcontractor: Subcontractor) => void;
}

const SubcontractorRow: React.FC<SubcontractorRowProps> = ({
  subcontractor,
  specialties,
  onEdit,
  onDelete,
  onView
}) => {
  const navigate = useNavigate();
  
  // Format created_at date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Handle view click - Navigate to detail page
  const handleViewClick = () => {
    // Call the provided onView prop (for backward compatibility)
    onView(subcontractor);
    // Navigate to the detail page
    navigate(`/subcontractors/${subcontractor.subid}`);
  };
  
  // Get status badge color
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
  
  // Render specialty badges
  const renderSpecialties = () => {
    if (!subcontractor.specialty_ids || subcontractor.specialty_ids.length === 0) {
      return <span className="text-muted-foreground italic">None</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {subcontractor.specialty_ids.map(id => {
          const specialty = specialties[id];
          return specialty ? (
            <Badge key={id} variant="secondary" className="text-xs">
              {specialty.specialty}
            </Badge>
          ) : null;
        })}
      </div>
    );
  };
  
  // Calculate vendor score
  const vendorScore = calculateVendorScore(subcontractor);
  
  // Render vendor compliance status indicators
  const renderComplianceIndicators = () => {
    return (
      <div className="flex gap-1 items-center">
        {/* Insurance Status */}
        <InsuranceStatus expirationDate={subcontractor.insurance_expiration} />
        
        {/* Vendor Score */}
        <VendorScoreBadge score={vendorScore} />
        
        {/* Contract Status */}
        {subcontractor.contract_on_file && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-blue-500">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M9 17h6" />
                    <path d="M9 13h6" />
                  </svg>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contract on file</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Preferred Vendor Status */}
        {subcontractor.preferred && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preferred vendor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Performance Review Status */}
        {subcontractor.last_performance_review && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <Clock className={`h-4 w-4 ${
                    // If review is within the last 6 months
                    new Date(subcontractor.last_performance_review) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) 
                      ? 'text-green-500' 
                      : 'text-amber-500'
                  }`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last review: {formatDate(subcontractor.last_performance_review)}</p>
                {new Date(subcontractor.last_performance_review) <= new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) && 
                  <p className="text-amber-400">Review overdue</p>
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {/* Performance Metrics */}
        {subcontractor.on_time_percentage && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex">
                  <CheckCircle2 className={`h-4 w-4 ${
                    subcontractor.on_time_percentage >= 90 ? 'text-green-500' :
                    subcontractor.on_time_percentage >= 75 ? 'text-amber-500' : 'text-red-500'
                  }`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>On-time percentage: {subcontractor.on_time_percentage}%</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  // Get action menu groups - similar pattern to Vendors and Contacts
  const getSubcontractorActions = (): ActionGroup[] => {
    return [
      {
        // Primary actions
        items: [
          {
            label: 'View details',
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewClick()
          },
          {
            label: 'Edit subcontractor',
            icon: <Edit className="h-4 w-4" />,
            onClick: () => onEdit(subcontractor)
          }
        ]
      },
      {
        // Subcontractor specific actions
        items: [
          {
            label: 'Assign to project',
            icon: <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>,
            onClick: () => console.log('Assign to project')
          },
          {
            label: 'Schedule performance review',
            icon: <Clock className="h-4 w-4" />,
            onClick: () => console.log('Schedule performance review')
          }
        ]
      },
      {
        // Destructive actions
        items: [
          {
            label: 'Delete subcontractor',
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => onDelete(subcontractor),
            className: 'text-red-600'
          }
        ]
      }
    ];
  };

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{subcontractor.subname}</div>
        <div className="text-xs text-muted-foreground">{subcontractor.subid}</div>
        {renderComplianceIndicators()}
      </TableCell>
      <TableCell>{renderSpecialties()}</TableCell>
      <TableCell>
        {subcontractor.contactemail && (
          <div className="text-sm">{subcontractor.contactemail}</div>
        )}
        {subcontractor.phone && (
          <div className="text-sm">{subcontractor.phone}</div>
        )}
        {subcontractor.tax_id && (
          <div className="text-xs text-muted-foreground">Tax ID: {subcontractor.tax_id}</div>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm whitespace-pre-line">
          {formatSubcontractorAddress(subcontractor)}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">{formatDate(subcontractor.created_at)}</div>
        <div className="text-xs text-muted-foreground">
          {subcontractor.payment_terms && `Terms: ${getPaymentTermsLabel(subcontractor.payment_terms)}`}
        </div>
        {subcontractor.hourly_rate && (
          <div className="text-xs text-muted-foreground">
            Rate: ${subcontractor.hourly_rate}/hr
          </div>
        )}
        {subcontractor.rating && (
          <div className="text-xs text-amber-500">
            {getRatingDisplay(subcontractor.rating)}
          </div>
        )}
      </TableCell>
      <TableCell>{getStatusBadge(subcontractor.status)}</TableCell>
      <TableCell>
        <div className="flex justify-end">
          <ActionMenu groups={getSubcontractorActions()} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SubcontractorRow;
