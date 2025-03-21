
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstimateRevision } from '../types/estimateTypes';

export interface EstimateRevisionsTabProps {
  revisions: EstimateRevision[];
  formatDate: (dateString: string) => string;
}

const EstimateRevisionsTab: React.FC<EstimateRevisionsTabProps> = ({ revisions, formatDate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision History</CardTitle>
      </CardHeader>
      <CardContent>
        {revisions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No revisions for this estimate.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {revisions.map((revision) => (
                <TableRow key={revision.id}>
                  <TableCell className="font-medium">v{revision.version}</TableCell>
                  <TableCell>{formatDate(revision.revision_date)}</TableCell>
                  <TableCell>
                    {revision.amount !== undefined 
                      ? `$${revision.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{revision.notes || 'No notes'}</TableCell>
                  <TableCell>{revision.revision_by || 'Unknown'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateRevisionsTab;
