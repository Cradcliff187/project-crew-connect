import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface EstimateDiagnosticToolProps {
  estimateId: string;
  onRefresh?: () => void;
}

const EstimateDiagnosticTool: React.FC<EstimateDiagnosticToolProps> = ({ estimateId, onRefresh }) => {
  const [diagnosticResults, setDiagnosticResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Function to run diagnostics
  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any[] = [];

    try {
      // Fetch the estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimateId)
        .single();

      if (estimateError) {
        results.push({
          test: 'Fetch Estimate',
          status: 'error',
          message: `Could not fetch estimate: ${estimateError.message}`,
        });
      } else {
        results.push({
          test: 'Fetch Estimate',
          status: 'success',
          message: 'Successfully fetched estimate data',
        });

        // Check for description fields
        // Note: Fix the field names, using square bracket notation for fields with spaces
        const fieldDescriptionMissing = !estimate['job description'];

        if (fieldDescriptionMissing) {
          results.push({
            test: 'Description',
            status: 'warning',
            message: 'No description found for this estimate',
          });
        } else {
          results.push({
            test: 'Description',
            status: 'success',
            message: 'Description found',
          });
        }

        // Check if there's a current revision
        const { data: revisions, error: revisionsError } = await supabase
          .from('estimate_revisions')
          .select('*')
          .eq('estimate_id', estimateId)
          .eq('is_current', true);

        if (revisionsError || !revisions || revisions.length === 0) {
          results.push({
            test: 'Current Revision',
            status: 'error',
            message: 'No current revision found for this estimate',
          });
        } else {
          results.push({
            test: 'Current Revision',
            status: 'success',
            message: `Found current revision: Version ${revisions[0].version}`,
          });

          // Check for items in the current revision
          const currentRevisionId = revisions[0].id;
          const { data: items, error: itemsError } = await supabase
            .from('estimate_items')
            .select('*')
            .eq('revision_id', currentRevisionId);

          if (itemsError) {
            results.push({
              test: 'Revision Items',
              status: 'error',
              message: `Could not fetch revision items: ${itemsError.message}`,
            });
          } else if (!items || items.length === 0) {
            results.push({
              test: 'Revision Items',
              status: 'warning',
              message: 'No items found in the current revision',
            });
          } else {
            results.push({
              test: 'Revision Items',
              status: 'success',
              message: `Found ${items.length} items in the current revision`,
            });
          }
        }

        // Check documents
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('*')
          .eq('entity_type', 'ESTIMATE')
          .eq('entity_id', estimateId);

        if (documentsError) {
          results.push({
            test: 'Documents',
            status: 'error',
            message: `Could not fetch documents: ${documentsError.message}`,
          });
        } else if (!documents || documents.length === 0) {
          results.push({
            test: 'Documents',
            status: 'warning',
            message: 'No documents found for this estimate',
          });
        } else {
          results.push({
            test: 'Documents',
            status: 'success',
            message: `Found ${documents.length} documents attached to this estimate`,
          });
        }
      }
    } catch (error: any) {
      results.push({
        test: 'General',
        status: 'error',
        message: `An unexpected error occurred: ${error.message}`,
      });
    } finally {
      setDiagnosticResults(results);
      setIsRunning(false);
    }
  };

  // Run diagnostics on load
  useEffect(() => {
    runDiagnostics();
  }, [estimateId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Estimate Diagnostics</CardTitle>
        <Button
          onClick={() => {
            runDiagnostics();
            if (onRefresh) onRefresh();
          }}
          size="sm"
          variant="outline"
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {diagnosticResults.length > 0 ? (
            diagnosticResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center p-2 rounded ${
                  result.status === 'error'
                    ? 'bg-red-50 text-red-800'
                    : result.status === 'warning'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                {result.status === 'error' ? (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                ) : result.status === 'warning' ? (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                <span className="text-sm font-medium">{result.test}: </span>
                <span className="text-sm ml-1">{result.message}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">Running diagnostics...</div>
          )}

          <div className="mt-4">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="link"
              size="sm"
              className="p-0 h-auto font-normal text-xs flex items-center"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>

          {showDetails && (
            <div className="mt-2 text-xs bg-slate-50 p-3 rounded">
              <div>
                <strong>Estimate ID:</strong> {estimateId}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EstimateDiagnosticTool;
