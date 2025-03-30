
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusIcon, SearchIcon } from 'lucide-react';
import EstimateForm from './EstimateForm';
import EstimateMultiStepForm from './EstimateMultiStepForm';
import { useLocalStorage } from '@/hooks/use-local-storage';
import EstimateSettingsButton from './EstimateSettingsButton';

interface EstimatesHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onEstimateAdded: () => void;
}

const EstimatesHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  onEstimateAdded 
}: EstimatesHeaderProps) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [useMultiStepForm] = useLocalStorage('use-multistep-estimate-form', false);
  
  const handleClose = () => {
    setOpenAddDialog(false);
    onEstimateAdded(); // Refresh the estimates list
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Estimates</h1>
        <p className="text-muted-foreground mt-1">
          Create and manage customer estimates
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-xs">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search estimates..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <EstimateSettingsButton />
          <Button 
            onClick={() => setOpenAddDialog(true)}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Estimate
          </Button>
        </div>
      </div>
      
      {useMultiStepForm ? (
        <EstimateMultiStepForm 
          open={openAddDialog} 
          onClose={handleClose} 
        />
      ) : (
        <EstimateForm 
          open={openAddDialog} 
          onClose={handleClose} 
        />
      )}
    </div>
  );
};

export default EstimatesHeader;
