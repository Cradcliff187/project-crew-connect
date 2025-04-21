import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ArrowRightCircle,
  ChevronDown,
  ChevronUp,
  LineChart,
  FileUp,
  Download,
  ListIcon,
  LayoutIcon,
  ArrowRight,
  Loader2,
  GitCompareArrows,
  GitBranch,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EstimateRevision } from '../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import PDFExportButton from '../detail/PDFExportButton';
import RevisionPDFViewer from '../components/RevisionPDFViewer';
import EstimateRevisionList from '../detail/EstimateRevisionList';
import { convertEstimateToProject } from '@/services/estimateService';
import { compareEstimateRevisions } from '@/services/estimateService';
import { RevisionComparisonResult, EstimateItem } from '../types/estimateTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import RevisionComparisonView from '../detail/RevisionComparisonView';
import EstimateRevisionDialog from '../detail/dialogs/EstimateRevisionDialog';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';
import usePdfGeneration from '../hooks/usePdfGeneration';

interface EstimateRevisionsTabProps {
  estimateId: string;
  revisions: EstimateRevision[];
  currentRevisionId?: string;
  onRevisionSelect: (revisionId: string) => void;
  projectId?: string;
  convertedRevisionId?: string;
  onRefresh?: () => void;
  contingencyPercentage?: number | null;
}

const EstimateRevisionsTab: React.FC<EstimateRevisionsTabProps> = ({
  estimateId,
  revisions,
  currentRevisionId,
  onRevisionSelect,
  projectId,
  convertedRevisionId,
  onRefresh,
  contingencyPercentage,
}) => {
  const [expandedRevision, setExpandedRevision] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'timeline' | 'table' | 'grid'>('table'); // Added grid view
  const [revisionItemsMap, setRevisionItemsMap] = useState<Record<string, EstimateItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [convertingRevisions, setConvertingRevisions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  // DEBUG: Log the revisions prop as received by the component
  console.log('[DEBUG RevisionsTab Prop] Received revisions:', revisions);

  // State for comparison
  const [compareRevisionAId, setCompareRevisionAId] = useState<string | null>(null);
  const [compareRevisionBId, setCompareRevisionBId] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<RevisionComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);

  // State for opening revision dialog from specific source
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [sourceRevisionForDialog, setSourceRevisionForDialog] = useState<EstimateRevision | null>(
    null
  );
  const [highestVersion, setHighestVersion] = useState(1);

  // Instantiate PDF generation hook
  const {
    generatePdf,
    isGenerating,
    error: pdfError,
  } = usePdfGeneration({
    onSuccess: docId => {
      toast({ title: 'PDF Generated', description: `Document ${docId} created.` });
      // Optionally refresh data if needed
      if (onRefresh) onRefresh();
    },
    onError: err => {
      // Error is already handled by toast within the hook, but console log if needed
      console.error('PDF Generation failed in tab:', err);
    },
  });

  // Define dialog handling functions before they are used in render methods
  const openRevisionDialogFromSource = (revision: EstimateRevision) => {
    setSourceRevisionForDialog(revision);
    setShowRevisionDialog(true);
  };

  const closeRevisionDialog = () => {
    setShowRevisionDialog(false);
    setSourceRevisionForDialog(null);
    // Trigger a refresh in case a new revision was created
    if (onRefresh) onRefresh();
  };

  const sortedRevisions = [...revisions].sort((a, b) => b.version - a.version);

  useEffect(() => {
    // Fetch items for all revisions when the component mounts or revisions prop changes
    if (revisions.length > 0) {
      fetchAllRevisionItems(revisions);
    }
    // Clear items if revisions become empty
    if (revisions.length === 0) {
      setRevisionItemsMap({});
    }
  }, [revisions]);

  useEffect(() => {
    // Update highest version whenever revisions change
    if (sortedRevisions.length > 0) {
      setHighestVersion(sortedRevisions[0].version); // Assuming sortedRevisions[0] is latest
    }
  }, [sortedRevisions]);

  const fetchRevisionItems = async (revisionId: string) => {
    // Avoid refetching if already loading or already fetched
    if (loadingItems[revisionId] || revisionItemsMap[revisionId]) return;

    setLoadingItems(prev => ({ ...prev, [revisionId]: true }));
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revisionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setRevisionItemsMap(prev => ({
        ...prev,
        [revisionId]: (data as EstimateItem[]) || [], // Cast to correct type
      }));
    } catch (error) {
      console.error(`Error fetching items for revision ${revisionId}:`, error);
      toast({
        title: 'Error',
        description: `Failed to load items for revision ${revisionId}`,
        variant: 'destructive',
      });
      // Store empty array on error to prevent re-fetching
      setRevisionItemsMap(prev => ({
        ...prev,
        [revisionId]: [],
      }));
    } finally {
      setLoadingItems(prev => ({ ...prev, [revisionId]: false }));
    }
  };

  const fetchAllRevisionItems = (revisionsToFetch: EstimateRevision[]) => {
    revisionsToFetch.forEach(revision => {
      // Check again inside the loop in case state changed rapidly
      if (!loadingItems[revision.id] && !revisionItemsMap[revision.id]) {
        fetchRevisionItems(revision.id);
      }
    });
  };

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

  const getStatusIcon = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-[#0485ea]" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleRevisionClick = (revision: EstimateRevision) => {
    console.log(`[DEBUG RevisionsTab] handleRevisionClick called for revision ID: ${revision.id}`);
    if (expandedRevision === revision.id) {
      setExpandedRevision(null);
    } else {
      setExpandedRevision(revision.id);
      fetchRevisionItems(revision.id);
      setViewType('timeline');
    }
  };

  const handleSetAsCurrent = (revisionId: string) => {
    onRevisionSelect(revisionId);
  };

  const handleSelectForCompare = (revisionId: string) => {
    if (!compareRevisionAId) {
      setCompareRevisionAId(revisionId);
      toast({
        title: 'First revision selected',
        description: `Selected v${revisions.find(r => r.id === revisionId)?.version}. Now select the second revision to compare.`,
      });
    } else if (!compareRevisionBId && revisionId !== compareRevisionAId) {
      setCompareRevisionBId(revisionId);
      // Automatically trigger comparison once two are selected
      triggerComparison(compareRevisionAId, revisionId);
    } else if (revisionId === compareRevisionAId) {
      // Deselect A if clicked again
      setCompareRevisionAId(null);
    } else if (revisionId === compareRevisionBId) {
      // Deselect B if clicked again
      setCompareRevisionBId(null);
    } else {
      // If both A and B are selected, replace B with the new selection
      setCompareRevisionBId(revisionId);
      triggerComparison(compareRevisionAId, revisionId);
    }
  };

  const triggerComparison = async (revAId: string, revBId: string) => {
    setIsComparing(true);
    setComparisonResult(null); // Clear previous results
    try {
      const result = await compareEstimateRevisions(revAId, revBId);
      if (result) {
        setComparisonResult(result);
        setShowComparisonDialog(true); // Open dialog on successful comparison
        // Clear selection after showing result?
        setCompareRevisionAId(null);
        setCompareRevisionBId(null);
      } else {
        toast({
          title: 'Comparison Failed',
          description: 'Could not compare the selected revisions.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Comparison Error',
        description: error.message || 'An unexpected error occurred during comparison.',
        variant: 'destructive',
      });
    } finally {
      setIsComparing(false);
    }
  };

  const closeComparisonDialog = () => {
    setShowComparisonDialog(false);
    setComparisonResult(null); // Clear results when closing dialog
  };

  const renderEmptyState = () => (
    <div className="text-center p-4 border rounded-md bg-slate-50 mb-4">
      <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
      <h3 className="text-base font-medium mb-1">No Revisions Available</h3>
      <p className="text-sm text-muted-foreground">This estimate doesn't have any revisions yet.</p>
    </div>
  );

  const renderTimelineView = () => {
    if (sortedRevisions.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {sortedRevisions.map(revision => {
          const isSelectedForView = revision.id === currentRevisionId;
          const isExpanded = revision.id === expandedRevision;
          const items = revisionItemsMap[revision.id] || [];

          return (
            <Card
              key={revision.id}
              className={`${isSelectedForView ? 'border-[#0485ea]/30 shadow-sm' : ''}`}
            >
              <Collapsible
                open={isExpanded}
                onOpenChange={open => {
                  if (open) {
                    setExpandedRevision(revision.id);
                    fetchRevisionItems(revision.id);
                  } else {
                    setExpandedRevision(null);
                  }
                }}
              >
                <CollapsibleTrigger className="w-full">
                  <div
                    className={`p-4 flex items-center justify-between w-full hover:bg-slate-50 cursor-pointer
                      ${isSelectedForView ? 'bg-[#0485ea]/5' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      {isSelectedForView ? (
                        <div className="w-8 h-8 rounded-full bg-[#0485ea] text-white flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                          <FileText className="h-4 w-4" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">Version {revision.version}</span>
                          {isSelectedForView && (
                            <Badge
                              variant="outline"
                              className="ml-2 bg-blue-50 text-blue-800 border-blue-200"
                            >
                              Selected View
                            </Badge>
                          )}

                          <Badge
                            variant="outline"
                            className={`ml-2 ${getStatusColor(revision.status)}`}
                          >
                            <span className="flex items-center">
                              {getStatusIcon(revision.status)}
                              <span className="ml-1 uppercase text-xs">
                                {revision.status || 'Draft'}
                              </span>
                            </span>
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(revision.revision_date)} •{' '}
                          {formatCurrency(revision.amount || 0)}
                        </div>
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    {revision.notes && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-md text-sm">
                        <div className="text-xs text-muted-foreground mb-1">Revision Notes</div>
                        <div>{revision.notes}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Created On</div>
                        <div className="text-sm">{formatDate(revision.created_at || '')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Created By</div>
                        <div className="text-sm">{revision.revision_by || 'Not specified'}</div>
                      </div>
                      {revision.sent_date && (
                        <>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Sent Date</div>
                            <div className="text-sm">{formatDate(revision.sent_date)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Sent To</div>
                            <div className="text-sm">{revision.sent_to || 'Not specified'}</div>
                          </div>
                        </>
                      )}
                    </div>

                    {revision.pdf_document_id && <RevisionPDFViewer revision={revision} />}

                    {!revision.pdf_document_id && (
                      <div className="mb-4">
                        <PDFExportButton
                          estimateId={estimateId}
                          revisionId={revision.id}
                          revisionVersion={revision.version}
                          viewType="internal"
                          size="sm"
                          className="w-full"
                        >
                          <FileUp className="mr-2 h-4 w-4" />
                          Generate PDF for Version {revision.version}
                        </PDFExportButton>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Items Summary</h4>
                      {loadingItems[revision.id] ? (
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">Loading items...</p>
                        </div>
                      ) : items.length > 0 ? (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.slice(0, 5).map(item => (
                                <TableRow key={item.id}>
                                  <TableCell className="text-sm">{item.description}</TableCell>
                                  <TableCell className="text-sm text-right">
                                    {item.quantity}
                                  </TableCell>
                                  <TableCell className="text-sm text-right">
                                    {formatCurrency(item.total_price)}
                                  </TableCell>
                                </TableRow>
                              ))}

                              {items.length > 5 && (
                                <TableRow>
                                  <TableCell colSpan={3} className="text-center py-2">
                                    <span className="text-xs text-muted-foreground">
                                      +{items.length - 5} more items
                                    </span>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="p-3 border rounded-md text-center">
                          <p className="text-sm text-muted-foreground">No items in this revision</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons within Timeline View */}
                    <div className="flex justify-end items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                      {/* Add "Revise From This" button (Only show if not selected for view)*/}
                      {!isSelectedForView && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => openRevisionDialogFromSource(revision)}
                          title={`Create new revision based on Version ${revision.version}`}
                          className="flex items-center"
                        >
                          <GitBranch className="h-4 w-4 mr-1" /> Revise From This
                        </Button>
                      )}

                      {/* Conditionally show "Set as Selected" or "Selected View" button */}
                      {!isSelectedForView ? (
                        <Button
                          size="sm"
                          onClick={() => handleSetAsCurrent(revision.id)}
                          className="bg-[#0485ea] hover:bg-[#0373d1] text-sm"
                        >
                          <ArrowRightCircle className="h-4 w-4 mr-1.5" />
                          Set as Selected View
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Selected View
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderViewToggle = () => (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Estimate Revisions</h3>
      <ToggleGroup
        type="single"
        value={viewType === 'grid' ? 'table' : viewType}
        onValueChange={value => value && setViewType(value as 'timeline' | 'table')}
      >
        <ToggleGroupItem value="table" aria-label="Table View">
          <ListIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="timeline" aria-label="Timeline View">
          <LineChart className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );

  const isRevisionConverted = (revisionId: string): boolean => {
    return convertedRevisionId === revisionId;
  };

  const renderCompactTableView = () => {
    if (sortedRevisions.length === 0) {
      return renderEmptyState();
    }

    return (
      <div>
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Total Cost</TableHead>
              <TableHead className="text-right">Gross Margin</TableHead>
              <TableHead className="text-right">Margin %</TableHead>
              <TableHead className="text-right">Contingency</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRevisions.map(revision => {
              const isSelectedForView = revision.id === currentRevisionId;
              const isConverted = isRevisionConverted(revision.id);
              const isConverting = convertingRevisions[revision.id];
              const isSelectedForCompareA = compareRevisionAId === revision.id;
              const isSelectedForCompareB = compareRevisionBId === revision.id;

              // Get items for this specific revision from state
              const items = revisionItemsMap[revision.id] || [];

              // Calculate financials locally
              const localSubtotal = items.reduce(
                (sum, item) => sum + (Number(item.total_price) || 0),
                0
              );
              const localTotalCost = items.reduce(
                (sum, item) => sum + (Number(item.cost) || 0) * (Number(item.quantity) || 0),
                0
              );
              const localMargin = localSubtotal - localTotalCost;
              const localMarginPercent =
                localSubtotal > 0 ? (localMargin / localSubtotal) * 100 : 0;

              // Calculate contingency amount based on passed percentage and local subtotal
              const localContingencyAmount = localSubtotal * ((contingencyPercentage || 0) / 100);

              // --- BEGIN DEBUG LOG ---
              console.log(`[DEBUG RevisionsTab Render] Rendering revision ID: ${revision.id}`);
              console.log(
                `[DEBUG RevisionsTab Render] Items used for calculation for ${revision.id}:`,
                items
              ); // Log the items array used
              console.log(
                `[DEBUG RevisionsTab Render] Calculated localTotalCost for ${revision.id}: ${localTotalCost}`
              );
              console.log(
                `[DEBUG RevisionsTab Render] Calculated localMargin for ${revision.id}: ${localMargin}`
              );
              console.log(
                `[DEBUG RevisionsTab Render] Calculated localMarginPercent for ${revision.id}: ${localMarginPercent}`
              );
              // --- END DEBUG LOG ---

              return (
                <TableRow
                  key={revision.id}
                  className={`
                    ${isSelectedForView ? 'bg-[#0485ea]/5' : ''}
                    ${isSelectedForCompareA ? 'outline outline-2 outline-offset-[-1px] outline-orange-400' : ''}
                    ${isSelectedForCompareB ? 'outline outline-2 outline-offset-[-1px] outline-purple-400' : ''}
                  `}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <span>Version {revision.version}</span>
                      {isSelectedForView && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-blue-50 text-blue-800 border-blue-200"
                        >
                          Selected View
                        </Badge>
                      )}
                      {isConverted && (
                        <Badge
                          variant="outline"
                          className="ml-2 bg-green-50 text-green-800 border-green-200"
                        >
                          Converted
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(revision.revision_date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(revision.status)}>
                      <span className="flex items-center">
                        {getStatusIcon(revision.status)}
                        <span className="ml-1 uppercase text-xs">{revision.status || 'Draft'}</span>
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(localSubtotal)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(localTotalCost)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(localMargin)}</TableCell>
                  <TableCell className="text-right">
                    {localSubtotal > 0 ? `${localMarginPercent.toFixed(1)}%` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(localContingencyAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(revision.amount || 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionMenu
                      groups={[
                        {
                          items: [
                            {
                              label: 'Select This View',
                              icon: <Eye className="h-4 w-4" />,
                              onClick: () => handleSetAsCurrent(revision.id),
                              disabled: isSelectedForView,
                            },
                            {
                              label: 'Expand Details',
                              icon: <ChevronDown className="h-4 w-4" />,
                              onClick: () => handleRevisionClick(revision),
                              // TODO: Add logic to show ChevronUp if already expanded
                            },
                          ],
                        },
                        {
                          items: [
                            {
                              label: 'Revise From This',
                              icon: <GitBranch className="h-4 w-4" />,
                              onClick: () => openRevisionDialogFromSource(revision),
                              disabled: isConverting,
                            },
                            {
                              label: 'Compare...',
                              icon: <GitCompareArrows className="h-4 w-4" />,
                              onClick: () => handleSelectForCompare(revision.id),
                              // Optionally indicate selection state here too
                              className: isSelectedForCompareA
                                ? 'bg-orange-100'
                                : isSelectedForCompareB
                                  ? 'bg-purple-100'
                                  : '',
                            },
                          ],
                        },
                        {
                          items: [
                            {
                              label: isConverting
                                ? 'Converting...'
                                : isConverted
                                  ? 'Already Converted'
                                  : 'Convert to Project',
                              icon: <ArrowRight className="h-4 w-4" />,
                              onClick: () => handleConvertToProject(revision.id, revision.version),
                              disabled: !!projectId || isConverted || isConverting,
                            },
                          ],
                        },
                        {
                          items: [
                            {
                              label: 'Generate Customer PDF',
                              icon: <FileText className="h-4 w-4" />,
                              onClick: () => generatePdf(estimateId, revision.id, 'external'),
                              disabled: isGenerating,
                            },
                          ],
                        },
                      ]}
                      size="sm"
                      align="end"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderViewToggle()}

      {viewType === 'table' && renderCompactTableView()}
      {viewType === 'timeline' && renderTimelineView()}

      {/* Comparison Dialog */}
      <Dialog open={showComparisonDialog} onOpenChange={closeComparisonDialog}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Revision Comparison</DialogTitle>
            {comparisonResult && (
              <DialogDescription>
                Comparing Version {comparisonResult.revisionA.version} with Version{' '}
                {comparisonResult.revisionB.version}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-hidden py-4">
            {isComparing && <p>Loading comparison...</p>}
            {comparisonResult ? (
              <RevisionComparisonView comparisonResult={comparisonResult} />
            ) : (
              !isComparing && <p>No comparison data available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Creation Dialog (potentially sourced) */}
      {showRevisionDialog && (
        <EstimateRevisionDialog
          open={showRevisionDialog}
          onOpenChange={closeRevisionDialog}
          estimateId={estimateId}
          // Pass the highest current version to determine the *next* version number
          currentVersion={highestVersion}
          // Pass the source revision ID if revising from a specific version
          sourceRevisionId={sourceRevisionForDialog?.id}
          sourceRevisionVersion={sourceRevisionForDialog?.version} // Pass version for display
          // On success, close the dialog (refresh is handled in closeRevisionDialog)
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default EstimateRevisionsTab;
