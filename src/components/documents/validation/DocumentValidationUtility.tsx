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
import { CheckCircle, AlertCircle, Play, Pause, RefreshCw, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ValidationIssue {
  document_id: string;
  file_name: string;
  issue_type: 'missing_file' | 'invalid_url' | 'invalid_metadata' | 'orphaned_file';
  entity_type: string;
  entity_id: string;
  details: string;
  storage_path?: string;
}

interface ValidationStats {
  total_documents: number;
  processed: number;
  valid: number;
  invalid: number;
  issues: ValidationIssue[];
  logs: string[];
}

/**
 * DocumentValidationUtility
 *
 * This utility validates documents in the system to ensure they:
 * 1. Have valid storage paths
 * 2. Have accessible URLs
 * 3. Have correct metadata
 * 4. Have proper relationships to their entities
 */
export default function DocumentValidationUtility() {
  const [running, setRunning] = useState(false);
  const [stats, setStats] = useState<ValidationStats>({
    total_documents: 0,
    processed: 0,
    valid: 0,
    invalid: 0,
    issues: [],
    logs: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const { toast } = useToast();

  // Load initial validation statistics
  useEffect(() => {
    fetchValidationStats();
  }, []);

  // Calculate completion percentage
  const completionPercentage =
    stats.total_documents > 0 ? (stats.processed / stats.total_documents) * 100 : 0;

  // Fetch validation statistics
  const fetchValidationStats = async () => {
    setLoadingStats(true);
    try {
      // Count total documents
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      // Update stats
      setStats(prev => ({
        ...prev,
        total_documents: count || 0,
      }));
    } catch (error) {
      console.error('Error fetching validation stats:', error);
      toast({
        title: 'Error fetching stats',
        description: 'Could not fetch document validation statistics.',
        variant: 'destructive',
      });
    } finally {
      setLoadingStats(false);
    }
  };

  // Log validation events
  const logEvent = useCallback((message: string) => {
    setStats(prev => ({
      ...prev,
      logs: [message, ...prev.logs].slice(0, 100), // Keep only the last 100 logs
    }));
  }, []);

  // Add a validation issue
  const addIssue = useCallback((issue: ValidationIssue) => {
    setStats(prev => ({
      ...prev,
      issues: [...prev.issues, issue].slice(0, 1000), // Limit to 1000 issues
      invalid: prev.invalid + 1,
    }));
  }, []);

  // Run the validation process
  const runValidation = useCallback(async () => {
    if (running) return;

    try {
      setRunning(true);
      logEvent('Starting document validation...');

      // Reset validation stats
      setStats(prev => ({
        ...prev,
        processed: 0,
        valid: 0,
        invalid: 0,
        issues: [],
      }));

      // Get a batch of documents to validate
      const { data, error } = await supabase.from('documents').select('*').limit(500); // Process in batches

      if (error) throw error;

      if (!data || data.length === 0) {
        logEvent('No documents to validate.');
        return;
      }

      logEvent(`Validating ${data.length} documents...`);

      // Validate each document
      for (const doc of data) {
        try {
          let isValid = true;

          // 1. Check for missing storage path
          if (!doc.storage_path) {
            addIssue({
              document_id: doc.document_id,
              file_name: doc.file_name,
              issue_type: 'invalid_metadata',
              entity_type: doc.entity_type,
              entity_id: doc.entity_id,
              details: 'Document record missing storage path',
            });
            isValid = false;
          } else {
            // 2. Validate that the file exists in storage
            try {
              const { data: fileData, error: fileError } = await supabase.storage
                .from('construction_documents')
                .download(doc.storage_path);

              if (fileError) {
                addIssue({
                  document_id: doc.document_id,
                  file_name: doc.file_name,
                  issue_type: 'missing_file',
                  entity_type: doc.entity_type,
                  entity_id: doc.entity_id,
                  details: 'File not found in storage',
                  storage_path: doc.storage_path,
                });
                isValid = false;
              }
            } catch (storageError) {
              console.error(`Storage error for document ${doc.document_id}:`, storageError);
              addIssue({
                document_id: doc.document_id,
                file_name: doc.file_name,
                issue_type: 'missing_file',
                entity_type: doc.entity_type,
                entity_id: doc.entity_id,
                details: `Storage error: ${(storageError as Error).message}`,
                storage_path: doc.storage_path,
              });
              isValid = false;
            }
          }

          // 3. Check for missing URL
          if (!doc.file_url) {
            addIssue({
              document_id: doc.document_id,
              file_name: doc.file_name,
              issue_type: 'invalid_url',
              entity_type: doc.entity_type,
              entity_id: doc.entity_id,
              details: 'Document record missing file URL',
              storage_path: doc.storage_path,
            });
            isValid = false;
          }

          // 4. Check for entity reference
          if (!doc.entity_type || !doc.entity_id) {
            addIssue({
              document_id: doc.document_id,
              file_name: doc.file_name,
              issue_type: 'invalid_metadata',
              entity_type: doc.entity_type || 'UNKNOWN',
              entity_id: doc.entity_id || 'UNKNOWN',
              details: 'Missing entity reference',
              storage_path: doc.storage_path,
            });
            isValid = false;
          }

          // Update validation stat
          if (isValid) {
            setStats(prev => ({ ...prev, valid: prev.valid + 1 }));
          }

          // Increment processed count
          setStats(prev => ({ ...prev, processed: prev.processed + 1 }));
        } catch (docError) {
          console.error(`Error validating document ${doc.document_id}:`, docError);
          logEvent(
            `Validation error for document ${doc.document_id}: ${(docError as Error).message}`
          );
        }
      }

      logEvent(`Validation completed. Valid: ${stats.valid}, Invalid: ${stats.invalid}`);
    } catch (error) {
      console.error('Validation error:', error);
      logEvent(`Validation error: ${(error as Error).message}`);
      toast({
        title: 'Validation Error',
        description: 'An error occurred during document validation.',
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
    }
  }, [running, addIssue, logEvent, stats.valid, stats.invalid, toast]);

  // Export validation issues to CSV
  const exportIssues = useCallback(() => {
    if (stats.issues.length === 0) {
      toast({
        title: 'No issues to export',
        description: 'There are no validation issues to export.',
      });
      return;
    }

    // Create CSV content
    const headers = [
      'Document ID',
      'File Name',
      'Issue Type',
      'Entity Type',
      'Entity ID',
      'Details',
      'Storage Path',
    ];
    const csvRows = [headers];

    stats.issues.forEach(issue => {
      csvRows.push([
        issue.document_id,
        issue.file_name,
        issue.issue_type,
        issue.entity_type,
        issue.entity_id,
        issue.details,
        issue.storage_path || '',
      ]);
    });

    const csvContent = csvRows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `document-validation-issues-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export successful',
      description: `Exported ${stats.issues.length} validation issues to CSV.`,
    });
  }, [stats.issues, toast]);

  // Get issue type badge color
  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'missing_file':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'invalid_url':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'invalid_metadata':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'orphaned_file':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Document Validation Utility</CardTitle>
          <CardDescription>
            Validate documents to ensure they have proper storage paths, URLs, and metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Validation Status</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.processed === 0
                    ? `${stats.total_documents} documents ready for validation`
                    : `${stats.processed} of ${stats.total_documents} documents validated (${completionPercentage.toFixed(1)}%)`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={runValidation}
                  disabled={running || stats.total_documents === 0}
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
                      Start Validation
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={fetchValidationStats} disabled={loadingStats}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${loadingStats ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <Progress value={completionPercentage} className="h-2 w-full" />

            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4 bg-muted/30">
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold">{stats.total_documents}</p>
              </Card>
              <Card className="p-4 bg-muted/30">
                <p className="text-sm font-medium">Processed</p>
                <p className="text-2xl font-bold">{stats.processed}</p>
              </Card>
              <Card className="p-4 bg-green-50">
                <p className="text-sm font-medium text-green-700">Valid</p>
                <p className="text-2xl font-bold text-green-700">{stats.valid}</p>
              </Card>
              <Card className="p-4 bg-red-50">
                <p className="text-sm font-medium text-red-700">Invalid</p>
                <p className="text-2xl font-bold text-red-700">{stats.invalid}</p>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="issues">
        <TabsList className="mb-2">
          <TabsTrigger value="issues">Validation Issues ({stats.issues.length})</TabsTrigger>
          <TabsTrigger value="logs">Validation Logs ({stats.logs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Document Issues</CardTitle>
                <CardDescription>
                  Documents with validation issues that need attention
                </CardDescription>
              </div>
              {stats.issues.length > 0 && (
                <Button variant="outline" onClick={exportIssues}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Issues
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Issue Type</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.issues.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No validation issues found
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.issues.map((issue, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{issue.file_name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`${getIssueTypeColor(issue.issue_type)}`}
                            >
                              {issue.issue_type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {issue.entity_type}/{issue.entity_id}
                          </TableCell>
                          <TableCell>{issue.details}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Validation Logs</CardTitle>
              <CardDescription>Latest validation events and activities</CardDescription>
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
                          No validation logs available
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.logs.map((log, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {log.includes('Error') || log.includes('failed') ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
