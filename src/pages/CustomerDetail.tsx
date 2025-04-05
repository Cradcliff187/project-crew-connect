
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerData(customerId);
    }
  }, [customerId]);

  const fetchCustomerData = async (id: string) => {
    try {
      setLoading(true);
      
      // Fetch the customer data
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customerid', id)
        .single();
      
      if (error) {
        throw error;
      }
      
      setCustomer(data);
      
      // Fetch related projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('customerid', id)
        .order('created_at', { ascending: false });
      
      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else {
        setProjects(projectsData || []);
      }
      
      // Fetch related estimates
      const { data: estimatesData, error: estimatesError } = await supabase
        .from('estimates')
        .select('*')
        .eq('customerid', id)
        .order('datecreated', { ascending: false });
      
      if (estimatesError) {
        console.error('Error fetching estimates:', estimatesError);
      } else {
        setEstimates(estimatesData || []);
      }
    } catch (error: any) {
      console.error('Error fetching customer data:', error);
      setError(error.message || 'Error fetching customer data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
        </div>
      </PageTransition>
    );
  }

  if (error || !customer) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Error Loading Customer</h1>
          <p className="text-red-500">{error || 'Customer not found'}</p>
          <button 
            onClick={() => navigate('/customers')} 
            className="px-4 py-2 bg-[#0485ea] text-white rounded-md hover:bg-[#0373ce]"
          >
            Back to Customers
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{customer.customername || 'Customer Details'}</h1>
          <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'outline'} className="capitalize">
            {customer.status || 'No Status'}
          </Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{customer.contactemail || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p>{customer.phone || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p>{customer.address || 'Not specified'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p>
                  {customer.city || ''}{customer.city && customer.state ? ', ' : ''}
                  {customer.state || ''}{(customer.city || customer.state) && customer.zip ? ' ' : ''}
                  {customer.zip || ''}
                  {!customer.city && !customer.state && !customer.zip && 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {projects.map((project) => (
                      <tr 
                        key={project.projectid} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/projects/${project.projectid}`)}
                      >
                        <td className="px-4 py-3 text-sm">{project.projectid}</td>
                        <td className="px-4 py-3 text-sm">{project.projectname}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {project.status || 'No Status'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">${project.total_budget?.toLocaleString() || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {estimates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estimates ({estimates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Project</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {estimates.map((estimate) => (
                      <tr 
                        key={estimate.estimateid} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/estimates/${estimate.estimateid}`)}
                      >
                        <td className="px-4 py-3 text-sm">{estimate.estimateid}</td>
                        <td className="px-4 py-3 text-sm">{estimate.projectname || 'None'}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {estimate.status || 'draft'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">${estimate.estimateamount?.toLocaleString() || '0'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default CustomerDetail;
