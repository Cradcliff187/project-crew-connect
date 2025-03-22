
import { useState } from 'react';

export const useWorkOrderDocumentsEmbed = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return {
    refreshTrigger,
    handleRefresh
  };
};
