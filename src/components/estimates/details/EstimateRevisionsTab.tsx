
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Filter, ArrowDown, ArrowUp, FileText } from 'lucide-react';
import { EstimateRevision } from '../types/estimateTypes';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RevisionComparison from '../detail/RevisionComparison';

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
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list');
  
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
      
      <Tabs defaultValue="list" onValueChange={(value) => setViewMode(value as 'list' | 'compare')}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="compare">Comparison</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm" className="text-xs">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Filter
          </Button>
        </div>
        
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
                        <TableRow key={revision.id}>
                          <TableCell className="font-medium">
                            {revision.version}
                            {revision.is_current && (
                              <Badge variant="outline" className="ml-2 bg-[#0485ea]/10 text-[#0485ea] border-[#0485ea]/20 text-[10px]">
                                Current
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(revision.revision_date)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${getStatusColor(revision.status)} text-xs uppercase font-medium`}>
                              {revision.status || 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(revision.amount || 0)}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate">
                            {revision.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onRevisionSelect(revision.id)}
                              className="h-8 px-2"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
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
      </Tabs>
    </div>
  );
};

export default EstimateRevisionsTab;
