import { Table, TableBody } from '@/components/ui/table';
import { StatusType } from '@/types/common';
import EstimateTableHeader from './components/EstimateTableHeader';
import EstimateRow from './components/EstimateRow';
import EstimateEmptyState from './components/EstimateEmptyState';
import EstimateLoadingState from './components/EstimateLoadingState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
  error?: string | null;
  searchQuery: string;
  onViewEstimate: (estimate: EstimateType) => void;
  formatDate: (dateString: string) => string;
  onRefreshEstimates?: () => void;
}

const EstimatesTable = ({
  estimates,
  loading,
  error,
  searchQuery,
  onViewEstimate,
  formatDate,
  onRefreshEstimates,
}: EstimatesTableProps) => {
  const filteredEstimates = estimates.filter(
    estimate =>
      estimate.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load estimates: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm animate-in">
      <Table>
        <EstimateTableHeader />
        <TableBody>
          {loading ? (
            <EstimateLoadingState />
          ) : filteredEstimates.length > 0 ? (
            filteredEstimates.map(estimate => (
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
