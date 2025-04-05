
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, RefreshCcw, Mail } from 'lucide-react';

interface EmailConfig {
  from_email: string;
  from_name: string;
  bcc_email: string;
  auto_bcc: boolean;
  reply_to: string;
  signature: string;
}

const EmailConfigurationCard: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    from_email: 'estimates@akcllc.com',
    from_name: 'AKC LLC Estimates',
    bcc_email: '',
    auto_bcc: false,
    reply_to: '',
    signature: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimate_email_config')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading email configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load email configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      // Check if a record exists
      const { data: existingConfig } = await supabase
        .from('estimate_email_config')
        .select('id')
        .maybeSingle();

      let result;
      if (existingConfig) {
        // Update
        result = await supabase
          .from('estimate_email_config')
          .update(config)
          .eq('id', existingConfig.id);
      } else {
        // Insert
        result = await supabase
          .from('estimate_email_config')
          .insert(config);
      }

      if (result.error) throw result.error;

      toast({
        title: 'Configuration Saved',
        description: 'Email settings have been updated successfully',
        className: 'bg-[#0485ea] text-white',
      });
    } catch (error: any) {
      console.error('Error saving email configuration:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save email configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReload = () => {
    loadEmailConfig();
  };

  const handleInputChange = (field: keyof EmailConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-[#0485ea]" />
          Email Configuration
        </CardTitle>
        {!isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReload}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={config.from_name}
                  onChange={(e) => handleInputChange('from_name', e.target.value)}
                  placeholder="AKC LLC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  value={config.from_email}
                  onChange={(e) => handleInputChange('from_email', e.target.value)}
                  placeholder="estimates@akcllc.com"
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="replyTo">Reply-To Address (Optional)</Label>
                <Input
                  id="replyTo"
                  value={config.reply_to}
                  onChange={(e) => handleInputChange('reply_to', e.target.value)}
                  placeholder="support@akcllc.com"
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bccEmail">BCC Email (Optional)</Label>
                <Input
                  id="bccEmail"
                  value={config.bcc_email}
                  onChange={(e) => handleInputChange('bcc_email', e.target.value)}
                  placeholder="records@akcllc.com"
                  type="email"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoBcc"
                checked={config.auto_bcc}
                onCheckedChange={(checked) => handleInputChange('auto_bcc', !!checked)}
              />
              <Label htmlFor="autoBcc">
                Automatically BCC all estimate emails to the BCC address
              </Label>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="bg-[#0485ea] hover:bg-[#0373ce]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailConfigurationCard;
