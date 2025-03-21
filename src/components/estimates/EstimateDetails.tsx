
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { StatusType } from '@/types/common';
import { useEstimateToProject } from './hooks/useEstimateToProject';
import { Loader2 } from 'lucide-react';

export type EstimateItem = {
  id: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type EstimateRevision = {
  id: string;
  estimate_id: string;
  version: number;
  revision_date: string;
  revision_by: string | null;
  notes: string | null;
  amount: number | null;
};

export type EstimateDetailsProps = {
  estimate: {
    id: string;
    client: string;
    project: string;
    date: string;
    amount: number;
    status: StatusType | string;
    versions: number;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    description?: string;
  };
  items?: EstimateItem[];
  revisions?: EstimateRevision[];
  open: boolean;
  onClose: () => void;
};

const EstimateDetails: React.FC<EstimateDetailsProps> = ({ 
  estimate, 
  items = [], 
  revisions = [], 
  open, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const { convertEstimateToProject, isConverting } = useEstimateToProject();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const handleCopyEstimate = () => {
    toast({
      title: "Duplicate created",
      description: "A new draft estimate has been created",
    });
  };

  const handleConvertToProject = async () => {
    const newProject = await convertEstimateToProject(estimate);
    if (newProject) {
      toast({
        title: "Project Created",
        description: `Project ${newProject.projectid} has been created from this estimate.`,
        variant: "default"
      });
      onClose(); // Close the dialog after successful conversion
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + Number(item.total_price), 0);
  };

  // Check if the estimate can be converted to a project
  const canConvert = estimate.status === 'draft' || estimate.status === 'sent';

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">
              Estimate <span className="text-[#0485ea]">{estimate.id}</span>
            </DialogTitle>
            <StatusBadge status={estimate.status as StatusType} />
          </div>
          <DialogDescription>
            {estimate.client} • {formatDate(estimate.date)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-end space-x-2 mb-4">
          <Button 
            variant="outline" 
            onClick={handleCopyEstimate}
            size="sm"
          >
            Duplicate
          </Button>
          <Button
            onClick={handleConvertToProject}
            size="sm"
            disabled={!canConvert || isConverting}
            className="bg-[#0485ea] hover:bg-[#0373ce]"
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Converting...
              </>
            ) : (
              'Convert to Project'
            )}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="revisions">Revisions ({estimate.versions})</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1">
            <TabsContent value="details" className="m-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Project:</span>
                      <p className="font-medium">{estimate.project}</p>
                    </div>
                    {estimate.description && (
                      <div>
                        <span className="text-muted-foreground">Description:</span>
                        <p>{estimate.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Client:</span>
                      <p className="font-medium">{estimate.client}</p>
                    </div>
                    {estimate.location && (
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        {estimate.location.address && <p>{estimate.location.address}</p>}
                        {(estimate.location.city || estimate.location.state || estimate.location.zip) && (
                          <p>
                            {estimate.location.city && `${estimate.location.city}, `}
                            {estimate.location.state && `${estimate.location.state} `}
                            {estimate.location.zip && estimate.location.zip}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <p className="font-medium text-xl">{formatCurrency(estimate.amount)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="items" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Estimate Line Items</CardTitle>
                  <CardDescription>Detailed breakdown of estimate costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50%]">Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.length > 0 ? (
                        <>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold">Total</TableCell>
                            <TableCell className="text-right font-bold">{formatCurrency(calculateTotal())}</TableCell>
                          </TableRow>
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No line items found for this estimate.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="revisions" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Revision History</CardTitle>
                  <CardDescription>Track changes to this estimate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {revisions.length > 0 ? (
                    <div className="space-y-6">
                      {revisions.map((revision) => (
                        <div key={revision.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Version {revision.version}</h4>
                            <span className="text-sm text-muted-foreground">{formatDate(revision.revision_date)}</span>
                          </div>
                          {revision.notes && <p className="text-sm mb-2">{revision.notes}</p>}
                          {revision.amount && (
                            <p className="text-sm font-medium">
                              Amount: {formatCurrency(revision.amount)}
                            </p>
                          )}
                          {revision.revision_by && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Revised by: {revision.revision_by}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No revision history available for this estimate.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Related Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-muted-foreground">
                    No documents attached to this estimate.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetails;
