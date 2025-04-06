
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import EstimateLineItems from './EstimateLineItems';
import { supabase } from '@/integrations/supabase/client';
import { EstimateRevision } from '../types/estimateTypes';
import RevisionComparePanel from './RevisionComparePanel';

interface EstimateDetailContentProps {
  data: {
    estimateid: string;
    customerid?: string;
    customername?: string;
    projectid?: string;
    projectname?: string;
    job_description?: string;
    estimateamount: number;
    contingencyamount?: number;
    contingency_percentage?: number;
    datecreated?: string;
    sentdate?: string;
    approveddate?: string;
    status: string;
    sitelocationaddress?: string;
    sitelocationcity?: string;
    sitelocationstate?: string;
    sitelocationzip?: string;
    items: {
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      revision_id?: string;
    }[];
    currentRevision?: {
      id: string;
      version: number;
      revision_date: string;
    };
  };
  onRefresh?: () => void;
}

const EstimateDetailContent: React.FC<EstimateDetailContentProps> = ({ data, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('line-items');
  const { toast } = useToast();
  
  return (
    <div>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estimate Details</CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="line-items">Line Items</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="line-items" className="mt-6">
                <EstimateLineItems items={data.items} />
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Client Information</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Client Name</div>
                        <div className="text-sm">{data.customername || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Project</div>
                        <div className="text-sm">{data.projectname || 'Not attached to a project'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Site Location</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-muted-foreground">Address</div>
                        <div className="text-sm">{data.sitelocationaddress || 'Not specified'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">City, State, Zip</div>
                        <div className="text-sm">
                          {[
                            data.sitelocationcity,
                            data.sitelocationstate,
                            data.sitelocationzip
                          ].filter(Boolean).join(', ') || 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <div className="text-sm border rounded-md p-3 bg-slate-50">
                      {data.job_description || 'No description available'}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EstimateDetailContent;
