
import { Plus, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EstimateForm from './EstimateForm';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface EstimatesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onEstimateAdded: () => void;
}

const EstimatesHeader = ({ searchQuery, setSearchQuery, onEstimateAdded }: EstimatesHeaderProps) => {
  const [estimateFormOpen, setEstimateFormOpen] = useState(false);

  const openEstimateForm = () => {
    setEstimateFormOpen(true);
  };

  const closeEstimateForm = () => {
    setEstimateFormOpen(false);
    onEstimateAdded();
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold tracking-tight">Estimates</h1>
      <div className="flex items-center space-x-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search estimates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Link to="/estimates/settings">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Email Settings
          </Button>
        </Link>
        
        <Button onClick={openEstimateForm} className="bg-[#0485ea] hover:bg-[#0373ce]">
          <Plus className="h-4 w-4 mr-1" />
          New Estimate
        </Button>
      </div>

      <EstimateForm open={estimateFormOpen} onClose={closeEstimateForm} />
    </div>
  );
};

export default EstimatesHeader;
