import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  to: z.string().email({ message: 'Please enter a valid email address' }),
  cc: z
    .string()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  subject: z.string().min(1, { message: 'Subject is required' }),
  message: z.string().min(1, { message: 'Message is required' }),
});

type FormValues = z.infer<typeof formSchema>;

interface EstimateEmailTabProps {
  estimate: any;
  onEmailSent?: () => void;
}

const EstimateEmailTab: React.FC<EstimateEmailTabProps> = ({ estimate, onEmailSent }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: '',
      cc: '',
      subject: `Estimate #${estimate.estimateid.substring(4, 10)} for your review`,
      message: `Dear ${estimate.customername || 'Customer'},\n\nPlease find attached the estimate for your project. Please review and let us know if you have any questions or if you would like to proceed with the work.\n\nThank you for your business.\n\nBest regards,\nAKC LLC`,
    },
  });

  useEffect(() => {
    const fetchCustomerEmail = async () => {
      try {
        if (estimate.customerid) {
          const { data, error } = await supabase
            .from('customers')
            .select('contactemail')
            .eq('customerid', estimate.customerid)
            .single();

          if (data && !error) {
            setCustomerEmail(data.contactemail || '');
            form.setValue('to', data.contactemail || '');
          }
        }
      } catch (error) {
        console.error('Error fetching customer email:', error);
      }
    };

    fetchCustomerEmail();
  }, [estimate.customerid]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      // In a real implementation, this would call an edge function to send the email
      // For now, we'll just simulate a successful email send
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Email sent successfully',
        description: 'The estimate has been emailed to the customer.',
        variant: 'default',
      });

      // Update estimate status to 'sent' if it's in 'draft'
      if (estimate.status === 'draft') {
        const { error } = await supabase
          .from('estimates')
          .update({
            status: 'sent',
            sentdate: new Date().toISOString(),
          })
          .eq('estimateid', estimate.estimateid);

        if (error) {
          console.error('Error updating estimate status:', error);
        } else if (onEmailSent) {
          onEmailSent();
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Failed to send email',
        description: 'There was a problem sending the email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Email Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <Input placeholder="customer@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CC</FormLabel>
                    <FormControl>
                      <Input placeholder="colleague@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#0485ea] hover:bg-[#0373ce]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Email History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2" />
            <p>No emails have been sent for this estimate yet.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimateEmailTab;
