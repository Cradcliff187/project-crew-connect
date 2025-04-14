import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RevisionFinancialComparisonProps {
  estimateId: string;
  currentRevisionId: string;
  compareRevisionId: string;
}

const RevisionFinancialComparison: React.FC<RevisionFinancialComparisonProps> = ({
  estimateId,
  currentRevisionId,
  compareRevisionId,
}) => {
  const [loading, setLoading] = useState(true);
  const [currentRevision, setCurrentRevision] = useState<any>(null);
  const [compareRevision, setCompareRevision] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentItems, setCurrentItems] = useState<any[]>([]);
  const [compareItems, setCompareItems] = useState<any[]>([]);
  const [revisionMetrics, setRevisionMetrics] = useState<any>({
    totalDifference: 0,
    percentChange: 0,
    categorySummary: [],
    marginComparison: {
      current: { margin: 0, percentage: 0 },
      previous: { margin: 0, percentage: 0 },
      difference: 0,
    },
  });

  // Color palette for charts
  const COLORS = ['#0485ea', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    if (currentRevisionId && compareRevisionId) {
      fetchRevisionData();
    }
  }, [currentRevisionId, compareRevisionId]);

  const fetchRevisionData = async () => {
    try {
      setLoading(true);

      // Fetch revision data
      const { data: currentRevData, error: currError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', currentRevisionId)
        .single();

      if (currError) throw currError;
      setCurrentRevision(currentRevData);

      const { data: compareRevData, error: compError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('id', compareRevisionId)
        .single();

      if (compError) throw compError;
      setCompareRevision(compareRevData);

      // Fetch items for both revisions
      const { data: currentItemsData, error: currItemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', currentRevisionId);

      if (currItemsError) throw currItemsError;
      setCurrentItems(currentItemsData || []);

      const { data: compareItemsData, error: compItemsError } = await supabase
        .from('estimate_items')
        .select('*')
        .eq('revision_id', compareRevisionId);

      if (compItemsError) throw compItemsError;
      setCompareItems(compareItemsData || []);

      // Process the data for visualization
      calculateMetrics(
        currentRevData,
        compareRevData,
        currentItemsData || [],
        compareItemsData || []
      );
    } catch (error) {
      console.error('Error fetching revision data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (
    currentRev: any,
    compareRev: any,
    currentItems: any[],
    compareItems: any[]
  ) => {
    // Calculate overall financial differences
    const currentTotal = currentRev.amount || 0;
    const compareTotal = compareRev.amount || 0;
    const totalDifference = currentTotal - compareTotal;
    const percentChange = compareTotal > 0 ? (totalDifference / compareTotal) * 100 : 0;

    // Calculate costs and margins
    const currentCost = currentItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const compareCost = compareItems.reduce((sum, item) => sum + (item.cost || 0), 0);

    const currentMargin = currentTotal - currentCost;
    const compareMargin = compareTotal - compareCost;

    const currentMarginPercentage = currentTotal > 0 ? (currentMargin / currentTotal) * 100 : 0;
    const compareMarginPercentage = compareTotal > 0 ? (compareMargin / compareTotal) * 100 : 0;

    // Group items by category and calculate differences
    const categories = [
      ...new Set([
        ...currentItems.map(item => item.item_type || 'Other'),
        ...compareItems.map(item => item.item_type || 'Other'),
      ]),
    ];

    const categorySummary = categories
      .map(category => {
        const currentCategoryItems = currentItems.filter(
          item => (item.item_type || 'Other') === category
        );
        const compareCategoryItems = compareItems.filter(
          item => (item.item_type || 'Other') === category
        );

        const currentCategoryTotal = currentCategoryItems.reduce(
          (sum, item) => sum + item.total_price,
          0
        );
        const compareCategoryTotal = compareCategoryItems.reduce(
          (sum, item) => sum + item.total_price,
          0
        );
        const categoryDifference = currentCategoryTotal - compareCategoryTotal;

        return {
          name: category,
          currentValue: currentCategoryTotal,
          previousValue: compareCategoryTotal,
          difference: categoryDifference,
          percentChange:
            compareCategoryTotal > 0
              ? (categoryDifference / compareCategoryTotal) * 100
              : currentCategoryTotal > 0
                ? 100
                : 0,
        };
      })
      .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

    // Prepare data for pie chart comparison
    const pieChartData = {
      current: categories
        .map(category => {
          const categoryItems = currentItems.filter(
            item => (item.item_type || 'Other') === category
          );
          return {
            name: category,
            value: categoryItems.reduce((sum, item) => sum + item.total_price, 0),
          };
        })
        .filter(item => item.value > 0),

      compare: categories
        .map(category => {
          const categoryItems = compareItems.filter(
            item => (item.item_type || 'Other') === category
          );
          return {
            name: category,
            value: categoryItems.reduce((sum, item) => sum + item.total_price, 0),
          };
        })
        .filter(item => item.value > 0),
    };

    setRevisionMetrics({
      totalDifference,
      percentChange,
      categorySummary,
      pieChartData,
      marginComparison: {
        current: { margin: currentMargin, percentage: currentMarginPercentage },
        previous: { margin: compareMargin, percentage: compareMarginPercentage },
        difference: currentMargin - compareMargin,
      },
    });
  };

  const renderFinancialOverview = () => {
    if (!currentRevision || !compareRevision) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className={revisionMetrics.totalDifference >= 0 ? 'border-green-200' : 'border-red-200'}
          >
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Total Change</div>
                <div
                  className={`text-2xl font-semibold mt-2 ${revisionMetrics.totalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(revisionMetrics.totalDifference)}
                </div>
                <div className="flex items-center mt-1">
                  {revisionMetrics.percentChange > 0 ? (
                    <ChevronUp className="h-4 w-4 text-green-600" />
                  ) : revisionMetrics.percentChange < 0 ? (
                    <ChevronDown className="h-4 w-4 text-red-600" />
                  ) : null}
                  <span
                    className={`text-sm ${revisionMetrics.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {revisionMetrics.percentChange > 0 ? '+' : ''}
                    {revisionMetrics.percentChange.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t text-sm flex justify-between">
                  <span>Previous: {formatCurrency(compareRevision.amount || 0)}</span>
                  <span>Current: {formatCurrency(currentRevision.amount || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              revisionMetrics.marginComparison.difference >= 0
                ? 'border-green-200'
                : 'border-red-200'
            }
          >
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Margin Change</div>
                <div
                  className={`text-2xl font-semibold mt-2 ${revisionMetrics.marginComparison.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatCurrency(revisionMetrics.marginComparison.difference)}
                </div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm">
                    {revisionMetrics.marginComparison.previous.percentage.toFixed(1)}% →
                    <span
                      className={`font-medium ${revisionMetrics.marginComparison.current.percentage >= revisionMetrics.marginComparison.previous.percentage ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {' '}
                      {revisionMetrics.marginComparison.current.percentage.toFixed(1)}%
                    </span>
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t text-sm flex justify-between">
                  <span>
                    Previous: {formatCurrency(revisionMetrics.marginComparison.previous.margin)}
                  </span>
                  <span>
                    Current: {formatCurrency(revisionMetrics.marginComparison.current.margin)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <div className="text-sm text-muted-foreground">Revision Summary</div>
                <div className="text-2xl font-semibold mt-2">{currentItems.length} Items</div>
                <div className="flex items-center mt-1 gap-1">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 hover:bg-green-100"
                  >
                    +
                    {
                      currentItems.filter(
                        i =>
                          !compareItems.some(
                            ci => ci.id === i.id || ci.description === i.description
                          )
                      ).length
                    }{' '}
                    new
                  </Badge>
                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                    -
                    {
                      compareItems.filter(
                        i =>
                          !currentItems.some(
                            ci => ci.id === i.id || ci.description === i.description
                          )
                      ).length
                    }{' '}
                    removed
                  </Badge>
                </div>
                <div className="mt-3 pt-3 border-t text-sm flex justify-between">
                  <span>From V{compareRevision.version}</span>
                  <span>To V{currentRevision.version}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar chart for category differences */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revisionMetrics.categorySummary}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={value => formatCurrency(value)} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <RechartsTooltip
                      formatter={(value: number, name: string) => {
                        return [
                          formatCurrency(value),
                          name === 'difference'
                            ? 'Difference'
                            : name === 'currentValue'
                              ? 'Current'
                              : 'Previous',
                        ];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="previousValue" fill="#94a3b8" name="Previous" />
                    <Bar dataKey="currentValue" fill="#0485ea" name="Current" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table of category changes */}
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      <th className="text-left py-2">Category</th>
                      <th className="text-right py-2">Difference</th>
                      <th className="text-right py-2">% Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisionMetrics.categorySummary.map((category: any, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{category.name}</td>
                        <td
                          className={`text-right py-2 ${category.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {category.difference > 0 ? '+' : ''}
                          {formatCurrency(category.difference)}
                        </td>
                        <td
                          className={`text-right py-2 ${category.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {category.percentChange > 0 ? '+' : ''}
                          {category.percentChange.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCategoryDistribution = () => {
    if (!revisionMetrics.pieChartData) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Revision Pie Chart */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-medium">
                Current Distribution (V{currentRevision?.version})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revisionMetrics.pieChartData.current}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revisionMetrics.pieChartData.current.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Previous Revision Pie Chart */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-medium">
                Previous Distribution (V{compareRevision?.version})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revisionMetrics.pieChartData.compare}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {revisionMetrics.pieChartData.compare.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-[#0485ea]" />
          Financial Impact Analysis
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distribution">Category Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-0">
            {renderFinancialOverview()}
          </TabsContent>

          <TabsContent value="distribution" className="mt-0">
            {renderCategoryDistribution()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RevisionFinancialComparison;
