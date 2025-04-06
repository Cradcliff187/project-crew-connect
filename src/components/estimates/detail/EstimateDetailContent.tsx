
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EstimateLineItems from './EstimateLineItems';
import RevisionComparePanel from './RevisionComparePanel';
import EstimateFinancialSummary from './EstimateFinancialSummary';
import { calculateEstimateTotals, calculateContingency, calculateGrandTotal } from '../utils/estimateCalculations';

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
      cost?: number;
      markup_percentage?: number;
      markup_amount?: number;
      revision_id?: string;
      gross_margin?: number;
      gross_margin_percentage?: number;
    }[];
    currentRevision?: {
      id: string;
      version: number;
      revision_date: string;
      pdf_document_id?: string;
    };
  };
  onRefresh?: () => void;
}

const EstimateDetailContent: React.FC<EstimateDetailContentProps> = ({ data, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('line-items');
  
  // Calculate financial numbers
  const { subtotal, totalCost } = calculateEstimateTotals(data.items);
  
  const contingencyPercentage = data.contingency_percentage || 0;
  const contingencyAmount = data.contingencyamount || calculateContingency(subtotal, contingencyPercentage);
  const grandTotal = calculateGrandTotal(subtotal, contingencyAmount);
  
  return (
    <div className="space-y-6">
      {/* Financial Summary Section */}
      <EstimateFinancialSummary
        subtotal={subtotal}
        totalCost={totalCost}
        contingencyAmount={contingencyAmount}
        contingencyPercentage={contingencyPercentage}
        grandTotal={grandTotal}
      />

      {/* Tabbed Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estimate Details</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="line-items">Line Items</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="compare">Compare Revisions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line-items" className="mt-6">
              <EstimateLineItems items={data.items} showFinancials={true} />
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
            
            <TabsContent value="compare" className="mt-6">
              <RevisionComparePanel estimateId={data.estimateid} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimateDetailContent;
