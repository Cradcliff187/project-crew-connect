
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogHeader, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Calendar, DollarSign, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EstimateItems from './EstimateItems';
import EstimateActions from './EstimateActions';
import EstimateBudgetIntegration from './EstimateBudgetIntegration';
import { useEstimateToProject } from './hooks/useEstimateToProject';
import { StatusType } from '@/types/common';

// Interface for the estimate
interface EstimateProps {
  data: {
    estimateid: string;
    customerid?: string;
    customername?: string;
    projectid?: string;
    projectname?: string;
    job_description?: string;
    estimateamount: number;
    contingencyamount?: number;
    contingency_percentage?: number;
    datecreated?: string;
    sentdate?: string;
    approveddate?: string;
    status: string;
    sitelocationaddress?: string;
    sitelocationcity?: string;
    sitelocationstate?: string;
    sitelocationzip?: string;
    items: {
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }[];
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (id: string, status: string) => void;
  onRefresh?: () => void;
}

const EstimateDetail: React.FC<EstimateProps> = ({ 
  data, 
  onEdit, 
  onDelete,
  onStatusChange,
  onRefresh
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const { toast } = useToast();
  const { convertEstimateToProject, isConverting } = useEstimateToProject();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDeleteDialogOpen(false);
  };

  const handleConvertToProject = async () => {
    try {
      const projectData = await convertEstimateToProject({
        id: data.estimateid,
        client: data.customerid || data.customername || 'Unknown Client',
        project: data.projectname || `Project from EST-${data.estimateid.substring(0, 8)}`,
        description: data.job_description,
        location: {
          address: data.sitelocationaddress,
          city: data.sitelocationcity,
          state: data.sitelocationstate,
          zip: data.sitelocationzip
        },
        amount: data.estimateamount
      });
      
      setConvertDialogOpen(false);
      
      if (projectData) {
        toast({
          title: 'Success',
          description: `Estimate converted to project: ${projectData.projectname}`,
        });
        
        // Update estimate status to 'converted'
        if (onStatusChange) {
          onStatusChange(data.estimateid, 'converted');
        }
        
        // Refresh the estimate data
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Error converting estimate to project:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert estimate to project. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Estimate #{data.estimateid.substring(4, 10)}</h1>
            <Badge className={getStatusBadgeClass(data.status)}>
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">
            Created on {formatDate(data.datecreated)}
          </p>
        </div>
        
        <EstimateActions 
          status={data.status as StatusType}
          onEdit={onEdit}
          onDelete={() => setDeleteDialogOpen(true)}
          onConvert={() => setConvertDialogOpen(true)}
        />
      </div>
      
      {/* Main content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Estimate info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estimate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                  Amount
                </h3>
                <p className="text-lg font-semibold">${data.estimateamount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                {data.contingencyamount && data.contingency_percentage && (
                  <p className="text-sm text-gray-500">
                    Includes {data.contingency_percentage}% contingency (${data.contingencyamount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  Date Information
                </h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm">Created:</dt>
                    <dd className="text-sm font-medium">{formatDate(data.datecreated)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm">Sent:</dt>
                    <dd className="text-sm font-medium">{formatDate(data.sentdate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm">Approved:</dt>
                    <dd className="text-sm font-medium">{formatDate(data.approveddate)}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                  <FileText className="h-4 w-4 mr-1 text-gray-400" />
                  Client & Project
                </h3>
                <dl className="space-y-1">
                  <div className="flex justify-between">
                    <dt className="text-sm">Client:</dt>
                    <dd className="text-sm font-medium">{data.customername || data.customerid || 'Not specified'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm">Project:</dt>
                    <dd className="text-sm font-medium">{data.projectname || 'Not linked'}</dd>
                  </div>
                </dl>
              </div>
              
              {(data.sitelocationaddress || data.sitelocationcity) && (
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    Location
                  </h3>
                  <address className="not-italic text-sm">
                    {data.sitelocationaddress && <div>{data.sitelocationaddress}</div>}
                    {(data.sitelocationcity || data.sitelocationstate || data.sitelocationzip) && (
                      <div>
                        {data.sitelocationcity && `${data.sitelocationcity}, `}
                        {data.sitelocationstate && `${data.sitelocationstate} `}
                        {data.sitelocationzip && data.sitelocationzip}
                      </div>
                    )}
                  </address>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Show budget integration component if estimate is converted to project */}
          {data.status === 'converted' && data.projectid && (
            <EstimateBudgetIntegration 
              estimateId={data.estimateid}
              projectId={data.projectid}
              onComplete={onRefresh}
            />
          )}
        </div>
        
        {/* Estimate items */}
        <div className="md:col-span-2">
          <Tabs defaultValue="items">
            <TabsList>
              <TabsTrigger value="items">Line Items</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="mt-6">
              <EstimateItems items={data.items} />
              
              <div className="flex justify-end mt-4">
                <div className="w-64">
                  <div className="flex justify-between py-2 text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ${(data.estimateamount - (data.contingencyamount || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {data.contingencyamount && data.contingency_percentage && (
                    <div className="flex justify-between py-2 text-sm">
                      <span>Contingency ({data.contingency_percentage}%):</span>
                      <span className="font-medium">
                        ${data.contingencyamount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 text-lg font-bold border-t">
                    <span>Total:</span>
                    <span>${data.estimateamount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  {data.job_description ? (
                    <div className="prose max-w-none">
                      <p>{data.job_description}</p>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      No description provided for this estimate.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Delete dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this estimate. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Convert to project dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convert to Project</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new project based on this estimate. The estimate will be marked as converted and linked to the new project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button 
              className="bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={handleConvertToProject}
              disabled={isConverting}
            >
              {isConverting ? 'Converting...' : 'Convert to Project'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EstimateDetail;
