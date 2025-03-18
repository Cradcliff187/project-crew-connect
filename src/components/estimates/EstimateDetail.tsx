
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEstimateToProject } from './hooks/useEstimateToProject';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Calendar, ClipboardList, FileText, FileDigit, CheckCircle2 } from 'lucide-react';
import EstimateItems from './EstimateItems';
import EstimateActions from './EstimateActions';
import EstimateBudgetIntegration from './EstimateBudgetIntegration';

interface EstimateDetail {
  estimateid: string;
  customername: string;
  customerid: string;
  datecreated: string;
  estimateamount: number;
  contingency_percentage: number;
  contingencyamount: number;
  sentdate: string | null;
  approveddate: string | null;
  status: string;
  projectid: string | null;
  projectname: string | null;
  "job description": string;
  sitelocationaddress: string | null;
  sitelocationcity: string | null;
  sitelocationstate: string | null;
  sitelocationzip: string | null;
}

const EstimateDetail: React.FC = () => {
  const { estimateId } = useParams<{ estimateId: string }>();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<EstimateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertedProject, setConvertedProject] = useState<string | null>(null);
  
  const { isConverting, convertEstimateToProject } = useEstimateToProject();

  // Fetch estimate details
  useEffect(() => {
    const fetchEstimateDetails = async () => {
      setLoading(true);
      try {
        // Use single() to get a single record or an error
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .eq('estimateid', estimateId)
          .single();
        
        if (error) throw error;
        setEstimate(data as EstimateDetail);
        
        if (data.projectid) {
          setConvertedProject(data.projectid);
        }
      } catch (error: any) {
        console.error('Error fetching estimate details:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load estimate details.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (estimateId) {
      fetchEstimateDetails();
    }
  }, [estimateId]);

  const handleBackClick = () => {
    navigate('/estimates');
  };

  const handleConvertToProject = async () => {
    if (!estimate) return;
    
    const project = await convertEstimateToProject({
      id: estimate.estimateid,
      client: estimate.customerid || estimate.customername,
      project: estimate.projectname || `Project from ${estimate.estimateid}`,
      description: estimate["job description"],
      location: {
        address: estimate.sitelocationaddress || '',
        city: estimate.sitelocationcity || '',
        state: estimate.sitelocationstate || '',
        zip: estimate.sitelocationzip || '',
      },
      amount: estimate.estimateamount
    });
    
    if (project) {
      setConvertedProject(project.projectid);
      // Refresh the estimate to get the updated projectid
      const { data } = await supabase
        .from('estimates')
        .select('*')
        .eq('estimateid', estimateId)
        .single();
      
      if (data) {
        setEstimate(data as EstimateDetail);
      }
    }
  };

  // Format date strings
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get location string
  const getLocationString = (estimate: EstimateDetail) => {
    const parts = [];
    if (estimate.sitelocationaddress) parts.push(estimate.sitelocationaddress);
    
    const cityStateZip = [];
    if (estimate.sitelocationcity) cityStateZip.push(estimate.sitelocationcity);
    if (estimate.sitelocationstate) cityStateZip.push(estimate.sitelocationstate);
    if (estimate.sitelocationzip) cityStateZip.push(estimate.sitelocationzip);
    
    if (cityStateZip.length > 0) {
      parts.push(cityStateZip.join(', '));
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No location specified';
  };

  return (
    <PageTransition>
      <div className="flex flex-col min-h-full">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBackClick} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Estimates
          </Button>
          
          {loading ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </>
          ) : !estimate ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Estimate not found or has been deleted.</p>
              <Button onClick={handleBackClick}>Return to Estimates</Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">
                    Estimate {estimate.estimateid}
                    {estimate.projectname && (
                      <span className="ml-2 text-lg font-medium text-muted-foreground">
                        for {estimate.projectname}
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Created on {formatDate(estimate.datecreated)}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <StatusBadge status={estimate.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Customer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{estimate.customername || 'No Customer'}</div>
                    <div className="text-sm text-muted-foreground">{estimate.customerid}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-md">{getLocationString(estimate)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Amount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{formatCurrency(estimate.estimateamount)}</div>
                    {estimate.contingencyamount > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Includes {estimate.contingency_percentage}% contingency 
                        ({formatCurrency(estimate.contingencyamount)})
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {estimate["job description"] ? (
                      <p>{estimate["job description"]}</p>
                    ) : (
                      <p className="text-muted-foreground">No description provided.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Conversion to Project Section */}
              {convertedProject ? (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-green-100">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-green-700">Converted to Project</h3>
                          <p className="text-sm text-green-600 mb-4">
                            This estimate has been converted to a project.
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/projects/${convertedProject}`)}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Project
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <EstimateBudgetIntegration
                    estimateId={estimate.estimateid}
                    projectId={convertedProject}
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileDigit className="mr-2 h-5 w-5" />
                        Convert to Project
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">
                        Convert this estimate into a project to start tracking progress, budgets, and work.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={handleConvertToProject} 
                        disabled={isConverting}
                        className="bg-[#0485ea] hover:bg-[#0375d1]"
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        {isConverting ? 'Converting...' : 'Convert to Project'}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
              
              <Tabs defaultValue="items">
                <TabsList className="mb-4">
                  <TabsTrigger value="items">Line Items</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items">
                  <EstimateItems estimateId={estimate.estimateid} />
                </TabsContent>
                
                <TabsContent value="actions">
                  <EstimateActions 
                    estimate={estimate} 
                    onEstimateUpdated={(updatedEstimate) => setEstimate(updatedEstimate)} 
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default EstimateDetail;
