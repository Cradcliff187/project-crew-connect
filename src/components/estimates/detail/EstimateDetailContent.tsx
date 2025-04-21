import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, DollarSign } from 'lucide-react';

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
    current_revision_id?: string;
    current_version?: number;
    total_cost?: number;
    items: {
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      cost?: number;
      markup_percentage?: number;
    }[];
  };
  onRefresh?: () => void;
}

const EstimateDetailContent: React.FC<EstimateDetailContentProps> = ({ data, onRefresh }) => {
  const [detailViewMode, setDetailViewMode] = useState<'internal' | 'customer'>('internal');

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
  const subtotal = data.items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const contingencyAmount = data.contingencyamount || 0;
  const total = subtotal + contingencyAmount;

  // Check if item data seems complete for cost calculation
  const hasItemData = data.items && data.items.length > 0;
  // Optionally, be more specific: check if at least one item has a non-zero cost
  // const hasCostData = hasItemData && data.items.some(item => Number(item.cost) > 0);
  // For now, just checking if items array exists and is not empty

  // Calculate cost and margins only if item data is present
  const totalCost = hasItemData
    ? data.total_cost ||
      data.items.reduce((sum, item) => {
        const itemQuantity = Number(item.quantity) || 0;
        const itemCost = Number(item.cost) || 0;
        return sum + itemCost * itemQuantity;
      }, 0)
    : 0; // Default to 0 if no items

  const grossMargin = hasItemData ? subtotal - totalCost : 0;
  const grossMarginPercentage = hasItemData && subtotal > 0 ? (grossMargin / subtotal) * 100 : 0;

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <div className="flex items-center space-x-2">
            <DollarSign
              className={`h-4 w-4 ${detailViewMode === 'internal' ? 'text-primary' : 'text-muted-foreground'}`}
            />
            <Label
              htmlFor="view-mode-toggle"
              className={`text-sm font-medium ${detailViewMode === 'internal' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Internal View
            </Label>
            <Switch
              id="view-mode-toggle"
              checked={detailViewMode === 'customer'}
              onCheckedChange={checked => setDetailViewMode(checked ? 'customer' : 'internal')}
            />
            <Label
              htmlFor="view-mode-toggle"
              className={`text-sm font-medium ${detailViewMode === 'customer' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Customer View
            </Label>
            <Eye
              className={`h-4 w-4 ${detailViewMode === 'customer' ? 'text-primary' : 'text-muted-foreground'}`}
            />
          </div>
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
                    {/* Conditionally show internal financial headers */}
                    {detailViewMode === 'internal' && (
                      <>
                        <th className="p-2 text-right font-medium">Cost</th>
                        <th className="p-2 text-right font-medium">Markup %</th>
                      </>
                    )}
                    <th className="p-2 text-right font-medium">Unit Price</th>
                    {/* Conditionally show internal financial headers */}
                    {detailViewMode === 'internal' && (
                      <>
                        <th className="p-2 text-right font-medium">Margin</th>
                        <th className="p-2 text-right font-medium">Margin %</th>
                      </>
                    )}
                    <th className="p-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => {
                    // Calculate per-item margin
                    const itemCost = Number(item.cost) || 0;
                    const itemQuantity = Number(item.quantity) || 0;
                    const itemTotalPrice = Number(item.total_price) || 0;
                    const itemTotalCost = itemCost * itemQuantity;
                    const itemMargin = itemTotalPrice - itemTotalCost;
                    const itemMarginPercent =
                      itemTotalPrice > 0 ? (itemMargin / itemTotalPrice) * 100 : 0;
                    const itemMarkupPercent = item.markup_percentage; // Assuming markup % is directly available

                    return (
                      <tr key={item.id || index} className="border-t">
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-right">{itemQuantity}</td>
                        {/* Conditionally show internal financial cells */}
                        {detailViewMode === 'internal' && (
                          <>
                            <td className="p-2 text-right">{formatCurrency(itemCost)}</td>
                            <td className="p-2 text-right">
                              {itemMarkupPercent !== undefined ? `${itemMarkupPercent}%` : 'N/A'}
                            </td>
                          </>
                        )}
                        <td className="p-2 text-right">{formatCurrency(item.unit_price)}</td>
                        {/* Conditionally show internal financial cells */}
                        {detailViewMode === 'internal' && (
                          <>
                            <td className="p-2 text-right">{formatCurrency(itemMargin)}</td>
                            <td className="p-2 text-right">{`${itemMarginPercent.toFixed(1)}%`}</td>
                          </>
                        )}
                        <td className="p-2 text-right">{formatCurrency(itemTotalPrice)}</td>
                      </tr>
                    );
                  })}

                  {/* Summary rows - Conditional Rendering based on view mode */}
                  <tr className="border-t">
                    {/* Adjust colspan based on view mode */}
                    <td
                      colSpan={detailViewMode === 'internal' ? 6 : 3}
                      className="p-2 text-right font-medium"
                    >
                      Subtotal:
                    </td>
                    <td className="p-2 text-right">{formatCurrency(subtotal)}</td>
                  </tr>

                  {/* Internal Only Rows */}
                  {detailViewMode === 'internal' && (
                    <>
                      {/* Total Cost */}
                      <tr className="border-t border-dashed">
                        {/* Adjust colspan based on view mode */}
                        <td colSpan={6} className="p-2 text-right text-sm text-muted-foreground">
                          Total Cost:
                        </td>
                        <td className="p-2 text-right text-sm text-muted-foreground">
                          {hasItemData ? formatCurrency(totalCost) : 'Calculating...'}
                        </td>
                      </tr>
                      {/* Gross Margin */}
                      <tr className="border-t border-dashed">
                        {/* Adjust colspan based on view mode */}
                        <td colSpan={6} className="p-2 text-right text-sm text-muted-foreground">
                          Gross Margin:
                        </td>
                        <td className="p-2 text-right text-sm text-muted-foreground">
                          {hasItemData ? formatCurrency(grossMargin) : 'Calculating...'}
                        </td>
                      </tr>
                      {/* Gross Margin Percentage */}
                      <tr>
                        {/* Adjust colspan based on view mode */}
                        <td
                          colSpan={6}
                          className="p-2 pt-0 text-right text-xs text-muted-foreground"
                        >
                          Gross Margin %:
                        </td>
                        <td className="p-2 pt-0 text-right text-xs text-muted-foreground">
                          {hasItemData ? `${grossMarginPercentage.toFixed(1)}%` : 'Calculating...'}
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Always Visible Rows */}
                  <tr>
                    {/* Adjust colspan based on view mode */}
                    <td
                      colSpan={detailViewMode === 'internal' ? 6 : 3}
                      className="p-2 text-right text-muted-foreground"
                    >
                      Contingency ({data.contingency_percentage || 0}%):
                    </td>
                    <td className="p-2 text-right text-muted-foreground">
                      {formatCurrency(contingencyAmount)}
                    </td>
                  </tr>
                  <tr className="bg-muted/50">
                    {/* Adjust colspan based on view mode */}
                    <td
                      colSpan={detailViewMode === 'internal' ? 6 : 3}
                      className="p-2 text-right font-medium"
                    >
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
