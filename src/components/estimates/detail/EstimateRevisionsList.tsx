import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileUp, Download, Check, Eye, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EstimateRevision } from '../types/estimateTypes';
import EstimateRevisionDialog from './dialogs/EstimateRevisionDialog';
import { formatCurrency, formatDate } from '@/lib/utils';

interface EstimateRevisionsListProps {
  estimateId: string;
  revisions: EstimateRevision[];
  onRefresh?: () => void;
  clientName?: string;
}

const EstimateRevisionsList: React.FC<EstimateRevisionsListProps> = ({
  estimateId,
  revisions: initialRevisions,
  onRefresh,
  clientName,
}) => {
  const [revisions, setRevisions] = useState<EstimateRevision[]>(initialRevisions);
  const [loading, setLoading] = useState(true);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchRevisions();
  }, [estimateId]);

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId)
        .order('version', { ascending: false });

      if (error) {
        throw error;
      }

      setRevisions(data || []);

      // Find current version
      const currentRevision = data?.find(rev => rev.is_current);
      if (currentRevision) {
        setCurrentVersion(currentRevision.version);
      } else if (data && data.length > 0) {
        setCurrentVersion(data[0].version);
      }
    } catch (error: any) {
      console.error('Error fetching revisions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revisions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRevision = () => {
    setRevisionDialogOpen(true);
  };

  const handleSetAsCurrent = async (revisionId: string) => {
    try {
      // First, set all revisions to not current
      await supabase
        .from('estimate_revisions')
        .update({ is_current: false })
        .eq('estimate_id', estimateId);

      // Then set the selected revision as current
      const { error } = await supabase
        .from('estimate_revisions')
        .update({ is_current: true })
        .eq('id', revisionId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Current revision updated',
      });

      fetchRevisions();
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error setting current revision:', error);
      toast({
        title: 'Error',
        description: 'Failed to update current revision',
        variant: 'destructive',
      });
    }
  };

  const handleRevisionSuccess = () => {
    fetchRevisions();
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Revisions History</CardTitle>
          <Button onClick={handleCreateRevision} className="bg-[#0485ea] hover:bg-[#0373ce]">
            <FileUp className="h-4 w-4 mr-2" />
            Create Revision
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Current</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading revisions...
                  </TableCell>
                </TableRow>
              ) : revisions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No revisions found. Create your first revision.
                  </TableCell>
                </TableRow>
              ) : (
                revisions.map(revision => (
                  <TableRow key={revision.id}>
                    <TableCell className="font-medium">Version {revision.version}</TableCell>
                    <TableCell>{formatDate(revision.revision_date)}</TableCell>
                    <TableCell>
                      <Badge variant={revision.status === 'approved' ? 'default' : 'outline'}>
                        {revision.status || 'draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(revision.amount || 0)}</TableCell>
                    <TableCell className="max-w-xs truncate">{revision.notes || '-'}</TableCell>
                    <TableCell>
                      {revision.is_current ? (
                        <Badge className="bg-green-500">
                          <Check className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetAsCurrent(revision.id)}
                        >
                          <Star className="h-4 w-4 text-gray-400" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EstimateRevisionDialog
        open={revisionDialogOpen}
        onOpenChange={setRevisionDialogOpen}
        estimateId={estimateId}
        currentVersion={currentVersion}
        onSuccess={handleRevisionSuccess}
      />
    </div>
  );
};

export default EstimateRevisionsList;
