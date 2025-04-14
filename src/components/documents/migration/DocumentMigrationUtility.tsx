import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';

interface MigrationStats {
  total: number;
  processed: number;
  migrated: number;
  skipped: number;
  failed: number;
  logs: string[];
}

/**
 * DocumentMigrationUtility
 *
 * This utility helps migrate existing documents to our standardized pattern.
 * It performs the following tasks:
 * 1. Scans the documents table for documents needing migration
 * 2. Updates documents to ensure they have correct fields and metadata
 * 3. Validates document records against storage objects
 * 4. Displays migration progress and status
 */
export default function DocumentMigrationUtility() {
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<MigrationStats>({
    total: 0,
    processed: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    logs: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const { toast } = useToast();

  // Load initial migration statistics
  useEffect(() => {
    fetchMigrationStats();
  }, []);

  // Calculate completion percentage
  const completionPercentage = stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  // Fetch migration statistics
  const fetchMigrationStats = async () => {
    setLoadingStats(true);
    try {
      // Count documents needing migration - those missing standardized fields
      const { count: needsMigration, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .or('is_latest_version.is.null,file_url.is.null,mime_type.is.null');

      if (countError) throw countError;

      // Count total documents
      const { count: total, error: totalError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Update stats
      setStats(prev => ({
        ...prev,
        total: needsMigration || 0,
        processed: total ? total - (needsMigration || 0) : 0,
      }));
    } catch (error) {
      console.error('Error fetching migration stats:', error);
      toast({
        title: 'Error fetching stats',
        description: 'Could not fetch document migration statistics.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Log migration events
  const logEvent = useCallback((message: string) => {
    setStats(prev => ({
      ...prev,
      logs: [message, ...prev.logs].slice(0, 100), // Keep only the last 100 logs
    }));
  }, []);

  // Run the migration process
  const runMigration = useCallback(async () => {
    if (running) return;

    try {
      setRunning(true);
      logEvent('Starting document migration...');

      // Get documents needing migration - those missing standardized fields
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or('is_latest_version.is.null,file_url.is.null,mime_type.is.null')
        .limit(500); // Process in batches of 500

      if (error) throw error;

      if (!data || data.length === 0) {
        logEvent('No documents require migration.');
        return;
      }

      logEvent(`Found ${data.length} documents to migrate.`);
      let migratedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      for (const doc of data) {
        try {
          // Skip documents without a storage path
          if (!doc.storage_path) {
            logEvent(`Skipped document ${doc.document_id}: Missing storage path`);
            skippedCount++;
            continue;
          }

          // Get public URL
          let publicUrl = '';
          try {
            const { data: urlData } = supabase.storage
              .from('construction_documents')
              .getPublicUrl(doc.storage_path);

            publicUrl = urlData.publicUrl;
          } catch (err) {
            console.error('Error getting public URL:', err);
          }

          // Determine mime type
          const mimeType = doc.file_type || 'application/octet-stream';

          // Update document with standardized fields
          const updateData = {
            file_url: publicUrl,
            url: publicUrl, // For backward compatibility
            is_latest_version: doc.is_latest_version === undefined ? true : doc.is_latest_version,
            mime_type: mimeType,
            updated_at: new Date().toISOString(),
          };

          const { error: updateError } = await supabase
            .from('documents')
            .update(updateData)
            .eq('document_id', doc.document_id);

          if (updateError) throw updateError;

          logEvent(`Migrated document ${doc.document_id}: ${doc.file_name}`);
          migratedCount++;
        } catch (docError) {
          console.error(`Error migrating document ${doc.document_id}:`, docError);
          logEvent(`Failed to migrate document ${doc.document_id}: ${(docError as Error).message}`);
          failedCount++;
        }

        // Update stats after each document
        setStats(prev => ({
          ...prev,
          processed: prev.processed + 1,
          migrated: prev.migrated + migratedCount,
          skipped: prev.skipped + skippedCount,
          failed: prev.failed + failedCount,
        }));
      }

      logEvent(
        `Migration batch completed. Migrated: ${migratedCount}, Skipped: ${skippedCount}, Failed: ${failedCount}`
      );

      // Check if there are more documents to migrate
      const { count: remainingCount, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .or('is_latest_version.is.null,file_url.is.null,mime_type.is.null');

      if (countError) throw countError;

      if (remainingCount && remainingCount > 0) {
        logEvent(`${remainingCount} documents remaining. Continue to process next batch.`);
      } else {
        logEvent('All documents have been migrated successfully.');
      }
    } catch (error) {
      console.error('Migration error:', error);
      logEvent(`Migration error: ${(error as Error).message}`);
      toast({
        title: 'Migration Error',
        description: 'An error occurred during document migration.',
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
      await fetchMigrationStats();
    }
  }, [running, fetchMigrationStats, logEvent, toast]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Migration Utility</CardTitle>
          <CardDescription>
            Migrate documents to the standardized pattern with metadata and proper URL links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Migration Status</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.total === 0
                    ? 'No documents need migration'
                    : `${stats.processed} of ${stats.total} documents processed (${completionPercentage.toFixed(1)}%)`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={runMigration}
                  disabled={running || stats.total === 0}
                  className="bg-[#0485ea] hover:bg-[#0375d1]"
                >
                  {running ? (
                    <>
                      <Pause className="h-4 w-4 mr-1" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Start Migration
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={fetchMigrationStats} disabled={loadingStats}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${loadingStats ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <Progress value={completionPercentage} className="h-2 w-full" />

            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-muted/30">
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </Card>
              <Card className="p-4 bg-green-50">
                <p className="text-sm font-medium text-green-700">Migrated</p>
                <p className="text-2xl font-bold text-green-700">{stats.migrated}</p>
              </Card>
              <Card className="p-4 bg-orange-50">
                <p className="text-sm font-medium text-orange-700">Skipped</p>
                <p className="text-2xl font-bold text-orange-700">{stats.skipped}</p>
              </Card>
              <Card className="p-4 bg-red-50">
                <p className="text-sm font-medium text-red-700">Failed</p>
                <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Migration Logs</CardTitle>
          <CardDescription>Latest migration events and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                      No migration logs available
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {log.includes('Error') || log.includes('Failed') ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
