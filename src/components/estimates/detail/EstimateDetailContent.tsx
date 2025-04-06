
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EstimateInfoCard from './cards/EstimateInfoCard';
import EstimateItemsContent from './content/EstimateItemsContent';
import EstimateDescriptionContent from './content/EstimateDescriptionContent';
import EstimateBudgetIntegration from '../EstimateBudgetIntegration';

interface EstimateDetailContentProps {
  data: {
    estimateid: string;
    customerid?: string;
    customername?: string;
    projectid?: string;
    projectname?: string;
    datecreated?: string;
    sentdate?: string;
    approveddate?: string;
    status: string;
    job_description?: string;
    estimateamount: number;
    contingencyamount?: number;
    contingency_percentage?: number;
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
    }[];
  };
  onRefresh?: () => void;
}

const EstimateDetailContent: React.FC<EstimateDetailContentProps> = ({ data, onRefresh }) => {
  const [showFinancialDetails, setShowFinancialDetails] = useState(false);
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <EstimateInfoCard data={data} />
        
        {data.status === 'converted' && data.projectid && (
          <EstimateBudgetIntegration 
            estimateId={data.estimateid}
            projectId={data.projectid}
            onComplete={onRefresh}
          />
        )}
      </div>
      
      <div className="md:col-span-2">
        <Tabs defaultValue="items">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="items">Line Items</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="show-financials" className="text-sm">
                Show Financial Details
              </Label>
              <Switch
                id="show-financials"
                checked={showFinancialDetails}
                onCheckedChange={setShowFinancialDetails}
              />
            </div>
          </div>
          
          <TabsContent value="items" className="mt-6">
            <EstimateItemsContent 
              items={data.items} 
              subtotal={(data.estimateamount - (data.contingencyamount || 0))}
              contingencyAmount={data.contingencyamount}
              contingencyPercentage={data.contingency_percentage}
              total={data.estimateamount}
              showFinancialDetails={showFinancialDetails}
            />
          </TabsContent>
          <TabsContent value="description" className="mt-6">
            <EstimateDescriptionContent description={data.job_description} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EstimateDetailContent;
