import { useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmailTemplatesManager from '@/components/estimates/email/EmailTemplatesManager';
import EmailConfigurationCard from '@/components/estimates/email/EmailConfigurationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EstimateEmailSettings = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/estimates')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Estimates
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Estimate Email Settings</h1>
          </div>
        </div>

        <div className="grid gap-6">
          <EmailConfigurationCard />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-1.5">
                <Info className="h-4 w-4 text-[#0485ea]" />
                Available Template Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You can use the following variables in your email templates to personalize
                  messages:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border rounded-md p-3">
                    <code className="font-mono text-sm bg-slate-100 px-1 py-0.5">
                      {'{{clientName}}'}
                    </code>
                    <p className="text-sm mt-1">The client's name</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <code className="font-mono text-sm bg-slate-100 px-1 py-0.5">
                      {'{{revisionNumber}}'}
                    </code>
                    <p className="text-sm mt-1">The estimate revision number</p>
                  </div>
                  <div className="border rounded-md p-3">
                    <code className="font-mono text-sm bg-slate-100 px-1 py-0.5">
                      {'{{estimateId}}'}
                    </code>
                    <p className="text-sm mt-1">The estimate ID</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <EmailTemplatesManager />
        </div>
      </div>
    </PageTransition>
  );
};

export default EstimateEmailSettings;
