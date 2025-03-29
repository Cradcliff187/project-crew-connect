import { useState, useEffect } from 'react';
import { Check, Pause, Play, AlertCircle, X, Clock, ArrowUpRight } from 'lucide-react';
import { StatusOption } from '@/components/common/status/UniversalStatusControl';

type EntityType = 'PROJECT' | 'WORK_ORDER' | 'CHANGE_ORDER' | 'CONTACT' | 'VENDOR';

export function useStatusOptions(entityType: EntityType, currentStatus?: string) {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  
  useEffect(() => {
    setStatusOptions(getStatusOptionsForType(entityType));
  }, [entityType]);
  
  const getStatusOptionsForType = (type: EntityType): StatusOption[] => {
    switch (type) {
      case 'PROJECT':
        return [
          { 
            value: 'new', 
            label: 'New', 
            icon: <ArrowUpRight className="h-4 w-4 text-purple-500" /> 
          },
          { 
            value: 'active', 
            label: 'Active', 
            icon: <Play className="h-4 w-4 text-emerald-500" /> 
          },
          { 
            value: 'on_hold', 
            label: 'On Hold', 
            icon: <Pause className="h-4 w-4 text-amber-500" /> 
          },
          { 
            value: 'completed', 
            label: 'Completed', 
            icon: <Check className="h-4 w-4 text-green-500" /> 
          },
          { 
            value: 'cancelled', 
            label: 'Cancelled', 
            icon: <X className="h-4 w-4 text-red-500" /> 
          },
          { 
            value: 'pending', 
            label: 'Pending', 
            icon: <Clock className="h-4 w-4 text-blue-500" /> 
          }
        ];
        
      case 'WORK_ORDER':
        return [
          { 
            value: 'NEW', 
            label: 'New', 
            icon: <ArrowUpRight className="h-4 w-4 text-purple-500" /> 
          },
          { 
            value: 'IN_PROGRESS', 
            label: 'In Progress', 
            icon: <Play className="h-4 w-4 text-emerald-500" /> 
          },
          { 
            value: 'ON_HOLD', 
            label: 'On Hold', 
            icon: <Pause className="h-4 w-4 text-amber-500" /> 
          },
          { 
            value: 'COMPLETED', 
            label: 'Completed', 
            icon: <Check className="h-4 w-4 text-green-500" /> 
          },
          { 
            value: 'CANCELLED', 
            label: 'Cancelled', 
            icon: <X className="h-4 w-4 text-red-500" /> 
          }
        ];
        
      case 'CHANGE_ORDER':
        return [
          { 
            value: 'DRAFT', 
            label: 'Draft', 
            icon: <AlertCircle className="h-4 w-4 text-gray-500" /> 
          },
          { 
            value: 'SUBMITTED', 
            label: 'Submitted', 
            icon: <ArrowUpRight className="h-4 w-4 text-blue-500" /> 
          },
          { 
            value: 'REVIEW', 
            label: 'In Review', 
            icon: <Clock className="h-4 w-4 text-amber-500" /> 
          },
          { 
            value: 'APPROVED', 
            label: 'Approved', 
            icon: <Check className="h-4 w-4 text-green-500" /> 
          },
          { 
            value: 'REJECTED', 
            label: 'Rejected', 
            icon: <X className="h-4 w-4 text-red-500" /> 
          },
          { 
            value: 'IMPLEMENTED', 
            label: 'Implemented', 
            icon: <Play className="h-4 w-4 text-emerald-500" /> 
          },
          { 
            value: 'CANCELLED', 
            label: 'Cancelled', 
            icon: <X className="h-4 w-4 text-red-500" /> 
          }
        ];
        
      case 'CONTACT':
        return [
          { value: 'ACTIVE', label: 'Active', icon: <Play className="h-4 w-4 text-emerald-500" /> },
          { value: 'INACTIVE', label: 'Inactive', icon: <Pause className="h-4 w-4 text-amber-500" /> },
          { value: 'PROSPECT', label: 'Prospect', icon: <ArrowUpRight className="h-4 w-4 text-blue-500" /> },
          { value: 'QUALIFIED', label: 'Qualified', icon: <Check className="h-4 w-4 text-green-500" /> },
          { value: 'PENDING', label: 'Pending', icon: <Clock className="h-4 w-4 text-amber-500" /> },
          { value: 'APPROVED', label: 'Approved', icon: <Check className="h-4 w-4 text-green-500" /> },
          { value: 'POTENTIAL', label: 'Potential', icon: <AlertCircle className="h-4 w-4 text-blue-500" /> }
        ];
      
      case 'VENDOR':
        return [
          { value: 'POTENTIAL', label: 'Potential', icon: <AlertCircle className="h-4 w-4 text-blue-500" /> },
          { value: 'APPROVED', label: 'Approved', icon: <Check className="h-4 w-4 text-green-500" /> },
          { value: 'ACTIVE', label: 'Active', icon: <Play className="h-4 w-4 text-emerald-500" /> },
          { value: 'INACTIVE', label: 'Inactive', icon: <Pause className="h-4 w-4 text-amber-500" /> }
        ];
        
      default:
        return [];
    }
  };
  
  // If currentStatus is provided, filter out that status from options
  const filteredOptions = currentStatus 
    ? statusOptions.filter(option => option.value.toLowerCase() !== currentStatus.toLowerCase())
    : statusOptions;
  
  return {
    statusOptions: filteredOptions,
    allStatusOptions: statusOptions
  };
}
