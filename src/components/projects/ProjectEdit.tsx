import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { projectFormSchema, type ProjectFormValues } from './schemas/projectFormSchema';
import { statusOptions } from './ProjectConstants';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectEdit = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [useDifferentSiteLocation, setUseDifferentSiteLocation] = useState(false);

  // Initialize form
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      projectName: '',
      customerId: '',
      jobDescription: '',
      status: 'active',
      dueDate: undefined,
      siteLocationSameAsCustomer: true,
      siteLocation: {
        address: '',
        city: '',
        state: '',
        zip: '',
      },
      newCustomer: {
        customerName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
      },
    },
  });

  // Fetch project and customers data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('projectid', projectId)
          .single();

        if (projectError) throw projectError;

        // Fetch customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('customerid, customername')
          .order('customername');

        if (customersError) throw customersError;

        // Set customers data
        setCustomers(
          customersData?.map(c => ({ id: c.customerid, name: c.customername || '' })) || []
        );

        // Determine if site location is different from customer address
        const hasSiteLocation = !!(
          projectData.sitelocationaddress ||
          projectData.sitelocationcity ||
          projectData.sitelocationstate ||
          projectData.sitelocationzip
        );

        setUseDifferentSiteLocation(hasSiteLocation);

        // Set form values from project data
        form.reset({
          projectName: projectData.projectname || '',
          customerId: projectData.customerid || '',
          jobDescription: projectData.jobdescription || '',
          status: projectData.status || 'active',
          dueDate: projectData.due_date || undefined,
          siteLocationSameAsCustomer: !hasSiteLocation,
          siteLocation: {
            address: projectData.sitelocationaddress || '',
            city: projectData.sitelocationcity || '',
            state: projectData.sitelocationstate || '',
            zip: projectData.sitelocationzip || '',
          },
          newCustomer: {
            customerName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip: '',
          },
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error loading project',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId, form]);

  // Handle site location checkbox change
  useEffect(() => {
    if (!useDifferentSiteLocation) {
      form.setValue('siteLocationSameAsCustomer', true);
    } else {
      form.setValue('siteLocationSameAsCustomer', false);
    }
  }, [useDifferentSiteLocation, form]);

  const handleSubmit = async (data: ProjectFormValues) => {
    if (!projectId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          projectname: data.projectName,
          customerid: data.customerId,
          jobdescription: data.jobDescription,
          status: data.status,
          due_date: data.dueDate,
          sitelocationaddress: data.siteLocationSameAsCustomer ? null : data.siteLocation.address,
          sitelocationcity: data.siteLocationSameAsCustomer ? null : data.siteLocation.city,
          sitelocationstate: data.siteLocationSameAsCustomer ? null : data.siteLocation.state,
          sitelocationzip: data.siteLocationSameAsCustomer ? null : data.siteLocation.zip,
        })
        .eq('projectid', projectId);

      if (error) throw error;

      toast({
        title: 'Project updated',
        description: `${data.projectName} has been updated successfully.`,
      });

      navigate(`/projects/${projectId}`);
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error updating project',
        description: error.message || 'There was an error updating the project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
            <Button variant="outline" onClick={handleBackClick} className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>

            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <Button variant="outline" onClick={handleBackClick} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Project</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="projectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer*</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(customer => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Project Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={`w-full pl-3 text-left font-normal ${!field.value && 'text-muted-foreground'}`}
                                >
                                  {field.value ? (
                                    format(new Date(field.value), 'PPP')
                                  ) : (
                                    <span>Select a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={date =>
                                  field.onChange(date ? date.toISOString() : undefined)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter job description"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="different-site"
                      checked={useDifferentSiteLocation}
                      onCheckedChange={checked => setUseDifferentSiteLocation(checked as boolean)}
                    />
                    <label htmlFor="different-site" className="text-sm font-medium leading-none">
                      Site location is different from customer address
                    </label>
                  </div>

                  {useDifferentSiteLocation && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Site Location</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="siteLocation.address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="siteLocation.city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="siteLocation.state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter state" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="siteLocation.zip"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter ZIP code" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackClick}
                      className="mr-2"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#0485ea] hover:bg-[#0375d1]"
                      disabled={submitting}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </PageTransition>
  );
};

export default ProjectEdit;
