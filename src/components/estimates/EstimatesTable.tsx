
import { FileText, Plus, Eye, Edit, Copy, ArrowRight, Download, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/ui/StatusBadge';
import { StatusType } from '@/types/common';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

export type EstimateType = {
  id: string;
  client: string;
  project: string;
  date: string;
  amount: number;
  status: StatusType | string;
  versions: number;
  description?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

interface EstimatesTableProps {
  estimates: EstimateType[];
  loading: boolean;
  searchQuery: string;
  onViewEstimate: (estimate: EstimateType) => void;
  formatDate: (dateString: string) => string;
}

const EstimatesTable = ({ 
  estimates, 
  loading, 
  searchQuery, 
  onViewEstimate,
  formatDate
}: EstimatesTableProps) => {
  const filteredEstimates = estimates.filter(estimate => 
    estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getEstimateActions = (estimate: EstimateType): ActionGroup[] => {
    return [
      {
        items: [
          {
            label: 'View details',
            icon: <Eye className="w-4 h-4" />,
            onClick: (e) => onViewEstimate(estimate)
          },
          {
            label: 'Edit estimate',
            icon: <Edit className="w-4 h-4" />,
            onClick: (e) => console.log('Edit estimate', estimate.id)
          },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: (e) => console.log('Duplicate estimate', estimate.id)
          },
          {
            label: 'Create new version',
            icon: <Plus className="w-4 h-4" />,
            onClick: (e) => console.log('Create new version', estimate.id)
          }
        ]
      },
      {
        items: [
          {
            label: 'Convert to project',
            icon: <ArrowRight className="w-4 h-4" />,
            onClick: (e) => console.log('Convert to project', estimate.id)
          },
          {
            label: 'Download PDF',
            icon: <Download className="w-4 h-4" />,
            onClick: (e) => console.log('Download PDF', estimate.id)
          }
        ]
      },
      {
        items: [
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (e) => console.log('Delete estimate', estimate.id),
            className: 'text-red-600'
          }
        ]
      }
    ];
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm animate-in" style={{ animationDelay: '0.2s' }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estimate #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Versions</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-6" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))
          ) : filteredEstimates.length > 0 ? (
            filteredEstimates.map((estimate) => (
              <TableRow key={estimate.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onViewEstimate(estimate)}>
                <TableCell className="font-medium">{estimate.id}</TableCell>
                <TableCell>{estimate.client}</TableCell>
                <TableCell>{estimate.project}</TableCell>
                <TableCell>{formatDate(estimate.date)}</TableCell>
                <TableCell>${estimate.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={estimate.status as StatusType} />
                </TableCell>
                <TableCell>{estimate.versions}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ActionMenu groups={getEstimateActions(estimate)} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                <p>No estimates found. Create your first estimate!</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EstimatesTable;
