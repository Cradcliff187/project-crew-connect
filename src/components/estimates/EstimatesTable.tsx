
import { Table, TableBody } from '@/components/ui/table';
import { StatusType } from '@/types/common';
import EstimateTableHeader from './components/EstimateTableHeader';
import EstimateRow from './components/EstimateRow';
import EstimateEmptyState from './components/EstimateEmptyState';
import EstimateLoadingState from './components/EstimateLoadingState';

export type EstimateType = {
  id: string;
  customerId: string;
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
  onRefreshEstimates?: () => void;
}

const EstimatesTable = ({ 
  estimates, 
  loading, 
  searchQuery, 
  onViewEstimate,
  formatDate,
  onRefreshEstimates
}: EstimatesTableProps) => {
  const filteredEstimates = estimates.filter(estimate => 
    estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    estimate.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="bg-white border rounded-lg shadow-sm animate-in">
      <Table>
        <EstimateTableHeader />
        <TableBody>
          {loading ? (
            <EstimateLoadingState />
          ) : filteredEstimates.length > 0 ? (
            filteredEstimates.map((estimate) => (
              <EstimateRow 
                key={estimate.id}
                estimate={estimate}
                onViewEstimate={onViewEstimate}
                onRefreshEstimates={onRefreshEstimates}
              />
            ))
          ) : (
            <EstimateEmptyState />
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EstimatesTable;
