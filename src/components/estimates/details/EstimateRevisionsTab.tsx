
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { EstimateRevision } from '../types/estimateTypes';
import { ChevronDown, ChevronUp, ArrowLeftRight, Clock, Check, X, Send } from 'lucide-react';
import EstimateRevisionCompareDialog from '../detail/dialogs/EstimateRevisionCompareDialog';
import { Badge } from "@/components/ui/badge";

type EstimateRevisionsTabProps = {
  revisions: EstimateRevision[];
  formatDate: (dateString: string) => string;
  estimateId: string;
};

const EstimateRevisionsTab: React.FC<EstimateRevisionsTabProps> = ({ revisions, formatDate, estimateId }) => {
  const [expandedRevision, setExpandedRevision] = useState<string | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [selectedRevisions, setSelectedRevisions] = useState<{
    oldRevisionId?: string;
    newRevisionId: string;
  }>({ newRevisionId: '' });

  const toggleExpand = (revisionId: string) => {
    if (expandedRevision === revisionId) {
      setExpandedRevision(null);
    } else {
      setExpandedRevision(revisionId);
    }
  };

  const handleCompare = (revisionId: string, previousRevisionId?: string) => {
    setSelectedRevisions({
      oldRevisionId: previousRevisionId,
      newRevisionId: revisionId
    });
    setCompareDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return <Clock className="h-3.5 w-3.5 text-gray-500" />;
      case 'ready':
        return <Clock className="h-3.5 w-3.5 text-blue-500" />;
      case 'sent':
        return <Send className="h-3.5 w-3.5 text-blue-500" />;
      case 'approved':
        return <Check className="h-3.5 w-3.5 text-green-500" />;
      case 'rejected':
        return <X className="h-3.5 w-3.5 text-red-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const color = {
      draft: "bg-gray-100 text-gray-800",
      ready: "bg-blue-100 text-blue-800",
      sent: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    }[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    
    return (
      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </div>
    );
  };

  // Safe date formatting helper
  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid date";
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Revision History</CardTitle>
          <CardDescription>Track changes to this estimate over time</CardDescription>
        </CardHeader>
        <CardContent>
          {revisions.length > 0 ? (
            <div className="space-y-6">
              {revisions.map((revision, index) => {
                const previousRevision = revisions[index + 1]; // Next in array is previous in time (sorted desc)
                
                return (
                  <div key={revision.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Version {revision.version}</h4>
                        {revision.is_current && (
                          <Badge variant="outline" className="bg-blue-100 border-blue-200">Current</Badge>
                        )}
                        {getStatusBadge(revision.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{safeFormatDate(revision.revision_date)}</span>
                        {previousRevision && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={() => handleCompare(revision.id, previousRevision.id)}
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs">Compare</span>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => toggleExpand(revision.id)}
                        >
                          {expandedRevision === revision.id ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </Button>
                      </div>
                    </div>
                    
                    {expandedRevision === revision.id && (
                      <div className="mt-2 pl-2 border-l-2 border-gray-200">
                        {revision.notes && <p className="text-sm mb-2">{revision.notes}</p>}
                        {revision.amount && (
                          <p className="text-sm font-medium">
                            Amount: {formatCurrency(revision.amount)}
                          </p>
                        )}
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          {revision.status && (
                            <p>Status: {revision.status}</p>
                          )}
                          {revision.sent_date && (
                            <p>Sent: {safeFormatDate(revision.sent_date)}</p>
                          )}
                          {revision.revision_by && (
                            <p>Revised by: {revision.revision_by}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No revision history available for this estimate.
            </div>
          )}
        </CardContent>
      </Card>
      
      <EstimateRevisionCompareDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        estimateId={estimateId}
        oldRevisionId={selectedRevisions.oldRevisionId}
        newRevisionId={selectedRevisions.newRevisionId}
      />
    </>
  );
};

export default EstimateRevisionsTab;
