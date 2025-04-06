
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import EstimateLineItems from './EstimateLineItems';
import EstimateRevisionTimeline from './EstimateRevisionTimeline';
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
  const [revisions, setRevisions] = useState<EstimateRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRevisionId, setCurrentRevisionId] = useState<string | undefined>(data.currentRevision?.id);
  const { toast } = useToast();
  
  useEffect(() => {
    if (data.currentRevision?.id) {
      setCurrentRevisionId(data.currentRevision.id);
    }
  }, [data.currentRevision]);
  
  useEffect(() => {
    fetchRevisions();
  }, [data.estimateid]);
  
  const fetchRevisions = async () => {
    setLoading(true);
    try {
      const { data: revisionData, error } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', data.estimateid)
        .order('version', { ascending: false });
        
      if (error) throw error;
      
      setRevisions(revisionData || []);
      
      // If we don't have a current revision selected, use the first one
      if (!currentRevisionId && revisionData && revisionData.length > 0) {
        const current = revisionData.find(rev => rev.is_current) || revisionData[0];
        setCurrentRevisionId(current.id);
      }
    } catch (error) {
      console.error('Error fetching revisions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load estimate revisions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRevisionSelect = async (revisionId: string) => {
    try {
      // First, update the database to mark this as the current revision
      await supabase
        .from('estimate_revisions')
        .update({ is_current: false })
        .eq('estimate_id', data.estimateid);
        
      await supabase
        .from('estimate_revisions')
        .update({ is_current: true })
        .eq('id', revisionId);
      
      // Update local state
      setCurrentRevisionId(revisionId);
      
      // Refresh the parent component to update items for this revision
      if (onRefresh) {
        onRefresh();
      }
      
      // Also update our local revisions state
      setRevisions(prev => 
        prev.map(rev => ({
          ...rev,
          is_current: rev.id === revisionId
        }))
      );
      
      toast({
        title: 'Revision Changed',
        description: 'Now viewing the selected revision',
      });
    } catch (error) {
      console.error('Error updating revision:', error);
      toast({
        title: 'Error',
        description: 'Failed to update current revision',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
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
          
          <div className="mt-6">
            <RevisionComparePanel
              estimateId={data.estimateid}
              currentRevisionId={currentRevisionId || ''}
              revisions={revisions}
              onRevisionSelect={handleRevisionSelect}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <EstimateRevisionTimeline
                revisions={revisions}
                currentRevisionId={currentRevisionId}
                onSelectRevision={handleRevisionSelect}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EstimateDetailContent;
