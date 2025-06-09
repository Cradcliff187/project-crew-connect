import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import EstimatesTable, { EstimateType } from '@/components/estimates/EstimatesTable';
import EstimatesHeader from '@/components/estimates/EstimatesHeader';
import { useEstimates } from '@/components/estimates/hooks/useEstimates.tsx';
import { StatusType } from '@/types/common';
import { formatDate } from '@/lib/utils';

/**
 * Estimates page component for listing and managing estimates
 * Navigates to the detail page for viewing estimate details
 */
const Estimates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const { estimates, loading, error, fetchEstimates } = useEstimates();

  const handleViewEstimate = (estimate: EstimateType) => {
    navigate(`/estimates/${estimate.id}`);
  };

  // Calculate metrics for summary cards
  const totalEstimates = estimates.length;
  const pendingApproval = estimates.filter(
    est => est.status === 'PENDING' || est.status === 'DRAFT'
  ).length;
  const totalValue = estimates.reduce((sum, est) => sum + (est.amount || 0), 0);
  const thisMonthEstimates = estimates.filter(est => {
    if (!est.date) return false;
    const created = new Date(est.date);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  console.log(
    '[Estimates Page] Rendering with searchQuery:',
    searchQuery,
    'Estimates count:',
    estimates.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center font-montserrat">
              <FileText className="h-8 w-8 mr-3 text-blue-600" />
              Estimates Management
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 font-opensans"
            >
              {user?.role || 'User'}
            </Badge>
          </div>
          <p className="text-gray-600 font-opensans">Create and manage project estimates</p>
        </div>

        {/* Summary Cards - Horizontal Layout for Desktop */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium font-opensans">Total Estimates</p>
                  <p className="text-2xl font-bold text-blue-900 font-montserrat">
                    {totalEstimates}
                  </p>
                </div>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium font-opensans">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 font-montserrat">
                    {pendingApproval}
                  </p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium font-opensans">Total Value</p>
                  <p className="text-2xl font-bold text-green-900 font-montserrat">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium font-opensans">This Month</p>
                  <p className="text-2xl font-bold text-purple-900 font-montserrat">
                    {thisMonthEstimates}
                  </p>
                </div>
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Maximum Space for Financial Data */}
        <PageTransition>
          <div className="flex flex-col">
            <EstimatesHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <div className="mt-4">
              <EstimatesTable
                estimates={estimates}
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                onViewEstimate={handleViewEstimate}
                formatDate={formatDate}
                onRefreshEstimates={fetchEstimates}
              />
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
};

export default Estimates;
