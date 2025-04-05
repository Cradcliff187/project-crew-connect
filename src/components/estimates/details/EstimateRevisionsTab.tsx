
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { EstimateRevision } from '../types/estimateTypes';
import { ChevronDown, ChevronUp, ArrowLeftRight, Clock, Check, X, Send, FileEdit, Settings, Mail, FileDown, Eye } from 'lucide-react';
import EstimateRevisionCompareDialog from '../detail/dialogs/EstimateRevisionCompareDialog';
import EstimateRevisionEditDialog from '../detail/dialogs/EstimateRevisionEditDialog';
import SendRevisionEmailDialog from '../detail/dialogs/SendRevisionEmailDialog';
import EmailTemplateDialog from '../detail/dialogs/EmailTemplateDialog';
import { Badge } from "@/components/ui/badge";
import RevisionChangeBadge from "../detail/RevisionChangeBadge";
import DocumentViewerDialog from '@/components/documents/DocumentViewerDialog';
import RevisionPDFViewer from '../detail/RevisionPDFViewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';

type EstimateRevisionsTabProps = {
  revisions: EstimateRevision[];
  formatDate: (dateString: string) => string;
  estimateId: string;
  onRefresh?: () => void;
  clientName?: string;
  clientEmail?: string;
};

const EstimateRevisionsTab: React.FC<EstimateRevisionsTabProps> = ({ 
  revisions, 
  formatDate, 
  estimateId,
  onRefresh,
  clientName = "Client",
  clientEmail
}) => {
  const [expandedRevision, setExpandedRevision] = useState<string | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [viewerDialogOpen, setViewerDialogOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<EstimateRevision | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedRevisions, setSelectedRevisions] = useState<{
    oldRevisionId?: string;
    newRevisionId: string;
  }>({ newRevisionId: '' });
  const [hasRecentChanges, setHasRecentChanges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkRecentChanges = async () => {
      const changes: Record<string, boolean> = {};
      
      for (const revision of revisions) {
        if (revision.is_current) {
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const updatedAt = new Date(revision.updated_at || revision.revision_date);
          
          changes[revision.id] = updatedAt > oneHourAgo;
        }
      }
      
      setHasRecentChanges(changes);
    };
    
    checkRecentChanges();
  }, [revisions]);

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

  const handleEdit = (revision: EstimateRevision) => {
    setSelectedRevision(revision);
    setEditDialogOpen(true);
  };

  const handleSendEmail = (revision: EstimateRevision) => {
    setSelectedRevision(revision);
    setEmailDialogOpen(true);
  };

  const handleEmailTemplates = () => {
    setTemplateDialogOpen(true);
  };
  
  const handleViewPdf = async (revision: EstimateRevision) => {
    if (!revision.pdf_document_id) {
      return; // No PDF available
    }
    
    try {
      const { data: document, error } = await supabase
        .from('documents_with_urls')
        .select('*')
        .eq('document_id', revision.pdf_document_id)
        .single();
      
      if (error) throw error;
      
      if (document) {
        setSelectedDocument(document);
        setViewerDialogOpen(true);
      }
    } catch (err) {
      console.error('Error fetching document:', err);
    }
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

  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return formatDate(dateString);
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid date";
    }
  };

  const handleEditSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Revision History</CardTitle>
            <CardDescription>Track changes to this estimate over time</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEmailTemplates}
            className="h-8 px-3"
          >
            <Settings className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Email Templates</span>
          </Button>
        </CardHeader>
        <CardContent>
          {revisions.length > 0 ? (
            <div className="space-y-6">
              {revisions.map((revision, index) => {
                const previousRevision = revisions[index + 1]; // Next in array is previous in time (sorted desc)
                const canEdit = revision.is_current && ['draft', 'ready'].includes(revision.status?.toLowerCase());
                const canSendEmail = revision.is_current && 
                  ['draft', 'ready', 'rejected'].includes(revision.status?.toLowerCase());
                const hasPdf = !!revision.pdf_document_id;
                
                return (
                  <div 
                    key={revision.id} 
                    className={`border rounded-lg p-4 ${hasRecentChanges[revision.id] ? 'border-[#0485ea] bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Version {revision.version}</h4>
                        {revision.is_current && (
                          <Badge variant="outline" className="bg-blue-100 border-blue-200">Current</Badge>
                        )}
                        {hasRecentChanges[revision.id] && (
                          <RevisionChangeBadge changeType="modified" size="sm" />
                        )}
                        {getStatusBadge(revision.status)}
                        {hasPdf && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <FileDown className="h-3 w-3 mr-1" />
                            PDF
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{safeFormatDate(revision.revision_date)}</span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 px-2">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {canEdit && (
                              <DropdownMenuItem onClick={() => handleEdit(revision)}>
                                <FileEdit className="h-3.5 w-3.5 mr-2" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                            )}
                            
                            {canSendEmail && (
                              <DropdownMenuItem onClick={() => handleSendEmail(revision)}>
                                <Mail className="h-3.5 w-3.5 mr-2" />
                                <span>Send Email</span>
                              </DropdownMenuItem>
                            )}
                            
                            {hasPdf && (
                              <DropdownMenuItem onClick={() => handleViewPdf(revision)}>
                                <Eye className="h-3.5 w-3.5 mr-2" />
                                <span>View PDF</span>
                              </DropdownMenuItem>
                            )}
                            
                            {previousRevision && (
                              <>
                                {(canEdit || canSendEmail || hasPdf) && <DropdownMenuSeparator />}
                                <DropdownMenuItem
                                  onClick={() => handleCompare(revision.id, previousRevision.id)}
                                >
                                  <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
                                  <span>Compare</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

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
                            <p>Sent: {safeFormatDate(revision.sent_date)} {revision.sent_to && `to ${revision.sent_to}`}</p>
                          )}
                          {revision.revision_by && (
                            <p>Revised by: {revision.revision_by}</p>
                          )}
                          <p>Created: {safeFormatDate(revision.created_at)}</p>
                          <p>Last updated: {safeFormatDate(revision.updated_at)}</p>
                        </div>
                        
                        {hasPdf && (
                          <div className="mt-3">
                            <RevisionPDFViewer 
                              revision={revision} 
                              showCard={false}
                            />
                          </div>
                        )}
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
      
      <EstimateRevisionEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        revision={selectedRevision}
        onSuccess={handleEditSuccess}
      />
      
      <SendRevisionEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        revision={selectedRevision}
        clientName={clientName}
        clientEmail={clientEmail}
        estimateId={estimateId}
      />
      
      <EmailTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
      
      <DocumentViewerDialog
        open={viewerDialogOpen}
        onOpenChange={setViewerDialogOpen}
        document={selectedDocument}
      />
    </>
  );
};

export default EstimateRevisionsTab;
