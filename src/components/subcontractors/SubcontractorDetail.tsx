
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, FileText, 
  DollarSign, Shield, Star, AlertTriangle, Award, LayoutList, Briefcase
} from 'lucide-react';
import { Subcontractor, formatSubcontractorAddress, getPaymentTermsLabel, calculateVendorScore } from './utils/subcontractorUtils';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import VendorScoreBadge from './VendorScoreBadge';
import InsuranceStatus from './InsuranceStatus';
import PageTransition from '@/components/layout/PageTransition';

const SubcontractorDetail = () => {
  const { subcontractorId } = useParams<{ subcontractorId: string }>();
  const navigate = useNavigate();
  const [subcontractor, setSubcontractor] = useState<Subcontractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialties, setSpecialties] = useState<Record<string, any>>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingAssociations, setLoadingAssociations] = useState(false);
  
  const fetchSubcontractor = async () => {
    if (!subcontractorId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subcontractors')
        .select('*')
        .eq('subid', subcontractorId)
        .single();
      
      if (error) throw error;
      
      setSubcontractor(data as Subcontractor);
      
      // Fetch specialties if the subcontractor has any
      if (data?.specialty_ids && data.specialty_ids.length > 0) {
        const { data: specialtiesData, error: specialtiesError } = await supabase
          .from('subcontractor_specialties')
          .select('*')
          .in('id', data.specialty_ids);
        
        if (specialtiesError) throw specialtiesError;
        
        // Convert to a map for easier lookup
        const specialtiesMap = (specialtiesData || []).reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as Record<string, any>);
        
        setSpecialties(specialtiesMap);
      }

      // Fetch associated projects and work orders
      await fetchAssociatedData(data?.subid);
    } catch (error: any) {
      console.error('Error fetching subcontractor:', error);
      toast({
        title: 'Error fetching subcontractor',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociatedData = async (subId: string) => {
    if (!subId) return;

    setLoadingAssociations(true);
    try {
      // Fetch associated projects
      // This would typically join subcontractor tables with projects through assignments
      // We're using a simplified query for now
      const { data: projectsData, error: projectsError } = await supabase
        .from('subinvoices')
        .select('projectid, projectname')
        .eq('subid', subId)
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      
      // Get unique projects by projectid
      const uniqueProjects = projectsData?.reduce((acc: any[], current) => {
        const x = acc.find(item => item.projectid === current.projectid);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      setProjects(uniqueProjects || []);

      // Fetch associated work orders
      // Assumes there's a relationship between work orders and subcontractors
      const { data: workOrdersData, error: workOrdersError } = await supabase
        .from('maintenance_work_orders')
        .select('work_order_id, title, status')
        .eq('assigned_to', subId)
        .order('created_at', { ascending: false });
      
      if (workOrdersError) throw workOrdersError;
      
      setWorkOrders(workOrdersData || []);
    } catch (error: any) {
      console.error('Error fetching associated data:', error);
      // We don't show a toast here to not disrupt the main flow
    } finally {
      setLoadingAssociations(false);
    }
  };
  
  useEffect(() => {
    fetchSubcontractor();
  }, [subcontractorId]);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const handleBack = () => {
    navigate('/subcontractors');
  };
  
  const handleEdit = () => {
    if (subcontractor) {
      // This will call the edit dialog from the parent component
      navigate('/subcontractors', { state: { editSubcontractor: subcontractor } });
    }
  };
  
  // Status badge styling
  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'QUALIFIED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Qualified</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'VERIFIED':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Verified</Badge>;
      case 'PREFERRED':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Preferred</Badge>;
      case 'REVIEW_NEEDED':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Review Needed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <PageTransition>
        <div className="container max-w-4xl mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="grid gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }
  
  if (!subcontractor) {
    return (
      <PageTransition>
        <div className="container max-w-4xl mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subcontractors
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Subcontractor Not Found</CardTitle>
              <CardDescription>
                The subcontractor you are looking for could not be found.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleBack}>Return to Subcontractors</Button>
            </CardFooter>
          </Card>
        </div>
      </PageTransition>
    );
  }
  
  // Calculate vendor score
  const vendorScore = calculateVendorScore(subcontractor);
  
  // Render specialties
  const renderSpecialties = () => {
    if (!subcontractor.specialty_ids || subcontractor.specialty_ids.length === 0) {
      return <span className="text-muted-foreground italic">None</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {subcontractor.specialty_ids.map(id => {
          const specialty = specialties[id];
          return specialty ? (
            <Badge key={id} variant="secondary" className="text-xs">
              {specialty.specialty}
            </Badge>
          ) : null;
        })}
      </div>
    );
  };
  
  return (
    <PageTransition>
      <div className="container max-w-4xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subcontractors
          </Button>
          <Button onClick={handleEdit}>Edit Subcontractor</Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{subcontractor.subname}</CardTitle>
                <CardDescription className="mt-1">{subcontractor.subid}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(subcontractor.status)}
                {subcontractor.preferred && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <Star className="h-3 w-3 mr-1 fill-amber-500" />
                    Preferred
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="space-y-2">
                  {subcontractor.contactemail && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{subcontractor.contactemail}</span>
                    </div>
                  )}
                  {subcontractor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{subcontractor.phone}</span>
                    </div>
                  )}
                  {formatSubcontractorAddress(subcontractor) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="whitespace-pre-line">{formatSubcontractorAddress(subcontractor)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Financial Information</h3>
                <div className="space-y-2">
                  {subcontractor.payment_terms && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Payment Terms: {getPaymentTermsLabel(subcontractor.payment_terms)}</span>
                    </div>
                  )}
                  {subcontractor.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Hourly Rate: ${subcontractor.hourly_rate}</span>
                    </div>
                  )}
                  {subcontractor.tax_id && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Tax ID: {subcontractor.tax_id}</span>
                    </div>
                  )}
                  {subcontractor.total_completed_amount > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Total Completed: ${subcontractor.total_completed_amount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Compliance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Compliance Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>Insurance: </span>
                    <InsuranceStatus expirationDate={subcontractor.insurance_expiration} showText />
                  </div>
                  {subcontractor.insurance_provider && (
                    <div className="flex items-center gap-2">
                      <span className="ml-6">Provider: {subcontractor.insurance_provider}</span>
                    </div>
                  )}
                  {subcontractor.insurance_policy_number && (
                    <div className="flex items-center gap-2">
                      <span className="ml-6">Policy #: {subcontractor.insurance_policy_number}</span>
                    </div>
                  )}
                  {subcontractor.insurance_expiration && (
                    <div className="flex items-center gap-2">
                      <span className="ml-6">Expires: {formatDate(subcontractor.insurance_expiration)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Contract on File: {subcontractor.contract_on_file ? 'Yes' : 'No'}</span>
                  </div>
                  {subcontractor.contract_on_file && subcontractor.contract_expiration && (
                    <div className="flex items-center gap-2">
                      <span className="ml-6">Expires: {formatDate(subcontractor.contract_expiration)}</span>
                    </div>
                  )}
                  {subcontractor.last_performance_review && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Last Review: {formatDate(subcontractor.last_performance_review)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Performance Metrics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Performance Metrics</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Overall Score:</span>
                  <VendorScoreBadge score={vendorScore} showText={true} size="lg" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  {subcontractor.rating !== null && subcontractor.rating !== undefined && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span>Rating: {subcontractor.rating} / 5</span>
                    </div>
                  )}
                  {subcontractor.on_time_percentage !== null && subcontractor.on_time_percentage !== undefined && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>On-time: {subcontractor.on_time_percentage}%</span>
                    </div>
                  )}
                  {subcontractor.quality_score !== null && subcontractor.quality_score !== undefined && (
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Quality Score: {subcontractor.quality_score} / 100</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  {subcontractor.safety_incidents !== null && subcontractor.safety_incidents !== undefined && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span>Safety Incidents: {subcontractor.safety_incidents}</span>
                    </div>
                  )}
                  {subcontractor.response_time_hours !== null && subcontractor.response_time_hours !== undefined && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Avg. Response Time: {subcontractor.response_time_hours} hrs</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Specialties */}
            {subcontractor.specialty_ids && subcontractor.specialty_ids.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Specialties</h3>
                  <div>
                    {renderSpecialties()}
                  </div>
                </div>
              </>
            )}

            {/* Associated Projects */}
            {projects.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Associated Projects</h3>
                  <div className="grid gap-2">
                    {loadingAssociations ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (
                      projects.map((project) => (
                        <Card key={project.projectid} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium">{project.projectname || 'Unnamed Project'}</div>
                                <div className="text-xs text-muted-foreground">{project.projectid}</div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/projects/${project.projectid}`)}
                            >
                              View Project
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Associated Work Orders */}
            {workOrders.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Work Orders</h3>
                  <div className="grid gap-2">
                    {loadingAssociations ? (
                      <Skeleton className="h-16 w-full" />
                    ) : (
                      workOrders.map((workOrder) => (
                        <Card key={workOrder.work_order_id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <LayoutList className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <div className="font-medium">{workOrder.title}</div>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {workOrder.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/workorders/${workOrder.work_order_id}`)}
                            >
                              View Work Order
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Notes */}
            {subcontractor.notes && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notes</h3>
                  <div className="whitespace-pre-line bg-muted p-4 rounded-md">
                    {subcontractor.notes}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default SubcontractorDetail;
