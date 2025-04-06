
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, CheckCircle, Clock, AlertCircle, XCircle, 
  ArrowRightCircle, ChevronDown, ChevronUp, LineChart, 
  FileUp, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { EstimateRevision } from '../types/estimateTypes';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import RevisionPDFViewer from '../detail/RevisionPDFViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PDFExportButton from '../detail/PDFExportButton';

interface EstimateRevisionsTabProps {
  estimateId: string;
  revisions: EstimateRevision[];
  currentRevisionId?: string;
  onRevisionSelect: (revisionId: string) => void;
}

const EstimateRevisionsTab: React.FC<EstimateRevisionsTabProps> = ({
  estimateId,
  revisions,
  currentRevisionId,
  onRevisionSelect
}) => {
  const [expandedRevision, setExpandedRevision] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [revisionItems, setRevisionItems] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sort revisions with newest first
  const sortedRevisions = [...revisions].sort((a, b) => b.version - a.version);
  
  useEffect(() => {
    if (currentRevisionId) {
      setExpandedRevision(currentRevisionId);
      fetchRevisionItems(currentRevisionId);
    }
  }, [currentRevisionId]);

  const fetchRevisionItems = async (revisionId: string) => {
    if (revisionItems[revisionId]) return; // Already fetched
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', revisionId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setRevisionItems(prev => ({
        ...prev,
        [revisionId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching revision items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revision items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string | undefined) => {
    switch(status?.toLowerCase()) {
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
    switch(status?.toLowerCase()) {
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
    // Toggle expansion
    if (expandedRevision === revision.id) {
      setExpandedRevision(null);
    } else {
      setExpandedRevision(revision.id);
      // Fetch items if not already loaded
      fetchRevisionItems(revision.id);
    }
  };
  
  const handleSetAsCurrent = (revisionId: string) => {
    onRevisionSelect(revisionId);
  };
  
  const renderEmptyState = () => (
    <div className="text-center p-4 border rounded-md bg-slate-50 mb-4">
      <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
      <h3 className="text-base font-medium mb-1">No Revisions Available</h3>
      <p className="text-sm text-muted-foreground">
        This estimate doesn't have any revisions yet.
      </p>
    </div>
  );

  const renderTimelineView = () => {
    if (sortedRevisions.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {sortedRevisions.map((revision) => {
          const isCurrent = revision.id === currentRevisionId;
          const isExpanded = revision.id === expandedRevision;
          const items = revisionItems[revision.id] || [];
          
          return (
            <Card 
              key={revision.id} 
              className={`${isCurrent ? 'border-[#0485ea]/30 shadow-sm' : ''}`}
            >
              <Collapsible
                open={isExpanded}
                onOpenChange={(open) => {
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
                      ${isCurrent ? 'bg-[#0485ea]/5' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      {isCurrent ? (
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
                          {isCurrent && (
                            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200">
                              Current
                            </Badge>
                          )}
                          
                          <Badge variant="outline" className={`ml-2 ${getStatusColor(revision.status)}`}>
                            <span className="flex items-center">
                              {getStatusIcon(revision.status)}
                              <span className="ml-1 uppercase text-xs">{revision.status || 'Draft'}</span>
                            </span>
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(revision.revision_date)} • {formatCurrency(revision.amount || 0)}
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
                    {/* Notes section if available */}
                    {revision.notes && (
                      <div className="mb-4 p-3 bg-slate-50 rounded-md text-sm">
                        <div className="text-xs text-muted-foreground mb-1">
                          Revision Notes
                        </div>
                        <div>
                          {revision.notes}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional revision metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Created On</div>
                        <div className="text-sm">{formatDate(revision.created_at || '')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Created By</div>
                        <div className="text-sm">{revision.created_by || 'Not specified'}</div>
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
                    
                    {/* PDF document access */}
                    {revision.pdf_document_id && (
                      <RevisionPDFViewer revision={revision} />
                    )}
                    
                    {!revision.pdf_document_id && (
                      <div className="mb-4">
                        <PDFExportButton
                          estimateId={estimateId}
                          revisionId={revision.id}
                          size="sm"
                          className="w-full"
                        >
                          <FileUp className="mr-2 h-4 w-4" />
                          Generate PDF for Version {revision.version}
                        </PDFExportButton>
                      </div>
                    )}
                    
                    {/* Item summary */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Items Summary</h4>
                      {loading ? (
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
                                  <TableCell className="text-sm text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-sm text-right">{formatCurrency(item.total_price)}</TableCell>
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
                    
                    {/* Actions */}
                    <div className="flex justify-end">
                      {!isCurrent ? (
                        <Button 
                          size="sm"
                          onClick={() => handleSetAsCurrent(revision.id)}
                          className="bg-[#0485ea] hover:bg-[#0373d1] text-sm"
                        >
                          <ArrowRightCircle className="h-4 w-4 mr-1.5" />
                          Set as Current Version
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          variant="outline"
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300"
                          disabled
                        >
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          Current Version
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

  const renderCompactTableView = () => {
    if (sortedRevisions.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRevisions.map(revision => {
              const isCurrent = revision.id === currentRevisionId;
              
              return (
                <TableRow 
                  key={revision.id}
                  className={isCurrent ? 'bg-[#0485ea]/5' : ''}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">V{revision.version}</span>
                      {isCurrent && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                          Current
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
                  <TableCell>{formatCurrency(revision.amount || 0)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {revision.pdf_document_id && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // Open PDF in new tab (basic implementation)
                            // In a real app, integrate with RevisionPDFViewer component
                          }}
                          className="h-7 text-xs"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          PDF
                        </Button>
                      )}
                      
                      {!isCurrent && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetAsCurrent(revision.id)}
                          className="h-7 text-xs text-[#0485ea]"
                        >
                          <ArrowRightCircle className="h-3.5 w-3.5 mr-1" />
                          Set Current
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setExpandedRevision(revision.id);
                          fetchRevisionItems(revision.id);
                          setActiveTab('timeline');
                        }}
                        className="h-7 text-xs"
                      >
                        <LineChart className="h-3.5 w-3.5 mr-1" />
                        Details
                      </Button>
                    </div>
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
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          
          <div>
            <PDFExportButton
              estimateId={estimateId}
              revisionId={currentRevisionId}
              size="sm"
              variant="outline"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Generate PDF
            </PDFExportButton>
          </div>
        </div>
        
        <TabsContent value="timeline" className="mt-0">
          {renderTimelineView()}
        </TabsContent>
        
        <TabsContent value="table" className="mt-0">
          {renderCompactTableView()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EstimateRevisionsTab;
