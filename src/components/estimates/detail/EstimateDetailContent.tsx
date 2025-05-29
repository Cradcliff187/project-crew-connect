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
  const [showFinancialDetails, setShowFinancialDetails] = useState(false);

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-opensans">Total Amount</p>
                <p className="text-2xl font-bold font-montserrat">
                  {formatCurrency(data.estimateamount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-opensans">Status</p>
                <p className="text-lg font-semibold capitalize font-opensans">{data.status}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-opensans">Line Items</p>
                <p className="text-2xl font-bold font-montserrat">{data.items.length}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimate Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Estimate Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-opensans">Estimate ID:</span>
                <span className="font-medium font-opensans">{data.estimateid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-opensans">Customer:</span>
                <span className="font-medium font-opensans">{data.customername || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-opensans">Project:</span>
                <span className="font-medium font-opensans">{data.projectname || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-opensans">Date Created:</span>
                <span className="font-medium font-opensans">
                  {data.datecreated ? formatDate(data.datecreated) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-opensans">Version:</span>
                <span className="font-medium font-opensans">{data.current_version || 1}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-opensans">Estimate Amount:</span>
                <span className="font-medium font-opensans">
                  {formatCurrency(data.estimateamount)}
                </span>
              </div>
              {data.contingencyamount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-opensans">Contingency:</span>
                  <span className="font-medium font-opensans">
                    {formatCurrency(data.contingencyamount)}
                  </span>
                </div>
              )}
              {showFinancialDetails && data.total_cost && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-opensans">Total Cost:</span>
                    <span className="font-medium font-opensans">
                      {formatCurrency(data.total_cost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-opensans">Gross Margin:</span>
                    <span className="font-medium font-opensans">
                      {formatCurrency(data.estimateamount - data.total_cost)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-financial" className="font-opensans">
                  Show Financial Details
                </Label>
                <Switch
                  id="show-financial"
                  checked={showFinancialDetails}
                  onCheckedChange={setShowFinancialDetails}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Information */}
      {(data.sitelocationaddress || data.sitelocationcity || data.sitelocationstate) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Location</h3>
            <div className="text-sm font-opensans">
              {data.sitelocationaddress && <div>{data.sitelocationaddress}</div>}
              <div>
                {data.sitelocationcity && `${data.sitelocationcity}, `}
                {data.sitelocationstate && `${data.sitelocationstate} `}
                {data.sitelocationzip && data.sitelocationzip}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Description */}
      {data.job_description && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 font-montserrat">Description</h3>
            <p className="text-sm whitespace-pre-wrap font-opensans">{data.job_description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EstimateDetailContent;
