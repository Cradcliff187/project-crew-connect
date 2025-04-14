import { useState, useEffect } from 'react';
import { statusOptions } from '@/components/projects/ProjectConstants';

export const useStatusTransitions = (projectId: string, currentStatus: string) => {
  const [allowedTransitions, setAllowedTransitions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransitions = async () => {
    if (!projectId || !currentStatus) {
      setAllowedTransitions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(
        `Fetching all possible statuses for project: ${projectId}, current status: ${currentStatus}`
      );

      // Instead of fetching transitions from the database,
      // we now return all statuses except the current one
      const normalizedCurrentStatus = currentStatus.toLowerCase();

      // Get all statuses except the current one
      const allPossibleTransitions = statusOptions
        .filter(option => option.value.toLowerCase() !== normalizedCurrentStatus)
        .map(option => option.value);

      setAllowedTransitions(allPossibleTransitions);
      console.log('Available statuses:', allPossibleTransitions);
    } catch (err: any) {
      console.error('Error in transition handling:', err);
      // Fallback to all statuses except current
      const normalizedStatus = currentStatus.toLowerCase();
      const allStatusesExceptCurrent = statusOptions
        .filter(option => option.value.toLowerCase() !== normalizedStatus)
        .map(option => option.value);

      setAllowedTransitions(allStatusesExceptCurrent);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransitions();
  }, [projectId, currentStatus]);

  return {
    allowedTransitions,
    loading,
    error,
    refreshTransitions: fetchTransitions,
  };
};
