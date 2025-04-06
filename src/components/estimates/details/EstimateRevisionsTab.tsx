
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Filter, ArrowDown, ArrowUp, FileText, ArrowLeftRight } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RevisionComparison from '../detail/RevisionComparison';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [sortField, setSortField] = useState<'version' | 'revision_date'>('version');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('compare'); // Default to compare for better UX
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | undefined>(undefined);
  
  const toggleSort = (field: 'version' | 'revision_date') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  const getSortIcon = (field: 'version' | 'revision_date') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  };
  
  // Sort the revisions based on the current sort settings
  const sortedRevisions = [...revisions].sort((a, b) => {
    if (sortField === 'version') {
      return sortDirection === 'asc' ? a.version - b.version : b.version - a.version;
    } else {
      const dateA = new Date(a.revision_date).getTime();
      const dateB = new Date(b.revision_date).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });
  
  // Get the current revision
  const currentRevision = revisions.find(rev => rev.id === currentRevisionId);
  
  // Handle revision selection for comparison
  const handleRevisionSelect = (revisionId: string) => {
    setSelectedRevisionId(revisionId);
  };
  
  // Select a revision to compare with the current one
  const compareToRevision = selectedRevisionId || 
    (sortedRevisions.length > 1 
      ? sortedRevisions.find(r => r.id !== currentRevisionId)?.id 
      : undefined);
      
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

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Version History</h2>
        <p className="text-muted-foreground text-sm">
          Track and compare revisions to this estimate over time.
        </p>
      </div>
      
      <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'compare')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="compare" className="flex items-center gap-1">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Compare View
            </TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm" className="text-xs">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Filter
          </Button>
        </div>
        
        <TabsContent value="compare" className="mt-0">
          {currentRevisionId && (
            <RevisionComparison
              estimateId={estimateId}
              currentRevisionId={currentRevisionId}
              revisions={revisions}
              onRevisionSelect={onRevisionSelect}
            />
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] cursor-pointer" onClick={() => toggleSort('version')}>
                        <div className="flex items-center">
                          Version {getSortIcon('version')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => toggleSort('revision_date')}>
                        <div className="flex items-center">
                          Date {getSortIcon('revision_date')}
                        </div>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRevisions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No revision history available
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedRevisions.map((revision) => (
                        <TableRow key={revision.id} className={currentRevisionId === revision.id ? "bg-blue-50/40" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {revision.version}
                              {revision.is_current && (
                                <Badge variant="outline" className="ml-2 bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20 text-[10px]">
                                  Current
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(revision.revision_date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getStatusColor(revision.status)} text-xs uppercase font-medium`}>
                              {revision.status || 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>{formatCurrency(revision.amount || 0)}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <div className="text-xs">
                                    {currentRevision && revision.id !== currentRevisionId && revision.amount !== undefined && currentRevision.amount !== undefined ? (
                                      <div className="flex flex-col">
                                        <span className={revision.amount > currentRevision.amount ? "text-green-600" : "text-red-600"}>
                                          {revision.amount > currentRevision.amount ? "+" : ""}
                                          {formatCurrency(revision.amount - currentRevision.amount)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">compared to current</span>
                                      </div>
                                    ) : 'Total amount'}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="max-w-[180px]">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate text-sm text-muted-foreground">
                                    {revision.notes || '-'}
                                  </div>
                                </TooltipTrigger>
                                {revision.notes && (
                                  <TooltipContent side="top" className="max-w-sm">
                                    <p className="text-xs">{revision.notes}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {currentRevisionId !== revision.id && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => onRevisionSelect(revision.id)}
                                  className="h-8 px-2 text-xs"
                                >
                                  Switch To
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setViewMode('compare');
                                  handleRevisionSelect(revision.id);
                                }}
                                className="h-8 px-2 text-xs"
                              >
                                <ArrowLeftRight className="h-4 w-4 mr-1" />
                                Compare
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => onRevisionSelect(revision.id)}
                                className="h-8 px-2 text-xs"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
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
};

export default EstimateRevisionsTab;
