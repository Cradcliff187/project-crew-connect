import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';

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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (error || !customer) {
    return (
      <PageTransition>
        <div className="space-y-4">
          <PageHeader title="Error Loading Customer" />
          <p className="text-red-500">{error || 'Customer not found'}</p>
          <Button onClick={() => navigate('/customers')} variant="default">
            Back to Customers
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title={customer.customername || 'Customer Details'}>
          <Badge
            variant={customer.status === 'ACTIVE' ? 'default' : 'outline'}
            className="capitalize"
          >
            {customer.status || 'No Status'}
          </Badge>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {customer.contactemail && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      <a
                        href={`mailto:${customer.contactemail}`}
                        className="text-primary hover:underline"
                      >
                        {customer.contactemail}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      <a href={`tel:${customer.phone}`} className="hover:text-primary">
                        {customer.phone}
                      </a>
                    </p>
                  </div>
                </div>
              )}

              {(customer.address || customer.city || customer.state || customer.zip) && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.address && <div>{customer.address}</div>}
                      <div>
                        {customer.city || ''}
                        {customer.city && customer.state ? ', ' : ''}
                        {customer.state || ''}
                        {(customer.city || customer.state) && customer.zip ? ' ' : ''}
                        {customer.zip || ''}
                      </div>
                      {!customer.address &&
                        !customer.city &&
                        !customer.state &&
                        !customer.zip &&
                        'Not specified'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Projects ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="border rounded-md">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => (
                    <TableRow
                      key={project.projectid}
                      className="cursor-pointer"
                      onClick={() => navigate(`/projects/${project.projectid}`)}
                    >
                      <TableCell>{project.projectid}</TableCell>
                      <TableCell>{project.projectname}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {project.status || 'No Status'}
                        </Badge>
                      </TableCell>
                      <TableCell>${project.total_budget?.toLocaleString() || '0'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {estimates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estimates ({estimates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="border rounded-md">
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estimates.map(estimate => (
                    <TableRow
                      key={estimate.estimateid}
                      className="cursor-pointer"
                      onClick={() => navigate(`/estimates/${estimate.estimateid}`)}
                    >
                      <TableCell>{estimate.estimateid}</TableCell>
                      <TableCell>{estimate.projectname || 'None'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {estimate.status || 'draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>${estimate.estimateamount?.toLocaleString() || '0'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default CustomerDetail;
