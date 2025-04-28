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
import { Switch } from '@/components/ui/switch';

// Type definition for individual settings (adjust if needed)
type SettingRow = {
  key: string;
  value: string;
};

const Settings = () => {
  const { toast } = useToast();
  const [loadingEmail, setLoadingEmail] = useState(true);
  const [loadingLabor, setLoadingLabor] = useState(true);
  const [emailConfig, setEmailConfig] = useState<any>({
    from_name: 'AKC LLC Estimates',
    from_email: 'estimates@akcllc.com',
    reply_to: '',
    bcc_email: '',
    signature: '',
    auto_bcc: false,
  });
  const [savingEmail, setSavingEmail] = useState(false);

  // State for Labor Settings
  const [laborSettings, setLaborSettings] = useState<Record<string, string>>({
    default_labor_cost_rate: '0',
    default_labor_bill_rate: '0',
    require_time_entry_for_labor_expense: 'false',
  });
  const [savingLabor, setSavingLabor] = useState(false);

  useEffect(() => {
    fetchEmailConfig();
    fetchLaborSettings();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      setLoadingEmail(true);

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
      setLoadingEmail(false);
    }
  };

  // Function to fetch labor settings
  const fetchLaborSettings = async () => {
    try {
      setLoadingLabor(true);
      const settingKeys = [
        'default_labor_cost_rate',
        'default_labor_bill_rate',
        'require_time_entry_for_labor_expense',
      ];
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', settingKeys);

      if (error) {
        console.error('Error fetching labor settings:', error);
        throw error;
      }

      if (data) {
        // Update state with fetched values, keeping defaults if a key is missing
        const fetchedSettings = data.reduce((acc: Record<string, string>, setting: SettingRow) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {});
        setLaborSettings(prev => ({ ...prev, ...fetchedSettings }));
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error Loading Labor Settings',
        description: 'Could not load labor configuration.',
        variant: 'destructive',
      });
    } finally {
      setLoadingLabor(false);
    }
  };

  const handleSaveEmailConfig = async () => {
    try {
      setSavingEmail(true);

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
      setSavingEmail(false);
    }
  };

  // Function to save labor settings
  const handleSaveLaborSettings = async () => {
    try {
      setSavingLabor(true);

      // Prepare upsert data for each setting key
      const upsertData = Object.entries(laborSettings).map(([key, value]) => ({
        key,
        value,
        // Add description/category if you want to set them on insert/update
      }));

      const { error } = await supabase.from('settings').upsert(upsertData, {
        onConflict: 'key', // Update if key already exists
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Settings Saved',
        description: 'Labor configuration has been updated',
        className: 'bg-[#0485ea] text-white',
      });
    } catch (error: any) {
      console.error('Error saving labor settings:', error);
      toast({
        title: 'Error Saving Settings',
        description: error.message || 'An error occurred while saving labor settings',
        variant: 'destructive',
      });
    } finally {
      setSavingLabor(false);
    }
  };

  // Helper to update labor settings state
  const handleLaborSettingChange = (key: keyof typeof laborSettings, value: string | boolean) => {
    setLaborSettings(prev => ({
      ...prev,
      [key]: String(value), // Store all as strings in state for simplicity
    }));
  };

  // Combined loading state
  const isLoading = loadingEmail || loadingLabor;

  return (
    <PageTransition>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Tabs defaultValue="email" className="w-full">
          <TabsList>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
            <TabsTrigger value="labor">Labor Settings</TabsTrigger>
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
                {isLoading ? (
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
                      disabled={savingEmail}
                    >
                      {savingEmail ? (
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

          <TabsContent value="labor" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Labor Configuration</CardTitle>
                <CardDescription>
                  Set default rates and rules for labor time tracking.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingLabor ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0485ea]" />
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="defaultCostRate">Default Labor Cost Rate ($/hr)</Label>
                        <Input
                          id="defaultCostRate"
                          type="number"
                          step="0.01"
                          value={laborSettings.default_labor_cost_rate}
                          onChange={e =>
                            handleLaborSettingChange('default_labor_cost_rate', e.target.value)
                          }
                          placeholder="e.g., 55"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="defaultBillRate">Default Labor Bill Rate ($/hr)</Label>
                        <Input
                          id="defaultBillRate"
                          type="number"
                          step="0.01"
                          value={laborSettings.default_labor_bill_rate}
                          onChange={e =>
                            handleLaborSettingChange('default_labor_bill_rate', e.target.value)
                          }
                          placeholder="e.g., 75"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <Switch
                        id="requireTimeEntry"
                        checked={laborSettings.require_time_entry_for_labor_expense === 'true'}
                        onCheckedChange={checked =>
                          handleLaborSettingChange('require_time_entry_for_labor_expense', checked)
                        }
                      />
                      <Label htmlFor="requireTimeEntry">
                        Require Time Entry for Labor Expenses
                      </Label>
                      {/* Optional: Add Tooltip/Info icon here */}
                    </div>

                    <Button
                      onClick={handleSaveLaborSettings}
                      className="bg-[#0485ea] hover:bg-[#0373ce]"
                      disabled={savingLabor}
                    >
                      {savingLabor ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Labor Settings
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
