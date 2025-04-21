import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { convertEstimateToProject } from '@/services/estimateService';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RevisionType {
  id: string;
  estimate_id: string;
  version: number;
  is_selected_for_view: boolean;
  status?: string;
  revision_date: string;
  total?: number;
}

interface EstimateRevisionListProps {
  revisions: RevisionType[];
  estimateId: string;
  projectId?: string;
  convertedRevisionId?: string;
  onRefresh?: () => void;
}

const EstimateRevisionList: React.FC<EstimateRevisionListProps> = ({
  revisions,
  estimateId,
  projectId,
  convertedRevisionId,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [convertingRevisions, setConvertingRevisions] = useState<Record<string, boolean>>({});

  const handleConvertToProject = async (revisionId: string, version: number) => {
    // Mark this revision as converting
    setConvertingRevisions(prev => ({ ...prev, [revisionId]: true }));

    try {
      // Call the enhanced service function with the specific revision ID
      const result = await convertEstimateToProject(estimateId, revisionId);

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Estimate revision v${version} converted to project ${result.projectId}`,
          variant: 'success',
          duration: 5000,
        });

        // Refresh data if needed
        if (onRefresh) onRefresh();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to convert revision to project',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Error converting revision to project:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      // Unmark this revision as converting
      setConvertingRevisions(prev => ({ ...prev, [revisionId]: false }));
    }
  };

  // Sort revisions by version (highest first)
  const sortedRevisions = [...revisions].sort((a, b) => b.version - a.version);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Estimate Revisions</h3>

      {sortedRevisions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No revisions found</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sortedRevisions.map(revision => {
            const isConverted = convertedRevisionId === revision.id;
            const isConverting = convertingRevisions[revision.id];

            return (
              <Card key={revision.id} className={isConverted ? 'border-green-500' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">Version {revision.version}</CardTitle>
                    <div className="flex gap-2">
                      {revision.is_selected_for_view && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800">
                          Selected View
                        </Badge>
                      )}
                      {isConverted && (
                        <Badge variant="outline" className="bg-green-50 text-green-800">
                          Converted
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>Created: {formatDate(revision.revision_date)}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> {revision.status}
                  </p>
                  {revision.total !== undefined && (
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> ${revision.total.toFixed(2)}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    size="sm"
                    className={
                      isConverted
                        ? 'w-full bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
                        : 'w-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:text-blue-700'
                    }
                    variant="outline"
                    disabled={isConverting || !!projectId || isConverted}
                    onClick={() => handleConvertToProject(revision.id, revision.version)}
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : isConverted ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Converted to Project
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Convert to Project
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EstimateRevisionList;
