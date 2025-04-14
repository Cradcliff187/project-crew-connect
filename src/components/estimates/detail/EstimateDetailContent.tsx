import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

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
    }[];
  };
  onRefresh?: () => void;
}

const EstimateDetailContent: React.FC<EstimateDetailContentProps> = ({ data, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatLocation = () => {
    const parts = [
      data.sitelocationaddress,
      data.sitelocationcity,
      data.sitelocationstate,
      data.sitelocationzip,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.total_price, 0);
  const contingencyAmount = data.contingencyamount || 0;
  const total = subtotal + contingencyAmount;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Estimate Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Client Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Client Name:</span>
                  <p>{data.customername || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Created Date:</span>
                  <p>{data.datecreated ? formatDate(data.datecreated) : 'Not specified'}</p>
                </div>
                {data.sentdate && (
                  <div>
                    <span className="text-sm text-muted-foreground">Sent Date:</span>
                    <p>{formatDate(data.sentdate)}</p>
                  </div>
                )}
                {data.approveddate && (
                  <div>
                    <span className="text-sm text-muted-foreground">Approved Date:</span>
                    <p>{formatDate(data.approveddate)}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Job Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Project Name:</span>
                  <p>{data.projectname || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <p>{formatLocation()}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="whitespace-pre-wrap">
                    {data.job_description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Financial Summary</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Contingency ({data.contingency_percentage || 0}%):</span>
                <span>{formatCurrency(contingencyAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-dashed pt-2 mt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          {data.items.length === 0 ? (
            <p className="text-muted-foreground">No items in this estimate</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left font-medium">Description</th>
                    <th className="p-2 text-right font-medium">Quantity</th>
                    <th className="p-2 text-right font-medium">Unit Price</th>
                    <th className="p-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={item.id || index} className="border-t">
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.total_price)}</td>
                    </tr>
                  ))}

                  {/* Summary rows */}
                  <tr className="border-t">
                    <td colSpan={3} className="p-2 text-right font-medium">
                      Subtotal:
                    </td>
                    <td className="p-2 text-right">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-2 text-right text-muted-foreground">
                      Contingency ({data.contingency_percentage || 0}%):
                    </td>
                    <td className="p-2 text-right text-muted-foreground">
                      {formatCurrency(contingencyAmount)}
                    </td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td colSpan={3} className="p-2 text-right font-medium">
                      Total:
                    </td>
                    <td className="p-2 text-right font-medium">{formatCurrency(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimateDetailContent;
