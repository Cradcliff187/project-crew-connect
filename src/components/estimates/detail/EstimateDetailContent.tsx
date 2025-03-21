
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
          <TabsList>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
          </TabsList>
          <TabsContent value="items" className="mt-6">
            <EstimateItemsContent 
              items={data.items} 
              subtotal={(data.estimateamount - (data.contingencyamount || 0))}
              contingencyAmount={data.contingencyamount}
              contingencyPercentage={data.contingency_percentage}
              total={data.estimateamount}
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
