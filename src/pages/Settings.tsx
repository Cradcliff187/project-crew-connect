import React, { useState, useEffect } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [emailConfig, setEmailConfig] = useState<any>({
    from_name: 'AKC LLC Estimates',
    from_email: 'estimates@akcllc.com',
    reply_to: '',
    bcc_email: '',
    signature: '',
    auto_bcc: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmailConfig();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('estimate_email_config')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email config:', error);
      }

      if (data) {
        setEmailConfig(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmailConfig = async () => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('estimate_email_config')
        .upsert({
          ...emailConfig,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setEmailConfig(data);

      toast({
        title: 'Settings Saved',
        description: 'Email configuration has been updated',
        className: 'bg-[#0485ea] text-white',
      });
    } catch (error: any) {
      console.error('Error saving email config:', error);

      toast({
        title: 'Error Saving Settings',
        description: error.message || 'An error occurred while saving settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Tabs defaultValue="email" className="w-full">
          <TabsList>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="company">Company Information</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>
                  Configure the email settings for estimate communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <Input
                          id="fromName"
                          value={emailConfig.from_name}
                          onChange={e =>
                            setEmailConfig({ ...emailConfig, from_name: e.target.value })
                          }
                          placeholder="Company Name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">From Email</Label>
                        <Input
                          id="fromEmail"
                          type="email"
                          value={emailConfig.from_email}
                          onChange={e =>
                            setEmailConfig({ ...emailConfig, from_email: e.target.value })
                          }
                          placeholder="estimates@yourcompany.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="replyTo">Reply-To Email</Label>
                        <Input
                          id="replyTo"
                          type="email"
                          value={emailConfig.reply_to || ''}
                          onChange={e =>
                            setEmailConfig({ ...emailConfig, reply_to: e.target.value })
                          }
                          placeholder="Optional"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bccEmail">BCC Email</Label>
                        <Input
                          id="bccEmail"
                          type="email"
                          value={emailConfig.bcc_email || ''}
                          onChange={e =>
                            setEmailConfig({ ...emailConfig, bcc_email: e.target.value })
                          }
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signature">Email Signature</Label>
                      <textarea
                        id="signature"
                        className="w-full h-32 p-2 border rounded-md"
                        value={emailConfig.signature || ''}
                        onChange={e =>
                          setEmailConfig({ ...emailConfig, signature: e.target.value })
                        }
                        placeholder="Your email signature"
                      />
                    </div>

                    <Button
                      onClick={handleSaveEmailConfig}
                      className="bg-[#0485ea] hover:bg-[#0373ce]"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details used in documents and emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                  Company information settings coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
};

export default Settings;
